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
      localStorage.setItem('token', token)
      localStorage.setItem('email', email)
    },
    logout() {
      this.token = null
      this.email = null
      localStorage.removeItem('token')
      localStorage.removeItem('email')

    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token
  }
})
