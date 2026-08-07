import apiClient from './client'

export async function getProfile() {
  const response = await apiClient.get('/users/profile')
  return response.data
}

export async function updateProfile(payload) {
  const response = await apiClient.put('/users/profile', payload)
  return response.data
}

export async function changePassword(payload) {
  const response = await apiClient.put('/users/profile/password', payload)
  return response.data
}
