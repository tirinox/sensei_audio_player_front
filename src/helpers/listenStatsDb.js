const DB_NAME = 'sensei-audio-player-db';
const DB_VERSION = 1;
const STORE_NAME = 'track-listen-stats';
const ACCESS_CODE_INDEX = 'accessCode';

function buildStatKey(accessCode, audioFile) {
    return `${accessCode}::${audioFile}`;
}

function openListenStatsDb() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this browser'));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            const store = database.objectStoreNames.contains(STORE_NAME)
                ? request.transaction.objectStore(STORE_NAME)
                : database.createObjectStore(STORE_NAME, {keyPath: 'id'});

            if (!store.indexNames.contains(ACCESS_CODE_INDEX)) {
                store.createIndex(ACCESS_CODE_INDEX, ACCESS_CODE_INDEX, {unique: false});
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Failed to open listen stats database'));
    });
}

function runTransaction(mode, handler) {
    return openListenStatsDb().then(database => {
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, mode);
            const store = transaction.objectStore(STORE_NAME);

            let result;
            try {
                result = handler(store, transaction);
            } catch (error) {
                database.close();
                reject(error);
                return;
            }

            transaction.oncomplete = () => {
                database.close();
                resolve(result);
            };
            transaction.onerror = () => {
                database.close();
                reject(transaction.error || new Error('Listen stats transaction failed'));
            };
            transaction.onabort = () => {
                database.close();
                reject(transaction.error || new Error('Listen stats transaction aborted'));
            };
        });
    });
}

export async function getListenStatsByCode(accessCode) {
    return runTransaction('readonly', (store) => {
        const request = store.index(ACCESS_CODE_INDEX).getAll(accessCode);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const items = Array.isArray(request.result) ? request.result : [];
                const stats = items.reduce((accumulator, item) => {
                    if (typeof item?.audioFile === 'string' && typeof item?.count === 'number') {
                        accumulator[item.audioFile] = item.count;
                    }

                    return accumulator;
                }, {});

                resolve(stats);
            };
            request.onerror = () => reject(request.error || new Error('Failed to read listen stats'));
        });
    });
}

export async function incrementListenStat(accessCode, audioFile, amount) {
    return runTransaction('readwrite', (store) => {
        const id = buildStatKey(accessCode, audioFile);
        const readRequest = store.get(id);

        return new Promise((resolve, reject) => {
            readRequest.onsuccess = () => {
                const currentItem = readRequest.result;
                const currentCount = typeof currentItem?.count === 'number' ? currentItem.count : 0;
                const nextCount = currentCount + amount;
                const writeRequest = store.put({
                    id,
                    accessCode,
                    audioFile,
                    count: nextCount,
                });

                writeRequest.onsuccess = () => resolve(nextCount);
                writeRequest.onerror = () => reject(writeRequest.error || new Error('Failed to update listen stat'));
            };
            readRequest.onerror = () => reject(readRequest.error || new Error('Failed to read current listen stat'));
        });
    });
}
