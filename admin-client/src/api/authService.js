import apiClient from './client'

export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password })
  return response.data
}
