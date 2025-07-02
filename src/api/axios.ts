import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://89.104.68.136:8080',
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: 'http://89.104.68.136:8080',
  withCredentials: true,
})

const refreshAccessToken = async () => {
  const response = await refreshClient.get('/auth/refresh')
  const newAccessToken = response.data.accessToken
  localStorage.setItem('accessToken', newAccessToken)
  return newAccessToken
}

// ⬅️ Добавим актуальный токен в каждый запрос
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ⬅️ Обработка 401 и рефреш токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)
