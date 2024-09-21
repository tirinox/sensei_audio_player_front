import {defineStore} from 'pinia';


const LOCAL_STORAGE_KEY = 'userAccessCode';
const CODE = 'JPXLR'

function clearAccessCode(code) {
    return code.trim().toUpperCase();
}

export const useAccess = defineStore('userAccess', {
    state: () => ({
        accessCode: window.localStorage.getItem(LOCAL_STORAGE_KEY) || '',
    }),
    actions: {
        validateAccessCode(accessCode) {
            return clearAccessCode(accessCode) === CODE;
        },

        submitAccessCode(accessCode) {
            accessCode = clearAccessCode(accessCode);
            if(accessCode === CODE) {
                this.accessCode = accessCode;
                // save to local storage
                window.localStorage.setItem(LOCAL_STORAGE_KEY, accessCode);

                return true;
            }
        },
    },
    getters: {
        accessGranted() {
            return this.accessCode === CODE;
        },
        accessRequired() {
            return !this.accessGranted;
        }
    },
})
