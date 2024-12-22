import {defineStore} from 'pinia';
import {usePlayerStore} from "@/stores/usePlayerStore.js";


const LOCAL_STORAGE_KEY = 'userAccessCode';

function clearAccessCode(code) {
    return code.trim().toUpperCase();
}

export const useAccess = defineStore('userAccess', {
    state: () => ({
        accessCode: window.localStorage.getItem(LOCAL_STORAGE_KEY) || '',
        accessGranted: false,
    }),
    actions: {
        _saveAccessCode(accessCode) {
            this.accessCode = accessCode;
            // save to local storage
            window.localStorage.setItem(LOCAL_STORAGE_KEY, accessCode);
        },

        async submitAccessCode(accessCode) {
            accessCode = clearAccessCode(accessCode);

            const playerStore = usePlayerStore();
            const result = await playerStore.fetchPlaylist(accessCode);
            if(result) {
                this._saveAccessCode(accessCode);
                this.accessGranted = true;
            }
            return result;
        },

        async loadOnStart() {
            if(this.accessCode) {
                await this.submitAccessCode(this.accessCode);
            }
        },

        exit() {
            this._saveAccessCode('');
            this.accessGranted = false;
        }
    },
    getters: {
        accessRequired() {
            return !this.accessGranted;
        }
    },
})
