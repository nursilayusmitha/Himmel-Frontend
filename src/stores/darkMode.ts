import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useDarkModeStore = defineStore('darkMode', () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const darkMode = useStorage('darkMode', prefersDark)

  // Watch perubahan dan set class
  watch(darkMode, (newVal) => {
    document.documentElement.classList.toggle('dark', newVal)
  }, { immediate: true })

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  return { darkMode, toggleDarkMode }
})
