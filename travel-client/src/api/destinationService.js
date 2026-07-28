import apiClient from './client'

export async function getDestinations() {
  try {
    const response = await apiClient.get('/destinations')
    return response.data || []
  } catch (error) {
    console.error('Get destinations error:', error)
    return []
  }
}
