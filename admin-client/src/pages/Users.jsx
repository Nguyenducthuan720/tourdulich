import { useEffect, useState } from 'react'
import { getUsers, updateUser, deleteUser } from '../api/adminService'
import { Icon } from '../components/icons'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers(page, 10, search)
      setUsers(Array.isArray(data?.data) ? data.data : [])
      setTotal(data.total)
      setPages(data.pages)
    } catch (error) {
      console.error('Fetch users error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const handleEdit = (user) => {
    setEditingId(user.UserID)
    setEditData({
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
      status: user.Status,
    })
  }

  const handleSave = async (id) => {
    try {
      await updateUser(id, editData)
      setEditingId(null)
      fetchUsers()
    } catch (error) {
      alert(error.message || 'Lỗi cập nhật user')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa user này?')) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch (error) {
      alert(error.message || 'Lỗi xóa user')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Users</h1>
          <p className="mt-1 text-sm text-ink-500">Quản lý tài khoản và quyền truy cập</p>
        </div>
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Tìm kiếm user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="input-field pl-12 w-64"
          />
        </div>
      </div>

      <div className="mb-4 p-4 bg-gradient-to-r from-sky-50 to-sky-100/50 border border-sky-200 rounded-2xl">
        <p className="text-sm font-semibold text-sky-800 uppercase tracking-wide">
          Tổng cộng: {total} users
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-ink-600 font-medium uppercase text-sm tracking-widest">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white border border-ink-300">
          <p className="text-ink-600 font-medium uppercase text-sm tracking-widest">Không tìm thấy user nào</p>
        </div>
      ) : (
        <div className="bg-white border border-ink-300 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream border-b border-ink-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-ink-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-ink-900">Tên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-ink-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-ink-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-ink-900">Trạng thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-ink-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.UserID} className="border-b border-ink-200 hover:bg-cream transition">
                  <td className="px-6 py-4 text-sm text-ink-600">{user.UserID}</td>
                  <td className="px-6 py-4">
                    {editingId === user.UserID ? (
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-ink-300 text-sm focus:outline-none focus:border-ink-800"
                      />
                    ) : (
                      <span className="font-medium text-ink-900">{user.FullName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.UserID ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-ink-300 text-sm focus:outline-none focus:border-ink-800"
                      />
                    ) : (
                      <span className="text-ink-600 text-sm">{user.Email}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.UserID ? (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-ink-300 text-sm focus:outline-none focus:border-ink-800"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Customer">Customer</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border ${
                        user.Role === 'Admin'
                          ? 'border-ink-800 text-ink-800'
                          : 'border-ink-400 text-cream0'
                      }`}>
                        {user.Role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border ${
                      user.Status === 1
                        ? 'border-ink-300 text-ink-600'
                        : 'border-ink-300 text-ink-400'
                    }`}>
                      {user.Status === 1 ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {editingId === user.UserID ? (
                      <>
                        <button
                          onClick={() => handleSave(user.UserID)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-700 bg-ink-200 hover:bg-ink-300 rounded-lg transition"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 border border-brand-200 hover:bg-brand-50 rounded-lg transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user.UserID)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-ink-600 hover:bg-ink-700 rounded-lg transition"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-ink-300 hover:bg-cream disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-ink-600">
              Trang {page} / {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-ink-300 hover:bg-cream disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
