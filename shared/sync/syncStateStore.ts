import { defineStore } from 'pinia'

export const useSyncStateStore = defineStore('syncState', {
  state: () => {
    return {
      syncing: false
    }
  }
})
