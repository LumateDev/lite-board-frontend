import { defineStore } from 'pinia'

interface UserState {
  token: string | null
  email: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('accessToken') || null,
    email: localStorage.getItem('email') || null
  }),
  actions: {
    login(token: string, email: string) {
      this.token = token
      this.email = email
      localStorage.setItem('accessToken', token)
      localStorage.setItem('email', email)
    },
    logout() {
      this.token = null
      this.email = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('email')

    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token
  }
})
