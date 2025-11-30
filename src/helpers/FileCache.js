// FileCache.js
class FileCache {
    /**
     * @param {Object} options
     * @param {string} options.baseURL - Base URL where files live online, e.g. "https://example.com/assets/"
     * @param {string} [options.dbName="file-cache-db"] - IndexedDB name
     * @param {string} [options.storeName="files"] - Object store name
     */
    constructor({ baseURL, dbName = "file-cache-db", storeName = "files" }) {
        if (!baseURL) {
            throw new Error("baseURL is required");
        }
        this.baseURL = baseURL;
        this.dbName = dbName;
        this.storeName = storeName;
        this._dbPromise = null;
    }

    // ---------- Public API ----------

    /**
     * Get a file as a Blob.
     * 1) Try local DB by relativePath
     * 2) If missing, fetch from baseURL + relativePath, store, return
     *
     * @param {string} relativePath - e.g. "audio/lesson1.mp3"
     * @returns {Promise<Blob>}
     */
    async get(relativePath) {
        // 1. Try local cache
        const fromDb = await this._getFromDb(relativePath);
        if (fromDb) return fromDb;

        // 2. Fetch from network
        const url = new URL(relativePath, this.baseURL).toString();
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Failed to fetch ${url}: ${resp.status} ${resp.statusText}`);
        }
        const blob = await resp.blob();

        // 3. Store in DB for future
        await this._putToDb(relativePath, blob);

        return blob;
    }

    /**
     * Convenience: get a file and return an object URL string.
     * Remember to call URL.revokeObjectURL(url) when you’re done.
     *
     * @param {string} relativePath
     * @returns {Promise<string>} object URL
     */
    async getObjectURL(relativePath) {
        const blob = await this.get(relativePath);
        return URL.createObjectURL(blob);
    }

    /**
     * Manually store a file (Blob) under a relative path.
     *
     * @param {string} relativePath
     * @param {Blob} blob
     * @returns {Promise<void>}
     */
    async put(relativePath, blob) {
        await this._putToDb(relativePath, blob);
    }

    /**
     * Delete a cached file.
     *
     * @param {string} relativePath
     * @returns {Promise<void>}
     */
    async delete(relativePath) {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const req = store.delete(relativePath);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Clear all cached files.
     *
     * @returns {Promise<void>}
     */
    async clear() {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    // ---------- Internal helpers (IndexedDB) ----------

    async _openDb() {
        if (this._dbPromise) return this._dbPromise;

        this._dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    // keyPath = relativePath
                    db.createObjectStore(this.storeName, { keyPath: "path" });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });

        return this._dbPromise;
    }

    async _getFromDb(relativePath) {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);
            const req = store.get(relativePath);

            req.onsuccess = () => {
                const record = req.result;
                if (!record) return resolve(null);
                // record = { path, blob, updatedAt }
                resolve(record.blob);
            };
            req.onerror = () => reject(req.error);
        });
    }

    async _putToDb(relativePath, blob) {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const record = {
                path: relativePath,
                blob,
                updatedAt: Date.now(),
            };
            const req = store.put(record);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
}
