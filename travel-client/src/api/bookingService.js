import apiClient from './client'
import { fallbackBookings } from '../data/mockData'

const readList = (payload) => payload?.items || payload?.data?.items || payload?.data || payload || []
const readOne = (payload) => payload?.data || payload

export async function createBooking(payload) {
  try {
    const endpoint = payload.flightId ? '/bookings/combo' : '/bookings'
    const response = await apiClient.post(endpoint, payload)
    return readOne(response.data)
  } catch (error) {
    console.error('Create booking error:', error)
    throw error
  }
}
export async function createFlightBooking(payload) {
  const response = await apiClient.post('/bookings/flight', payload)
  return readOne(response.data)
}
export async function getFlights() {
  const response = await apiClient.get('/bookings/flights')
  return response.data
}

export async function getMyBookings() {
  try {
    const response = await apiClient.get('/bookings/my')
    return readList(response.data)
  } catch (error) {
    console.error('Get my bookings error:', error)
    return []
  }
}

export async function getAllBookings() {
  try {
    const response = await apiClient.get('/admin/bookings')
    return readList(response.data)
  } catch (error) {
    console.error('Get all bookings error:', error)
    return fallbackBookings
  }
}
