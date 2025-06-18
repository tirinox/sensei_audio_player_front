import {defineStore} from 'pinia';
import {Howl} from 'howler';
import {useTrackList} from "@/stores/useTrackList.js";


export const usePlayerStore = defineStore('player', {
    state: () => ({
        currentTrack: null,
        currentPhraseIndex: 1,
        isPlaying: false,
        _howler: null,
        repeatOne: false,
        isLoadingTrack: false,
        isPlayingCurrent: false,
        _playbackRate: +window.localStorage.getItem('playbackRate') || 1.0,
    }),
    actions: {
        async fetchTrack(track) {
            try {
                const segmentFile = track['segment_file']
                const audioFile = track['audio_file']
                const metaFile = `${this.currentDbBaseURL}/${segmentFile}?r=${Math.random()}`;
                console.info('Fetching track:', metaFile);
                const response = await fetch(metaFile);
                const t = await response.json();

                Object.assign(t, track)
                t.title = track['title'] || audioFile;

                const newSegments = []
                let i = 1
                for (let s of Object.values(t.segments)) {
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
                console.error('Error fetching track:');
                console.error(error);
            }
        },

        async selectTrack(track) {
            this.isLoadingTrack = true;

            const tr = await this.fetchTrack(track);
            if(!tr) {
                console.error(`Error fetching track ${track.title}`);
                return;
            }

            this.currentPhraseIndex = 1;
            this.isPlaying = false;
            if (this._howler) {
                this._howler.unload();
            }
            const sprites = {}

            let i = 1
            for (const segment of Object.values(tr.segments)) {
                sprites[i] = [segment.start, segment.end - segment.start];
                i++;
            }

            const audioFile = `${this.currentDbBaseURL}/${tr.audio_file}`

            console.log('Will load track:', audioFile);
            this._howler = new Howl({
                src: [audioFile],
                sprite: sprites,
                html5: true,
            });
            this._howler.rate(this._playbackRate);

            this._howler.on('load', () => {
                console.log('Loaded');
                this.isLoadingTrack = false;
                this.playCurrentPhrase();
            });

            this._howler.on('end', () => {
                console.log('Finished playing');
                this.endPlay();
            });

            this._howler.on('loaderror', (id, error) => {
                console.error('Error loading track:', error);
                this.isLoadingTrack = false;
            });

            this._howler.on('playerror', (id, error) => {
                console.error('Error playing track:', error);
                this.isLoadingTrack = false;
            });
        },

        async togglePlayPause() {
            if (this.isPlaying) {
                await this.stop();
            } else {
                await this.playCurrentPhrase();
            }
        },

        async stop() {
            this.isPlaying = false;
            if(this._howler) {
                this._howler.pause();
            }
        },

        async endPlay() {
            this.isPlaying = false;
            if (this.repeatOne) {
                await this.nextPhrase(true)
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

            if (!justShift) {
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
                this._howler.stop();
                this.isPlaying = true;
                this._howler.play(String(this.currentPhraseIndex));
                this.isPlayingCurrent = true

                this.setMediaMetadata()
            }
        },

        setMediaMetadata() {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: this.currentPhrase.text,
                    artist: "Japanese Audio Player",
                    album: this.currentTrack.title,
                    artwork: [
                        {src: 'icon-192.png', sizes: '192x192', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '128x128', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '192x192', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '256x256', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '384x384', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '512x512', type: 'image/png'},
                    ]
                });
            }
        },

        clearMediaSession() {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = null;
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            }
        },

        setupMediaSession() {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: this.currentPhrase.text,
                    artist: "Japanese Audio Player",
                    album: this.currentTrack.title,
                    artwork: [
                        {src: 'icon-192.png', sizes: '192x192', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '128x128', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '192x192', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '256x256', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '384x384', type: 'image/png'},
                        // {src: playerStore.currentTrack.cover, sizes: '512x512', type: 'image/png'},
                    ]
                });

                navigator.mediaSession.setActionHandler('play', () => {
                    this.playCurrentPhrase()
                });

                navigator.mediaSession.setActionHandler('pause', () => {
                    this.stop()
                });

                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    this.prevPhrase()
                });

                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    this.nextPhrase()
                });
            }
        },

        setPhrase(phraseIndex) {
            console.log('Set phrase:', phraseIndex)
            this.currentPhraseIndex = phraseIndex
            if (this.isPlaying) {
                this._howler.stop();
                this.isPlaying = false;
            }
        },

        setRatePlaybackRate(rate) {
            if (this._howler) {
                this._playbackRate = rate
                window.localStorage.setItem('playbackRate', rate);
                this._howler.rate(rate);
                console.info(`setRatePlaybackRate: Playback rate set to ${rate}`);
                this.playCurrentPhrase()
            } else {
                console.error('setRatePlaybackRate: Howler instance is not initialized');
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
            return this.isLoadingTrack
        },
        playbackRate() {
            return this._playbackRate;
        },
        title() {
            const title = this.currentTrack ? this.currentTrack.title : 'Проигрыватель'
            // remove "lb_" from the beginning of the title
            return title.replace(/^lb_/, '').trim();
        },
        currentDbBaseURL() {
            const trackListStore = useTrackList();
            return trackListStore.dbBaseURL;
        }
    },
})
