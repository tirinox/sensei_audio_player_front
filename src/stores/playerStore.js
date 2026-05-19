import {defineStore} from 'pinia';
import {Howl} from 'howler';
import {useTrackListStore} from "@/stores/trackListStore.js";


export const usePlayerStore = defineStore('player', {
    state: () => ({
        currentTrack: null,
        currentPhraseIndex: 1,
        currentPhrasePlaybackSequence: 0,
        currentPhraseProgressMs: 0,
        isPlaying: false,
        _howler: null,
        _currentPlaybackId: null,
        _phraseProgressTimer: null,
        repeatOne: false,
        repeatPauseMs: 1000,
        _repeatTimer: null,
        isLoadingTrack: false,
        isPlayingCurrent: false,
        _playbackRate: +window.localStorage.getItem('playbackRate') || 1.0,
        temporaryPlaybackRate: null,
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
            this.clearRepeatTimer();
            this.clearPhraseProgressTracking(true);
            this._currentPlaybackId = null;

            const tr = await this.fetchTrack(track);
            if (!tr) {
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

            this._howler.on('end', (id) => {
                console.log('Finished playing');
                if (id === this._currentPlaybackId) {
                    this.currentPhraseProgressMs = this.currentPhraseDurationMs;
                    this.clearPhraseProgressTracking(false);
                    this._currentPlaybackId = null;
                }
                this.endPlay();
            });

            this._howler.on('loaderror', (id, error) => {
                console.error('Error loading track:', error);
                this.isLoadingTrack = false;
                this.clearPhraseProgressTracking(true);
                this._currentPlaybackId = null;
            });

            this._howler.on('playerror', (id, error) => {
                console.error('Error playing track:', error);
                this.isLoadingTrack = false;
                this.clearPhraseProgressTracking(false);
                this._currentPlaybackId = null;
            });
        },

        async togglePlayPause() {
            if (this.isPlaying) {
                await this.pauseCurrentPhrase();
            } else {
                await this.resumeCurrentPhrase();
            }
        },

        async stop() {
            await this.pauseCurrentPhrase();
        },

        async pauseCurrentPhrase() {
            this.clearRepeatTimer();
            this.isPlaying = false;
            this.isPlayingCurrent = false;
            this.updateCurrentPhraseProgress(this._currentPlaybackId);
            this.clearPhraseProgressTracking(false);

            if (this._howler) {
                this._howler.pause(this._currentPlaybackId ?? undefined);
            }
        },

        async resumeCurrentPhrase() {
            if (!this._howler) {
                console.error('resumeCurrentPhrase: Howler instance is not initialized');
                return
            }

            this.clearRepeatTimer();

            if (this._currentPlaybackId !== null) {
                this._howler.play(this._currentPlaybackId);
                this.isPlaying = true;
                this.isPlayingCurrent = true;
                this.startPhraseProgressTracking(this._currentPlaybackId, false);
                this.setMediaMetadata()
                return
            }

            await this.playCurrentPhrase();
        },

        async endPlay() {
            this.restorePlaybackRate()

            if (this.repeatOne) {
                this.scheduleRepeatCurrentPhrase();
                return;
            }

            this.isPlaying = false;
            this.isPlayingCurrent = false;
        },

        async prevPhrase() {
            this.clearRepeatTimer();
            this.currentPhraseIndex -= 1
            if (this.currentPhraseIndex < 1) {
                this.currentPhraseIndex = this.totalPhrases;
            }

            await this.playCurrentPhrase();
        },

        async nextPhrase(justShift = false) {
            this.clearRepeatTimer();
            this.currentPhraseIndex += 1;
            if (this.currentPhraseIndex > this.totalPhrases) {
                this.currentPhraseIndex = 1;
            }

            if (!justShift) {
                await this.playCurrentPhrase();
            } else {
                this.clearPhraseProgressTracking(true);
                this._currentPlaybackId = null;
                this.isPlaying = false;
                this.isPlayingCurrent = false;
            }
        },

        async restartTrack() {
            this.clearRepeatTimer();
            this.currentPhraseIndex = 1;
            await this.playCurrentPhrase();
        },

        async playCurrentPhrase() {
            if (!this._howler) {
                console.error('playCurrentPhrase: Howler instance is not initialized');
                return
            }

            const phrase = this.currentPhrase;
            if (phrase) {
                this.clearRepeatTimer();
                this.clearPhraseProgressTracking(true);
                this.currentPhrasePlaybackSequence += 1;
                console.info(`Playing phrase ${this.currentPhraseIndex}/${this.totalPhrases}: ${phrase.text}`);
                this._howler.stop();
                this.isPlaying = true;
                this._currentPlaybackId = this._howler.play(String(this.currentPhraseIndex));
                this.isPlayingCurrent = true
                this.startPhraseProgressTracking(this._currentPlaybackId);

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
                    ]
                });

                navigator.mediaSession.setActionHandler('play', () => {
                    this.resumeCurrentPhrase()
                });

                navigator.mediaSession.setActionHandler('pause', () => {
                    this.pauseCurrentPhrase()
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
            this.clearRepeatTimer();
            this.clearPhraseProgressTracking(true);
            if (this._howler && this._currentPlaybackId !== null) {
                this._howler.stop(this._currentPlaybackId);
            }
            this._currentPlaybackId = null;
            this.currentPhraseIndex = phraseIndex
            if (this.isPlaying) {
                this._howler.stop();
                this.isPlaying = false;
                this.isPlayingCurrent = false;
            }
        },

        setRepeatOne(value) {
            this.repeatOne = typeof value === 'boolean' ? value : !this.repeatOne;

            if (!this.repeatOne) {
                this.clearRepeatTimer();

                if (!this._howler?.playing()) {
                    this.isPlaying = false;
                    this.isPlayingCurrent = false;
                }
            }
        },

        scheduleRepeatCurrentPhrase() {
            this.clearRepeatTimer();

            if (!this.repeatOne) {
                this.isPlaying = false;
                this.isPlayingCurrent = false;
                return;
            }

            this.isPlaying = true;
            this.isPlayingCurrent = true;
            this._repeatTimer = window.setTimeout(() => {
                this._repeatTimer = null;

                if (!this.repeatOne || !this.isPlaying) {
                    return;
                }

                this.playCurrentPhrase();
            }, this.repeatPauseMs);
        },

        clearRepeatTimer() {
            if (this._repeatTimer !== null) {
                window.clearTimeout(this._repeatTimer);
                this._repeatTimer = null;
            }
        },

        updateCurrentPhraseProgress(playbackId = this._currentPlaybackId) {
            if (!this._howler || playbackId === null || !this.currentPhrase) {
                return;
            }

            const seekValue = this._howler.seek(playbackId);
            if (typeof seekValue !== 'number' || Number.isNaN(seekValue)) {
                return;
            }

            const durationSeconds = this.currentPhraseDurationMs / 1000;
            const startSeconds = (this.currentPhrase?.start || 0) / 1000;
            let normalizedSeek = seekValue;

            if (normalizedSeek > durationSeconds + 0.25) {
                normalizedSeek -= startSeconds;
            }

            this.currentPhraseProgressMs = Math.min(
                Math.max(normalizedSeek, 0),
                durationSeconds,
            ) * 1000;
        },

        startPhraseProgressTracking(playbackId, resetProgress = true) {
            if (playbackId === null || playbackId === undefined) {
                return;
            }

            this.clearPhraseProgressTracking(resetProgress);
            this._currentPlaybackId = playbackId;
            this.updateCurrentPhraseProgress(playbackId);

            this._phraseProgressTimer = window.setInterval(() => {
                if (!this._howler || this._currentPlaybackId !== playbackId) {
                    this.clearPhraseProgressTracking(false);
                    return;
                }

                this.updateCurrentPhraseProgress(playbackId);

                if (!this._howler.playing(playbackId)) {
                    this.clearPhraseProgressTracking(false);
                }
            }, 50);
        },

        clearPhraseProgressTracking(resetProgress = false) {
            if (this._phraseProgressTimer !== null) {
                window.clearInterval(this._phraseProgressTimer);
                this._phraseProgressTimer = null;
            }

            if (resetProgress) {
                this.currentPhraseProgressMs = 0;
            }
        },

        setRatePlaybackRate(rate, once = false) {
            if (!this._howler) {
                console.error('setRatePlaybackRate: Howler instance is not initialized');
                return
            }

            this._howler.rate(rate);
            if (!once) {
                this._playbackRate = rate
                console.info(`setRatePlaybackRate: Playback rate set to ${rate}`);
                window.localStorage.setItem('playbackRate', rate);
                this.playCurrentPhrase()
            } else {
                this.temporaryPlaybackRate = rate;
            }
        },

        restorePlaybackRate() {
            this.temporaryPlaybackRate = null;
            this._howler?.rate(this._playbackRate);
            console.log('Restored playback rate to', this._playbackRate);
        }
    },
    getters: {
        currentPhrase() {
            return this.currentTrack.segments[this.currentPhraseIndex - 1];
        },
        currentPhraseDurationMs() {
            if (!this.currentPhrase) {
                return 0;
            }

            return Math.max(this.currentPhrase.end - this.currentPhrase.start, 0);
        },
        currentPhraseProgressPercent() {
            if (!this.currentPhraseDurationMs) {
                return 0;
            }

            return Math.min((this.currentPhraseProgressMs / this.currentPhraseDurationMs) * 100, 100);
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
            const trackListStore = useTrackListStore();
            return trackListStore.dbBaseURL;
        },
        sections() {
            const sections = [];
            const segments = this.currentTrack?.segments || [];

            // 1) Префикс (опционально): 練習A / 練習B / 練習C (можно с пробелом)
            const rePrefix = String.raw`(?:練習\s*[ABC]\s*)?`;

            // 2) Число: ASCII цифры или full-width цифры
            //    - full-width диапазон: ０-９
            const reDigits = String.raw`(?:[0-9]+|[０-９]+)`;

            // 3) Канжи 1..10 (без 11+)
            const reKanji1to10 = String.raw`(?:[一二三四五六七八九十])`;

            // 4) Общий "номер"
            const reNumber = String.raw`(?:${reDigits}|${reKanji1to10})`;

            // 5) Разделитель после номера (опционально): . / ． / 。
            const reSep = String.raw`(?:[.\uFF0E\u3002])?`; // . , fullwidth dot, Japanese 。

            // 6) После номера: пробелы или конец строки
            const reTail = String.raw`(?:\s+|$)`;

            // Итог: начало строки -> (префикс)? -> номер -> (sep)? -> (space|eol)
            const reSectionStart = new RegExp(
                `^\\s*${rePrefix}${reNumber}${reSep}${reTail}`,
                "u"
            );

            for (let i = 0; i < segments.length; i++) {
                const s = segments[i];
                const text = (s.original_text || '').trim();

                if (reSectionStart.test(text)) {
                    sections.push({index: i + 1, text});
                }
            }

            return sections;
        },
    },
})
