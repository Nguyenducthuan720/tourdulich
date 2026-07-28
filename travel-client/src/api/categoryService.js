import apiClient from './client'

export async function getCategories() {
  try {
    const response = await apiClient.get('/categories')
    return response.data?.data || []
  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

export async function getToursByCategory(categoryId, params = {}) {
  try {
    const response = await apiClient.get(`/categories/${categoryId}/tours`, { params })
    return response.data?.data || []
  } catch (error) {
    console.error('Get tours by category error:', error)
    return []
  }
}
