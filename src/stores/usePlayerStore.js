import {defineStore} from 'pinia';
import {Howl} from 'howler';

const BASE_PATH = import.meta.env.PROD ? '/audio_db' : '/test';
console.info('Audio base path:', BASE_PATH);

export const usePlayerStore = defineStore('player', {
    state: () => ({
        playlist: [],
        currentTrack: null,
        currentPhraseIndex: 1,
        isPlaying: false,
        howler: null,
        repeatOne: false,
        isLoadingTrack: false,
        isLoadingPlaylist: false,
        isPlayingCurrent: false,
    }),
    actions: {
        async fetchPlaylist() {
            try {
                this.isLoadingPlaylist = true;
                const response = await fetch(`${BASE_PATH}/index.json?r=${Math.random()}`);
                const data = await response.json();
                let playlist = data.files;
                console.log(playlist)

                // set id for each track
                playlist.forEach((track, index) => {
                    track.id = index;
                    track.title = track.audio_file;
                });
                this.playlist = playlist;
                if(this.playlist.length > 0) {
                    await this.fetchTrack(0)
                }
                console.info(`Playlist: ${this.playlist.length}`)
            } catch (error) {
                console.error('Error fetching playlist:', error);
            } finally {
                this.isLoadingPlaylist = false;
            }
        },

        async fetchTrack(id) {
            try {
                const desc = this.playlist[id]
                const metaFile = `${BASE_PATH}/${desc.segment_file}?r=${Math.random()}`;
                console.info('Fetching track:', metaFile);
                const response = await fetch(metaFile);
                const t = await response.json();

                Object.assign(t, desc)
                t.title = desc.audio_file;

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
            this.isLoadingTrack = true;

            // if(track.id === this.currentTrack.id) {
            //     console.info('Track already selected');
            //     return;
            // }
            const tr = await this.fetchTrack(track.id);
            this.currentPhraseIndex = 1;
            this.isPlaying = false;
            if (this.howler) {
                this.howler.unload();
            }
            const sprites = {}

            let i = 1
            for (const segment of Object.values(tr.segments)) {
                sprites[i] = [segment.start, segment.end - segment.start];
                i++;
            }

            const audioFile = `${BASE_PATH}/${tr.audio_file}`

            console.log('Will load track:', audioFile);
            this.howler = new Howl({
                src: [audioFile],
                sprite: sprites,
                html5: true,
                onend: () => {
                    console.log('Finished playing');
                    this.endPlay()
                },
                onload: () => {
                    console.log('Loaded');
                    this.isLoadingTrack = false;
                    this.playCurrentPhrase()
                },
                onloaderror: (id, error) => {
                    console.error('Error loading track:', error);
                    this.isLoadingTrack = false;
                },
                onplayerror: (id, error) => {
                    console.error('Error playing track:', error);
                    this.isLoadingTrack = false;
                }

            });
        },

        async togglePlayPause() {
            if (this.isPlaying) {
                this.isPlaying = false;
                this.howler.pause();
            } else {
                await this.playCurrentPhrase();
            }
        },

        async endPlay() {
            this.isPlaying = false;
            if(this.repeatOne) {
                this.nextPhrase(true)
            }
        },

        async prevPhrase() {
            this.currentPhraseIndex -= 1
            if (this.currentPhraseIndex < 1) {
                this.currentPhraseIndex = this.totalPhrases;
            }

            await this.playCurrentPhrase();
            this.isPlayingCurrent = false
        },

        async nextPhrase(justShift = false) {
            this.currentPhraseIndex += 1;
            if (this.currentPhraseIndex > this.totalPhrases) {
                this.currentPhraseIndex = 1;
            }

            if(!justShift) {
                await this.playCurrentPhrase();
                this.isPlayingCurrent = false
            }
        },

        async restartTrack() {
            this.currentPhraseIndex = 1;
            await this.playCurrentPhrase();
        },

        async playCurrentPhrase() {
            const phrase = this.currentPhrase;
            if (phrase) {
                console.info(`Playing phrase ${this.currentPhraseIndex}/${this.totalPhrases}: ${phrase.text}`);
                this.howler.stop();
                this.isPlaying = true;
                this.howler.play(String(this.currentPhraseIndex));
                this.isPlayingCurrent = true
            }
        },

        setPhrase(phraseIndex) {
            console.log('Set phrase:', phraseIndex)
            this.currentPhraseIndex = phraseIndex
            if(this.isPlaying) {
                this.howler.stop();
                this.isPlaying = false;
            }
        }
    },
    getters: {
        currentPhrase() {
            return this.currentTrack.segments[this.currentPhraseIndex - 1];
        },
        totalPhrases() {
            return this.currentTrack.segments.length
        },
        isLoading() {
            return this.isLoadingTrack || this.isLoadingPlaylist
        }
    },
})
