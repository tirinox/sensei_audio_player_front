import {defineStore} from 'pinia';
import {Howl} from 'howler';

// const BASE_PATH = import.meta.env.PROD ? '/audio_db' : '/test';
const BASE_PATH = '/audio_db'
console.info('Audio base path:', BASE_PATH);


export const usePlayerStore = defineStore('player', {
    state: () => ({
        playlist: [],
        currentTrack: null,
        currentPhraseIndex: 1,
        isPlaying: false,
        _howler: null,
        repeatOne: false,
        isLoadingTrack: false,
        isLoadingPlaylist: false,
        isPlayingCurrent: false,
        _currentCode: '',
    }),
    actions: {
        async fetchPlaylist(code) {
            try {
                this._currentCode = code;
                this.isLoadingPlaylist = true;
                const indexFile = `${this._dbBaseURL}/index.json?r=${Math.random()}`
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
                    await this.fetchTrack(0)
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

        async fetchTrack(id) {
            try {
                const desc = this.playlist[id]
                const segmentFile = desc['segment_file']
                const audioFile = desc['audio_file']
                const metaFile = `${this._dbBaseURL}/${segmentFile}?r=${Math.random()}`;
                console.info('Fetching track:', metaFile);
                const response = await fetch(metaFile);
                const t = await response.json();

                Object.assign(t, desc)
                t.title = desc['title'] || audioFile;

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
                console.error('Error fetching track:', error);
            }
        },

        async selectTrack(track) {
            this.isLoadingTrack = true;

            const tr = await this.fetchTrack(track.id);
            if(!tr) {
                console.error(`Error fetching track ${track.id}`);
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

            const audioFile = `${this._dbBaseURL}/${tr.audio_file}`

            console.log('Will load track:', audioFile);
            this._howler = new Howl({
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

        async repeatCurrent() {
            await this.stop()
            await this.playCurrentPhrase();
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
        },
        _dbBaseURL() {
            return`${BASE_PATH}/${this._currentCode}`
        }
    },
})
