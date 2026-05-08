import { reactive } from 'vue'
import { authAPI } from '../api'

export const authStore = reactive({
  user:  JSON.parse(localStorage.getItem('vocabapp_user') || 'null'),
  token: localStorage.getItem('vocabapp_token') || null,

  get isLoggedIn() {
    return this.token !== null && this.user !== null
  },

  setSession(user, token) {
    this.user  = user
    this.token = token
    localStorage.setItem('vocabapp_user',  JSON.stringify(user))
    localStorage.setItem('vocabapp_token', token)
  },

  logout() {
    this.user  = null
    this.token = null
    localStorage.removeItem('vocabapp_user')
    localStorage.removeItem('vocabapp_token')
  },

  async fetchMe() {
    try {
      const res = await authAPI.me()
      this.user = res.data
      localStorage.setItem('vocabapp_user', JSON.stringify(res.data))
    } catch {
      this.logout()
    }
  },
})
