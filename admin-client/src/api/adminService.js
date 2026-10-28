import apiClient from './client'

export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/admin/dashboard/stats')
    return response.data?.data || {}
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    throw error
  }
}

export async function getTours(params = {}) {
  try {
    const response = await apiClient.get('/admin/tours', { params })
    return response.data
  } catch (error) {
    console.error('Get tours error:', error)
    throw error
  }
}

export async function createTour(data) {
  try {
    const response = await apiClient.post('/admin/tours', data)
    return response.data
  } catch (error) {
    console.error('Create tour error:', error)
    throw error
  }
}

export async function updateTour(id, data) {
  try {
    const response = await apiClient.put(`/admin/tours/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Update tour error:', error)
    throw error
  }
}

export async function deleteTour(id) {
  try {
    const response = await apiClient.delete(`/admin/tours/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete tour error:', error)
    throw error
  }
}

export async function getCategories() {
  try {
    const response = await apiClient.get('/admin/categories')
    return response.data?.data || []
  } catch (error) {
    console.error('Get categories error:', error)
    throw error
  }
}

export async function createCategory(data) {
  try {
    const response = await apiClient.post('/admin/categories', data)
    return response.data
  } catch (error) {
    console.error('Create category error:', error)
    throw error
  }
}

export async function updateCategory(id, data) {
  try {
    const response = await apiClient.put(`/admin/categories/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Update category error:', error)
    throw error
  }
}

export async function deleteCategory(id) {
  try {
    const response = await apiClient.delete(`/admin/categories/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete category error:', error)
    throw error
  }
}

export async function getDestinations() {
  try {
    const response = await apiClient.get('/admin/destinations')
    return response.data?.data || []
  } catch (error) {
    console.error('Get destinations error:', error)
    throw error
  }
}

export async function createDestination(data) {
  try {
    const response = await apiClient.post('/admin/destinations', data)
    return response.data
  } catch (error) {
    console.error('Create destination error:', error)
    throw error
  }
}

export async function updateDestination(id, data) {
  try {
    const response = await apiClient.put(`/admin/destinations/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Update destination error:', error)
    throw error
  }
}

export async function deleteDestination(id) {
  try {
    const response = await apiClient.delete(`/admin/destinations/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete destination error:', error)
    throw error
  }
}

export async function getFlights() {
  try {
    const response = await apiClient.get('/admin/flights')
    return response.data?.data || []
  } catch (error) {
    console.error('Get flights error:', error)
    throw error
  }
}

export async function createFlight(data) {
  try {
    const response = await apiClient.post('/admin/flights', data)
    return response.data
  } catch (error) {
    console.error('Create flight error:', error)
    throw error
  }
}

export async function updateFlight(id, data) {
  try {
    const response = await apiClient.put(`/admin/flights/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Update flight error:', error)
    throw error
  }
}

export async function deleteFlight(id) {
  try {
    const response = await apiClient.delete(`/admin/flights/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete flight error:', error)
    throw error
  }
}

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

export async function getSettings() {
  try {
    const response = await apiClient.get('/admin/settings')
    return response.data?.data || {}
  } catch (error) {
    console.error('Get settings error:', error)
    throw error
  }
}

export async function updateSettings(data) {
  try {
    const response = await apiClient.put('/admin/settings', data)
    return response.data
  } catch (error) {
    console.error('Update settings error:', error)
    throw error
  }
}

// ===== AI INSIGHTS =====
export async function getAIStats() {
  try {
    const response = await apiClient.get('/admin/ai/stats')
    return response.data?.data || {}
  } catch (error) {
    console.error('Get AI stats error:', error)
    throw error
  }
}

export async function getAISessions(page = 1, limit = 10, search = '') {
  try {
    const response = await apiClient.get('/admin/ai/sessions', {
      params: { page, limit, search },
    })
    return response.data
  } catch (error) {
    console.error('Get AI sessions error:', error)
    throw error
  }
}

export async function getAISessionDetail(sessionId) {
  try {
    const response = await apiClient.get(`/admin/ai/sessions/${sessionId}`)
    return response.data?.data
  } catch (error) {
    console.error('Get AI session detail error:', error)
    throw error
  }
}

export async function deleteAISession(sessionId) {
  try {
    const response = await apiClient.delete(`/admin/ai/sessions/${sessionId}`)
    return response.data
  } catch (error) {
    console.error('Delete AI session error:', error)
    throw error
  }
}
