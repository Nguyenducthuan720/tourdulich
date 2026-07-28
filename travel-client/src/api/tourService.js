import apiClient from './client'
import { fallbackTours } from '../data/mockData'

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

export async function createTour(payload) {
  try {
    const response = await apiClient.post('/admin/tours', payload)
    return readOne(response.data)
  } catch (error) {
    console.error('Create tour error:', error)
    throw error
  }
}

export async function updateTour(id, payload) {
  try {
    const response = await apiClient.put(`/admin/tours/${id}`, payload)
    return readOne(response.data)
  } catch (error) {
    console.error('Update tour error:', error)
    throw error
  }
}

export async function deleteTour(id) {
  try {
    const response = await apiClient.delete(`/admin/tours/${id}`)
    return readOne(response.data)
  } catch (error) {
    console.error('Delete tour error:', error)
    throw error
  }
}
