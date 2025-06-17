import {defineStore} from 'pinia';


export const useTrackList = defineStore('trackList', {
    state: () => ({
        searchQuery: '',
    }),
    actions: {
    },
    getters: {
        // todo!
        // playlistFiltered: () => {
        //     try {
        //         if (!this.searchQuery) {
        //             return playerStore.playlist;
        //         } else {
        //             const searchQ = this.searchQuery.trim().toLowerCase()
        //             return playerStore.playlist.filter(track => track.title.toLowerCase().includes(searchQ));
        //         }
        //     } catch (e) {
        //         console.error(e)
        //         return []
        //     }
        // },
    },
})
