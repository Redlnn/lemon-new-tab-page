import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFocusStore = defineStore('focus', () => {
  const isFocused = ref(false)
  function focus() {
    isFocused.value = true
  }

  function blur() {
    isFocused.value = false
  }

  return { isFocused, focus, blur }
})
