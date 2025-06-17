import {defineStore} from 'pinia';
import {usePlayerStore} from "@/stores/usePlayerStore.js";
import router from "@/router/index.js";


const LOCAL_STORAGE_KEY = 'userAccessCode';

function clearAccessCode(code) {
    return code.trim().toUpperCase();
}

export const useAccess = defineStore('userAccess', {
    state: () => ({
        accessCode: window.localStorage.getItem(LOCAL_STORAGE_KEY) || '',
        accessGranted: false,
        isLoading: true,
    }),
    actions: {
        _saveAccessCode(accessCode) {
            this.accessCode = accessCode;
            // save to local storage
            window.localStorage.setItem(LOCAL_STORAGE_KEY, accessCode);
        },

        async submitAccessCode(accessCode) {
            this.isLoading = true;
            console.log(`Submitting access code: ${accessCode}`);
            try {
                const playerStore = usePlayerStore();
                accessCode = clearAccessCode(accessCode);
                const result = await playerStore.fetchPlaylist(accessCode);
                if (result) {
                    this._saveAccessCode(accessCode);
                    this.accessGranted = true;
                    // redirect to player page
                    router.replace({ name: 'playlist' })
                }
                return result;
            }
            finally {
                this.isLoading = false;
                console.log(`Access code submission completed: ${accessCode}`);
            }
        },

        async loadOnStart() {
            if(this.accessCode) {
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
