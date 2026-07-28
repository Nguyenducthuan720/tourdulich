import { useEffect, useState } from 'react'
import { getUsers, updateUser, deleteUser } from '../../api/adminService'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers(page, 10, search)
      setUsers(data.data)
      setTotal(data.total)
      setPages(data.pages)
    } catch (error) {
      console.error('Fetch users error:', error)
    } finally {
      setLoading(false)
    }
  }

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
      console.error('Update user error:', error)
      alert('Lỗi cập nhật user')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa user này?')) {
      try {
        await deleteUser(id)
        fetchUsers()
      } catch (error) {
        console.error('Delete user error:', error)
        alert('Lỗi xóa user')
      }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wider">Quản lý Users</h1>
        <input
          type="text"
          placeholder="Tìm kiếm user..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800 text-sm"
        />
      </div>

      <div className="mb-4 p-4 bg-slate-50 border border-slate-300">
        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Tổng cộng: {total} users
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 font-medium uppercase text-sm tracking-widest">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-300">
          <p className="text-slate-600 font-medium uppercase text-sm tracking-widest">Không tìm thấy user nào</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-300 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.UserID} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-600">{user.UserID}</td>
                  <td className="px-6 py-4">
                    {editingId === user.UserID ? (
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-800"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{user.FullName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.UserID ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-800"
                      />
                    ) : (
                      <span className="text-slate-600 text-sm">{user.Email}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.UserID ? (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 text-sm focus:outline-none focus:border-slate-800"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Customer">Customer</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border ${
                        user.Role === 'Admin'
                          ? 'border-slate-800 text-slate-800'
                          : 'border-slate-400 text-slate-500'
                      }`}>
                        {user.Role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider border ${
                      user.Status === 1
                        ? 'border-slate-500 text-slate-600'
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      {user.Status === 1 ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {editingId === user.UserID ? (
                      <>
                        <button
                          onClick={() => handleSave(user.UserID)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 hover:bg-slate-300"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-300 hover:bg-slate-100"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user.UserID)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-slate-600 hover:bg-slate-700"
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
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-slate-600">
              Trang {page} / {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
