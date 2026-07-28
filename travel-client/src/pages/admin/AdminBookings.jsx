import { useEffect, useState } from 'react'
import { getBookings, updateBookingStatus, deleteBooking } from '../../api/adminService'

const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled']
const statusColors = {
  Pending: 'border border-slate-300 bg-slate-50 text-slate-700',
  Confirmed: 'border border-slate-400 bg-slate-100 text-slate-800',
  Completed: 'border border-slate-500 bg-slate-200 text-slate-900',
  Cancelled: 'border border-slate-300 bg-slate-100 text-slate-500 line-through',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    fetchBookings()
  }, [page, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await getBookings(page, 10, statusFilter)
      setBookings(data.data)
      setTotal(data.total)
      setPages(data.pages)
    } catch (error) {
      console.error('Fetch bookings error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus)
      fetchBookings()
    } catch (error) {
      console.error('Update booking error:', error)
      alert('Lỗi cập nhật booking')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa booking này?')) {
      try {
        await deleteBooking(id)
        fetchBookings()
      } catch (error) {
        console.error('Delete booking error:', error)
        alert('Lỗi xóa booking')
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 uppercase tracking-wider">Quản lý Đặt hàng</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setStatusFilter('')
              setPage(1)
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
              statusFilter === ''
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status)
                setPage(1)
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                statusFilter === status
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 p-4 bg-slate-50 border border-slate-300">
        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Tổng cộng: {total} đơn đặt hàng
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 font-medium uppercase text-sm tracking-widest">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-300">
          <p className="text-slate-600 font-medium uppercase text-sm tracking-widest">Không tìm thấy booking nào</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-300 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tour</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ngày đặt</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.BookingID} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.BookingID}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{booking.UserName}</p>
                      <p className="text-xs text-slate-500">{booking.Email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.TourName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(booking.BookingDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {booking.TotalAmount?.toLocaleString?.()}đ
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.Status}
                      onChange={(e) => handleStatusChange(booking.BookingID, e.target.value)}
                      className={`px-2 py-1 text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer ${
                        statusColors[booking.Status] || 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(booking.BookingID)}
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-slate-600 hover:bg-slate-700"
                    >
                      Xóa
                    </button>
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
