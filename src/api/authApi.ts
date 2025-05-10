import { apiClient } from './axios'



export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password })
  console.log(response)
  return response.data // → { accessToken, email }
}

export async function register(email: string, password: string) {
  const response = await apiClient.post('/auth/register', { email, password })
  return response.data // → { accessToken, email }
}

