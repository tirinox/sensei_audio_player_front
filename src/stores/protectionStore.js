import {defineStore} from 'pinia';
import router from "@/router/index.js";
import {useTrackListStore} from "@/stores/trackListStore.js";
import {clearAccessCode} from "@/helpers/playlistByCode.js";


const CURRENT_ACCESS_CODE_KEY = 'userAccessCode';
const RECENT_ACCESS_CODES_KEY = 'recentAccessCodes';
const RECENT_ACCESS_CODES_LIMIT = 5;

function readRecentAccessCodes() {
    const rawValue = window.localStorage.getItem(RECENT_ACCESS_CODES_KEY);

    if (!rawValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(rawValue);
        if (!Array.isArray(parsedValue)) {
            return [];
        }

        return parsedValue.filter(item => {
            return typeof item?.accessCode === 'string'
                && item.accessCode
                && typeof item.trackCount === 'number';
        });
    } catch (error) {
        console.error('Error reading recent access codes:', error);
        return [];
    }
}

export const useAccess = defineStore('userAccess', {
    state: () => ({
        accessCode: window.localStorage.getItem(CURRENT_ACCESS_CODE_KEY) || '',
        recentAccessCodes: readRecentAccessCodes(),
        accessGranted: false,
        isLoading: true,
        appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
    }),
    actions: {
        _saveAccessCode(accessCode) {
            this.accessCode = accessCode;
            // save to local storage
            window.localStorage.setItem(CURRENT_ACCESS_CODE_KEY, accessCode);
        },

        _saveRecentAccessCode(accessCode, trackCount) {
            const nextRecentAccessCodes = [
                {
                    accessCode,
                    trackCount,
                },
                ...this.recentAccessCodes.filter(item => item.accessCode !== accessCode),
            ].slice(0, RECENT_ACCESS_CODES_LIMIT);

            this.recentAccessCodes = nextRecentAccessCodes;
            window.localStorage.setItem(RECENT_ACCESS_CODES_KEY, JSON.stringify(nextRecentAccessCodes));
        },

        async submitAccessCode(accessCode) {
            this.isLoading = true;
            console.log(`Submitting access code: ${accessCode}`);
            try {
                const trackListStore = useTrackListStore();
                accessCode = clearAccessCode(accessCode);
                const result = await trackListStore.fetchPlaylist(accessCode);
                if (result.success) {
                    this._saveAccessCode(result.code);
                    this._saveRecentAccessCode(result.code, result.trackCount);
                    this.accessGranted = true;
                    // redirect to player page
                    router.replace({ name: 'playlist' })
                } else {
                    this.accessGranted = false;
                }
                return result.success;
            }
            finally {
                this.isLoading = false;
                console.log(`Access code submission completed: ${accessCode}`);
            }
        },

       async loadOnStart() {
            const routeQuery = router.currentRoute?.value?.query || {};
            const queryCode = (routeQuery.accessCode || routeQuery.code || '').toString();
            if (queryCode) {
                await this.submitAccessCode(queryCode);
            } else if (this.accessCode) {
                await this.submitAccessCode(this.accessCode);
            } else {
                this.isLoading = false;
                this.accessGranted = false;
            }
        },

        exit() {
            this._saveAccessCode('');
            this.accessGranted = false;
            router.replace({ name: 'login' })
        }
    },
    getters: {
        accessRequired() {
            return !this.accessGranted;
        },
        loginWindowVisible() {
            return this.accessRequired && !this.isLoading;
        },
    },
})
