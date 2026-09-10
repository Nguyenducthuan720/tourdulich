import apiClient from './client'

const readList = (payload) => payload?.items || payload?.data?.items || payload?.data || payload || []
const readOne = (payload) => payload?.data || payload

export async function getTours(params = {}) {
  try {
    const response = await apiClient.get('/tours', { params })
    return readList(response.data)
  } catch (error) {
    console.error('Get tours error:', error)
    throw error
  }
}

export async function getTourById(id) {
  try {
    const response = await apiClient.get(`/tours/${id}`)
    return readOne(response.data)
  } catch (error) {
    console.error('Get tour by id error:', error)
    throw error
  }
}
