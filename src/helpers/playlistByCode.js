const BASE_PATH = '/audio_db'

export function clearAccessCode(code = '') {
    return code.trim().toUpperCase();
}

function normalizePlaylist(files) {
    const playlist = Array.isArray(files) ? [...files].reverse() : [];

    playlist.forEach((track, index) => {
        track.id = index;
        track.title = track.audio_file;
    });

    return playlist;
}

export async function fetchPlaylistByCode(code) {
    const normalizedCode = clearAccessCode(code);

    if (!normalizedCode) {
        return {
            success: false,
            error: new Error('Access code is required'),
            code: normalizedCode,
            trackCount: 0,
        };
    }

    const dbBaseURL = `${BASE_PATH}/${normalizedCode}`;
    const indexFile = `${dbBaseURL}/index.json?r=${Math.random()}`;

    try {
        console.info('Fetching playlist:', indexFile);
        const response = await fetch(indexFile);

        if (!response.ok) {
            return {
                success: false,
                error: new Error(`Failed to fetch playlist: ${response.status}`),
                code: normalizedCode,
                trackCount: 0,
            };
        }

        const data = await response.json();
        const playlist = normalizePlaylist(data?.files);

        return {
            success: true,
            code: normalizedCode,
            playlist,
            dbBaseURL,
            trackCount: playlist.length,
        };
    } catch (error) {
        console.error('Error fetching playlist:', error);

        return {
            success: false,
            error,
            code: normalizedCode,
            trackCount: 0,
        };
    }
}
