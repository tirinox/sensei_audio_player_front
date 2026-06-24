import {defineStore} from 'pinia';
import {usePlayerStore} from "@/stores/playerStore.js";
import router from "@/router/index.js";
import {fetchPlaylistByCode} from "@/helpers/playlistByCode.js";
import {useListenStatsStore} from "@/stores/listenStatsStore.js";

export const useTrackListStore = defineStore('trackList', {
    state: () => ({
        searchQuery: '',
        playlist: [],
        currentTrack: null,
        isLoadingPlaylist: false,
        _currentCode: '',
    }),
    actions: {
        async fetchPlaylist(code = this._currentCode) {
            try {
                this.isLoadingPlaylist = true;
                const result = await fetchPlaylistByCode(code);
                if (!result.success) {
                    return result;
                }

                this._currentCode = result.code;
                const listenStatsStore = useListenStatsStore();
                await listenStatsStore.loadForCode(result.code);
                this.playlist = result.playlist;
                if (this.playlist.length > 0) {
                    const playerStore = usePlayerStore();
                    await playerStore.fetchTrack(this.playlist[0], this.dbBaseURL);
                }
                console.info(`Playlist len: ${this.playlist.length}`)
                return result
            } catch (error) {
                console.error('Error fetching playlist:', error);
                return {
                    success: false,
                    error,
                    code: this._currentCode,
                    trackCount: 0,
                }
            } finally {
                this.isLoadingPlaylist = false;
            }
        },

        async selectTrack(track) {
            if (!track || !track.audio_file) {
                console.warn("Invalid track selected:", track);
                return;
            }

            const playerStore = usePlayerStore();
            await playerStore.selectTrack(track, this.dbBaseURL);
            router.push('/player');
        },

        async pickRandom() {
            if (this.playlist.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.playlist.length);
                const randomTrack = this.playlist[randomIndex];
                await this.selectTrack(randomTrack);
            } else {
                console.warn("Playlist is empty, cannot pick a random track.");
            }
        },

    },
    getters: {
        currentCode() {
            return this._currentCode;
        },

        dbBaseURL() {
            return `/audio_db/${this._currentCode}`
        },

        playlistFiltered() {
            try {
                if (!this.searchQuery) {
                    return this.playlist;
                } else {
                    const searchQ = this.searchQuery.trim().toLowerCase()
                    return this.playlist.filter(track => {
                        return track.title.toLowerCase().includes(searchQ) || track.digest?.toLowerCase().includes(searchQ)
                    });
                }
            } catch (e) {
                console.error(e)
                return []
            }
        },

        playlistFilteredWithStats() {
            const listenStatsStore = useListenStatsStore();

            return this.playlistFiltered.map(track => ({
                ...track,
                listenCount: listenStatsStore.getTrackListenCount(this._currentCode, track.audio_file),
            }));
        },

        isAnyTracksMatching() {
            return this.playlistFiltered.length > 0;
        }
    },
})
