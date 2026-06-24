import {defineStore} from 'pinia';
import {clearAccessCode} from "@/helpers/playlistByCode.js";
import {getListenStatsByCode, incrementListenStat} from "@/helpers/listenStatsDb.js";

export const useListenStatsStore = defineStore('listenStats', {
    state: () => ({
        statsByCode: {},
    }),
    actions: {
        async loadForCode(accessCode) {
            const normalizedCode = clearAccessCode(accessCode);
            if (!normalizedCode) {
                return {};
            }

            const stats = await getListenStatsByCode(normalizedCode);
            this.statsByCode = {
                ...this.statsByCode,
                [normalizedCode]: stats,
            };

            return stats;
        },

        async addTrackListen({accessCode, audioFile, amount}) {
            const normalizedCode = clearAccessCode(accessCode);
            if (!normalizedCode) {
                throw new Error('Access code is required to update listen stats');
            }
            if (!audioFile) {
                throw new Error('Audio file is required to update listen stats');
            }

            const numericAmount = Number(amount);
            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                throw new Error(`Listen amount must be a positive number, received: ${amount}`);
            }

            const nextCount = await incrementListenStat(normalizedCode, audioFile, numericAmount);
            this.statsByCode = {
                ...this.statsByCode,
                [normalizedCode]: {
                    ...(this.statsByCode[normalizedCode] || {}),
                    [audioFile]: nextCount,
                },
            };

            return nextCount;
        },
    },
    getters: {
        getTrackListenCount() {
            return (accessCode, audioFile) => {
                const normalizedCode = clearAccessCode(accessCode);
                if (!normalizedCode || !audioFile) {
                    return 0;
                }

                return this.statsByCode[normalizedCode]?.[audioFile] || 0;
            };
        },
    },
})
