import {defineStore} from 'pinia';
import {usePlayerStore} from "@/stores/playerStore.js";
import router from "@/router/index.js";


const BASE_PATH = '/audio_db'
console.info('Audio base path:', BASE_PATH);

export const useTrackListStore = defineStore('trackList', {
    state: () => ({
        searchQuery: '',
        playlist: [],
        currentTrack: null,
        isLoadingPlaylist: false,
        _currentCode: '',
    }),
    actions: {
        async fetchPlaylist(code) {
            try {
                this._currentCode = code;
                this.isLoadingPlaylist = true;
                const indexFile = `${this.dbBaseURL}/index.json?r=${Math.random()}`
                console.info('Fetching playlist:', indexFile);
                const response = await fetch(indexFile);
                const data = await response.json();

                let playlist = data.files;
                // reverse order in the playlist
                playlist = playlist.reverse();

                console.log(playlist)

                // set id for each track
                playlist.forEach((track, index) => {
                    track.id = index;
                    track.title = track.audio_file;
                });
                this.playlist = playlist;
                if (this.playlist.length > 0) {
                    const playerStore = usePlayerStore();
                    await playerStore.fetchTrack(this.playlist[0], this.dbBaseURL);
                }
                console.info(`Playlist: ${this.playlist.length}`)
                return true
            } catch (error) {
                console.error('Error fetching playlist:', error);
                return false
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
        dbBaseURL() {
            return `${BASE_PATH}/${this._currentCode}`
        },

        playlistFiltered() {
            try {
                if (!this.searchQuery) {
                    return this.playlist;
                } else {
                    const searchQ = this.searchQuery.trim().toLowerCase()
                    return this.playlist.filter(track => track.title.toLowerCase().includes(searchQ));
                }
            } catch (e) {
                console.error(e)
                return []
            }
        },

        isAnyTracksMatching() {
            return this.playlistFiltered.length > 0;
        }
    },
})
