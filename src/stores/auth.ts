// client/src/stores/auth.ts
import { defineStore } from 'pinia'

interface MeResponse {
  authenticated: boolean
  user_id?: string
  email?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    me: null as MeResponse | null,
    loading: false,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.me?.authenticated,
    userEmail: (state) => state.me?.email ?? null,
  },
  actions: {
    async fetchMe() {
      this.loading = true
      try {
        const res = await fetch('/auth/me', {
          credentials: 'include',
        })
        const data = (await res.json()) as MeResponse
        this.me = data
      } catch (err) {
        // on error, treat as logged out
        this.me = { authenticated: false }
      } finally {
        this.loading = false
        this.initialized = true
      }
    },
  },
})