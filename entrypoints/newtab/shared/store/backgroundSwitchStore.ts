import { defineStore } from 'pinia'

export const useBgSwtichStore = defineStore('bgSwitching', () => {
  // 每次打开未加载前都是白屏，应为true
  const isSwitching = ref(true)

  const start = () => {
    isSwitching.value = true
  }

  const end = () => {
    isSwitching.value = false
  }

  return { isSwitching, start, end }
})
