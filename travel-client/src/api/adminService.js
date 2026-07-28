import apiClient from './client'

// Dashboard Stats
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/admin/dashboard/stats')
    return response.data?.data || {}
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    throw error
  }
}

// ===== USERS =====
export async function getUsers(page = 1, limit = 10, search = '') {
  try {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit, search }
    })
    return response.data
  } catch (error) {
    console.error('Get users error:', error)
    throw error
  }
}

export async function updateUser(id, data) {
  try {
    const response = await apiClient.put(`/admin/users/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Update user error:', error)
    throw error
  }
}

export async function deleteUser(id) {
  try {
    const response = await apiClient.delete(`/admin/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete user error:', error)
    throw error
  }
}

// ===== REVIEWS =====
export async function getReviews(page = 1, limit = 10) {
  try {
    const response = await apiClient.get('/admin/reviews', {
      params: { page, limit }
    })
    return response.data
  } catch (error) {
    console.error('Get reviews error:', error)
    throw error
  }
}

export async function deleteReview(id) {
  try {
    const response = await apiClient.delete(`/admin/reviews/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete review error:', error)
    throw error
  }
}

// ===== BOOKINGS =====
export async function getBookings(page = 1, limit = 10, status = '') {
  try {
    const response = await apiClient.get('/admin/bookings', {
      params: { page, limit, status }
    })
    return response.data
  } catch (error) {
    console.error('Get bookings error:', error)
    throw error
  }
}

export async function updateBookingStatus(id, status) {
  try {
    const response = await apiClient.put(`/admin/bookings/${id}`, { status })
    return response.data
  } catch (error) {
    console.error('Update booking error:', error)
    throw error
  }
}

export async function deleteBooking(id) {
  try {
    const response = await apiClient.delete(`/admin/bookings/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete booking error:', error)
    throw error
  }
}
