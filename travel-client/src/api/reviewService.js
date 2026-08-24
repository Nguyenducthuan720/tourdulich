import apiClient from './client'

const readOne = (payload) => payload?.data || payload

export async function getTourReviews(tourId) {
  try {
    const response = await apiClient.get(`/reviews/tour/${tourId}`)
    return response.data
  } catch (error) {
    console.error('Get tour reviews error:', error)
    throw error
  }
}

export async function createReview(payload) {
  try {
    const response = await apiClient.post('/reviews', payload)
    return readOne(response.data)
  } catch (error) {
    console.error('Create review error:', error)
    throw error
  }
}
