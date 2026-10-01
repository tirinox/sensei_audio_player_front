export const SHORT_TAP_MAX_DURATION = 0.17;
export const LONG_TAP_MAX_DURATION = 2.0;
export const MAX_SLOW_RATE = 0.5;

export function slowdownRate(seconds) {
    const clampedSeconds = Math.min(
        Math.max(seconds, SHORT_TAP_MAX_DURATION),
        LONG_TAP_MAX_DURATION,
    );

    return 1 - (clampedSeconds - SHORT_TAP_MAX_DURATION) /
        (LONG_TAP_MAX_DURATION - SHORT_TAP_MAX_DURATION) * (1 - MAX_SLOW_RATE);
}
