import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vocabapp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth endpoints
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  me:       ()      => api.get('/auth/me'),
}

// Words endpoints
export const wordsAPI = {
  getAll: () => api.get('/words'),
}

// Progress endpoints
export const progressAPI = {
  get:        ()         => api.get('/progress'),
  update:     (knownIds) => api.put('/progress', { knownIds }),
  saveResult: (correct, total) => api.post('/progress/quiz-result', { correct, total }),
}

export default api
