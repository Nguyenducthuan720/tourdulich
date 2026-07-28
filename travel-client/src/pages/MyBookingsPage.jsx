import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyBookings } from '../api/bookingService'
import { useNavigate } from 'react-router-dom'

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [isAuthenticated, navigate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMyBookings()
      setBookings(data)
    } catch (err) {
      console.error('Fetch bookings error:', err)
      setError(err.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Lịch sử đặt tour</h1>
          <p className="mt-2 text-slate-600">Xin chào {user?.name || 'khách hàng'}, đây là những chuyến đi của bạn</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <p className="text-slate-600">Đang tải lịch sử...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="mb-4 text-2xl text-slate-600">📭 Bạn chưa đặt tour nào</p>
            <button
              onClick={() => navigate('/')}
              className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
            >
              ← Khám phá tours ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id || booking.BookingID} className="rounded-lg bg-white shadow overflow-hidden hover:shadow-lg transition">
                <div className="md:flex">
                  {/* Left Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-900">
                        {booking.tourTitle || booking.TourTitle}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          (booking.status === 'Confirmed' || booking.Status === 'Confirmed' || booking.status === 'Da xac nhan')
                            ? 'bg-emerald-100 text-emerald-800'
                            : (booking.status || booking.Status) === 'Pending' || booking.status === 'Cho xac nhan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {booking.status === 'Confirmed' || booking.Status === 'Confirmed'
                          ? '✓ Đã xác nhận'
                          : booking.status === 'Pending' || booking.Status === 'Pending'
                          ? '⏳ Chờ xác nhận'
                          : booking.status || booking.Status}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">📅 Ngày đi</p>
                        <p className="font-bold text-slate-900">
                          {new Date(booking.date || booking.Date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">👥 Số lượng khách</p>
                        <p className="font-bold text-slate-900">{booking.guests || booking.Guests} người</p>
                      </div>
                    </div>

                    {/* Booking ID */}
                    <p className="text-xs text-slate-500">
                      Mã đặt tour: <span className="font-mono font-bold">{booking.id || booking.BookingID}</span>
                    </p>
                  </div>

                  {/* Right Section */}
                  <div className="border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 p-6 md:w-48 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Tổng tiền</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {(booking.total || booking.Total)?.toLocaleString?.() || booking.total || booking.Total} VNĐ
                      </p>
                    </div>
                    <div className="mt-4 space-y-2">
                      <button className="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition">
                        📋 Xem chi tiết
                      </button>
                      <button className="w-full rounded border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
                        💬 Liên hệ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
