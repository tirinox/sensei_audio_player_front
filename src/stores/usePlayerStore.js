import {defineStore} from 'pinia';
import {Howl} from 'howler';

export const usePlayerStore = defineStore('player', {
    state: () => ({
        playlist: [],
        currentTrack: null,
        currentPhraseIndex: 0,
        isPlaying: false,
        howler: null,
    }),
    actions: {
        async fetchPlaylist() {
            try {
                const response = await fetch('/test/index.json');
                const data = await response.json();
                let playlist = data.playlist;

                // set id for each track
                playlist.forEach((track, index) => {
                    track.id = index;
                });
                this.playlist = playlist;
                if(this.playlist.length > 0) {
                    await this.fetchTrack(0)
                }
                console.info(`Playlist: ${this.playlist.length}`)
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        },

        async fetchTrack(id) {
            try {
                const desc = this.playlist[id]
                const response = await fetch(desc.meta_url);
                const t = await response.json();

                t.title = desc.title;
                t.audio_url = desc.audio_url;

                const newSegments = []
                let i = 1
                for(let s of Object.values(t.segments)) {
                    newSegments.push({
                        ...s,
                        id: i,
                    })
                    ++i
                }
                t.segments = newSegments

                this.currentTrack = t;
                console.info(`Track: ${t.title} (${t.filename}) contains ${t.total_segments} phrases`);
                return t
            } catch (error) {
                console.error('Error fetching track:', error);
            }
        },

        async selectTrack(track) {
            if(track.id === this.currentTrack.id) {
                console.info('Track already selected');
                return;
            }
            const tr = await this.fetchTrack(track.id);
            this.currentPhraseIndex = 0;
            this.isPlaying = false;
            if (this.howler) {
                this.howler.unload();
            }
            const sprites = {}

            let i = 0
            for (const segment of Object.values(tr.segments)) {
                sprites[i] = [segment.start, segment.end - segment.start];
                i++;
            }
            console.log(sprites)

            console.log('Will load track:',tr.audio_url);
            this.howler = new Howl({
                src: [tr.audio_url],
                sprite: sprites,
                html5: true,
                onend: () => {
                    console.log('Finished playing');
                    this.endPlay()
                },
                onload: () => {
                    console.log('Loaded');
                },
                onloaderror: (id, error) => {
                    console.error('Error loading track:', error);
                },
            });
        },

        async togglePlayPause() {
            if (this.isPlaying) {
                this.howler.pause();
            } else {
                await this.playCurrentPhrase();
            }
            this.isPlaying = !this.isPlaying;
        },

        async endPlay() {
            this.isPlaying = false;
        },

        async prevPhrase() {
            this.currentPhraseIndex = (this.currentPhraseIndex - 1 + this.totalPhrases) % this.totalPhrases;
            await this.playCurrentPhrase();
        },

        async nextPhrase() {
            this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.totalPhrases;
            await this.playCurrentPhrase();
        },

        async restartTrack() {
            this.currentPhraseIndex = 0;
            await this.playCurrentPhrase();
        },

        async playCurrentPhrase() {
            const phrase = this.currentPhrase;
            if (phrase) {
                console.info(`Playing phrase ${this.currentPhraseIndex + 1}/${this.totalPhrases}: ${phrase.text}`);
                this.howler.stop();
                this.isPlaying = true;
                this.howler.play(String(this.currentPhraseIndex));
            }
        }
    },
    getters: {
        currentPhrase() {
            return this.currentTrack.segments[this.currentPhraseIndex];
        },
        totalPhrases() {
            return this.currentTrack.segments.length
        }
    },
})
