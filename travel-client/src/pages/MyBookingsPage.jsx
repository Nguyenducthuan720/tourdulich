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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-amber-600">Lịch sử</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">Chuyến đi của bạn</h1>
          <p className="mt-3 text-lg text-slate-600">Xin chào {user?.name || 'khách hàng'}, đây là những hành trình đã đặt</p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 border-l-4 border-red-500 p-5">
            <p className="text-red-900 font-medium">⚠ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
              <p className="text-lg font-semibold text-slate-600">Đang tải lịch sử...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl bg-white p-16 text-center shadow-lg">
            <div className="mb-6 text-8xl">📭</div>
            <p className="text-2xl font-bold text-slate-900 mb-3">Bạn chưa đặt tour nào</p>
            <p className="text-slate-600 mb-8">Hãy khám phá các tour du lịch tuyệt vời ngay hôm nay</p>
            <button
              onClick={() => navigate('/')}
              className="inline-block rounded-2xl bg-amber-500 px-8 py-4 font-bold text-white hover:bg-amber-600 hover:shadow-xl transition-all duration-300"
            >
              ← Khám phá tours ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {bookings.map((booking) => (
              <div key={booking.id || booking.BookingID} className="rounded-3xl bg-white shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="md:flex">
                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {booking.tourTitle || booking.TourTitle}
                      </h3>
                      <span
                        className={`px-5 py-2 rounded-full text-sm font-bold ${
                          (booking.status === 'Confirmed' || booking.Status === 'Confirmed' || booking.status === 'Da xac nhan')
                            ? 'bg-emerald-100 text-emerald-800'
                            : (booking.status || booking.Status) === 'Pending' || booking.status === 'Cho xac nhan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {booking.status === 'Confirmed' || booking.Status === 'Confirmed'
                          ? ' Đã xác nhận'
                          : booking.status === 'Pending' || booking.Status === 'Pending'
                          ? ' Chờ xác nhận'
                          : booking.status || booking.Status}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 mb-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1"> Ngày đi</p>
                        <p className="text-lg font-bold text-slate-900">
                          {new Date(booking.date || booking.Date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1"> Số lượng khách</p>
                        <p className="text-lg font-bold text-slate-900">{booking.guests || booking.Guests} người</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Mã đặt tour: <span className="font-mono font-bold text-slate-700">{booking.id || booking.BookingID}</span>
                    </p>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 p-8 md:w-56 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Tổng tiền</p>
                      <p className="text-3xl font-bold text-amber-600">
                        {(booking.total || booking.Total)?.toLocaleString?.() || booking.total || booking.Total} VNĐ
                      </p>
                    </div>
                    <div className="mt-6 space-y-3">
                      <button className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-all duration-300">
                         Xem chi tiết
                      </button>
                      <button className="w-full rounded-xl border-2 border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
                         Liên hệ
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
