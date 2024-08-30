import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFocusStore = defineStore('focus', () => {
  const isFocused = ref(false)
  const focus = () => {
    isFocused.value = true
  }

  const blur = () => {
    isFocused.value = false
  }

  return { isFocused, focus, blur }
})
