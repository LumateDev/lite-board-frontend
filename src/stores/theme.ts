import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: localStorage.getItem('theme') === 'dark'
  }),
  actions: {
    toggleTheme(newVal?: boolean) {
      this.isDark = typeof newVal === 'boolean' ? newVal : !this.isDark
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})
