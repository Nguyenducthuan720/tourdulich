import apiClient from './client'

export async function getUsers() {
  try {
    const response = await apiClient.get('/admin/users')
    return response.data?.data || response.data || []
  } catch (error) {
    console.error('Get users error:', error)
    return [
      { id: 1, name: 'Nguyen Minh Anh', email: 'anh@example.com', role: 'customer' },
      { id: 2, name: 'Tran Hoang Nam', email: 'nam@example.com', role: 'admin' },
      { id: 3, name: 'Le Thu Ha', email: 'ha@example.com', role: 'customer' },
    ]
  }
}
