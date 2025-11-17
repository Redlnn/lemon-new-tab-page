import { defineStore } from 'pinia'

export const useBgSwtichStore = defineStore('bgSwitching', () => {
  const isSwitching = ref(false)

  const start = () => {
    isSwitching.value = true
  }

  const end = () => {
    isSwitching.value = false
  }

  return { isSwitching, start, end }
})
