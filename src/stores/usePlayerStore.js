import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
    state: () => ({
        playlist: [],
        currentTrack: null,
        currentPhraseIndex: 0,
        isPlaying: false,
    }),
    actions: {
        async fetchPlaylist() {
            try {
                // const response = await fetch('/api/playlist');
                // const data = await response.json();
                const data = [
                    {
                        'id': 1,
                        'url': 'test/sumo.mp3',
                        'title': 'Sumo',
                    }
                ]
                this.playlist = data;
                console.info(`Playlist: ${this.playlist.length}`)
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        },

        setPhraseIndex(index) {
            this.currentPhraseIndex = index;
        },

        togglePlayState() {
            this.isPlaying = !this.isPlaying;
        },
    },
})
