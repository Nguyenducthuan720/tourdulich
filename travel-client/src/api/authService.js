import apiClient from './client'

const normalizeAuth = (payload) => payload?.data || payload

export async function loginUser(credentials) {
  try {
    const response = await apiClient.post('/auth/login', credentials)
    const result = normalizeAuth(response.data)
    
    // Lưu token vào localStorage
    if (result.token) {
      localStorage.setItem('travel_token', result.token)
    }
    
    return result
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export async function registerUser(payload) {
  try {
    const response = await apiClient.post('/auth/register', payload)
    const result = normalizeAuth(response.data)
    
    // Lưu token vào localStorage
    if (result.token) {
      localStorage.setItem('travel_token', result.token)
    }
    
    return result
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
}

export async function getProfile() {
  try {
    const response = await apiClient.get('/users/profile')
    return normalizeAuth(response.data)
  } catch (error) {
    console.error('Get profile error:', error)
    throw error
  }
}

export function logout() {
  localStorage.removeItem('travel_token')
}
