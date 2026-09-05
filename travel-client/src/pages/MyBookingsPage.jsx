import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyBookings } from '../api/bookingService'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/icons'

const STATUS_LABEL = {
  Confirmed: 'Đã xác nhận',
  Pending: 'Chờ xác nhận',
  Cancelled: 'Đã hủy',
}
const STATUS_CLASS = {
  Confirmed: 'bg-emerald-100 text-emerald-800',
  Pending: 'bg-brand-100 text-brand-800',
  Cancelled: 'bg-red-100 text-red-700',
}

function BookingDetailModal({ booking, onClose, onContact }) {
  if (!booking) return null
  const status = booking.status || booking.Status

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink-100 p-6">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Chi tiết đơn hàng</h2>
            <p className="mt-1 text-sm text-ink-500">
              Mã đặt tour: <span className="font-mono font-bold text-ink-700">{booking.id || booking.BookingID}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-ink-100 text-ink-700 transition hover:bg-ink-200"
            aria-label="Đóng"
          >
            <span className="font-bold">×</span>
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl bg-ink-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-ink-900">{booking.tourTitle || booking.TourTitle}</p>
                <p className="mt-1 text-sm text-ink-600">
                  {booking.destination && <span className="inline-flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" /> {booking.destination}</span>}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold ${STATUS_CLASS[status] || 'bg-ink-100 text-ink-800'}`}>
                {STATUS_LABEL[status] || status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Ngày đi</p>
              <p className="mt-1 font-bold text-ink-900">
                {new Date(booking.date || booking.Date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Số lượng khách</p>
              <p className="mt-1 font-bold text-ink-900">{booking.guests || booking.Guests} người</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Đơn giá / người</p>
              <p className="mt-1 font-bold text-ink-900">
                {Number(booking.unitPrice || 0).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Độ dài tour</p>
              <p className="mt-1 font-bold text-ink-900">{booking.duration || '—'}</p>
            </div>
          </div>

          {booking.airline && (
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sky-900">Vé máy bay</p>
              <p className="font-bold text-ink-900">
                {booking.airline} <span className="text-xs font-medium text-ink-600">({booking.flightNumber})</span>
              </p>
              {booking.departureCity && (
                <p className="mt-1 text-sm font-medium text-sky-800">
                  {booking.departureCity} → {booking.arrivalCity}
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-sky-900/70">Hành khách</p>
                  <p className="font-bold text-ink-900">{booking.passengerName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-sky-900/70">Số ghế</p>
                  <p className="font-bold text-ink-900">{booking.seatNumber || '—'}</p>
                </div>
              </div>
              {booking.ticketType && (
                <p className="mt-3 inline-block rounded-full bg-sky-200 px-3 py-1 text-xs font-bold text-sky-900">
                  {booking.ticketType}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-5 text-white">
            <span className="text-base font-bold">Tổng thanh toán</span>
            <span className="text-2xl font-bold">{Number(booking.total || booking.Total).toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>

        <div className="flex gap-3 border-t-2 border-ink-100 p-6">
          <button
            onClick={onContact}
            className="flex-1 rounded-2xl border-2 border-ink-300 px-6 py-3 font-bold text-ink-700 transition hover:bg-ink-100"
          >
            Liên hệ hỗ trợ
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-brand-500 px-6 py-3 font-bold text-white transition hover:bg-brand-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

function ContactModal({ booking, onClose }) {
  if (!booking) return null
  const bookingCode = booking.id || booking.BookingID

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-brand-600">
            <Icon name="mail" className="h-7 w-7" />
          </span>
          <h2 className="text-2xl font-bold text-ink-900">Liên hệ hỗ trợ</h2>
          <p className="mt-2 text-sm text-ink-500">
            Đơn hàng <span className="font-mono font-bold text-ink-700">#{bookingCode}</span>
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={`tel:19001234`}
            className="flex items-center gap-4 rounded-2xl border-2 border-ink-200 p-5 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">Hotline</p>
              <p className="text-base font-bold text-brand-600">1900 1234</p>
            </div>
          </a>

          <a
            href={`mailto:support@tourdulich.com?subject=${encodeURIComponent(`Hỗ trợ đơn hàng #${bookingCode}`)}&body=${encodeURIComponent(`Xin chào, tôi cần hỗ trợ về đơn hàng #${bookingCode}.`)}`}
            className="flex items-center gap-4 rounded-2xl border-2 border-ink-200 p-5 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600">
              <Icon name="mail" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">Email</p>
              <p className="text-base font-bold text-brand-600">support@tourdulich.com</p>
            </div>
          </a>
        </div>

        <p className="mt-5 rounded-2xl bg-cream p-4 text-xs leading-relaxed text-ink-600">
          Khi liên hệ, vui lòng cung cấp mã đặt tour để chúng tôi hỗ trợ nhanh nhất. Bộ phận chăm sóc khách hàng hoạt động 24/7.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-ink-900 px-6 py-3 font-bold text-white transition hover:bg-brand-600"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detailBooking, setDetailBooking] = useState(null)
  const [contactBooking, setContactBooking] = useState(null)

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
    <div className="min-h-screen bg-cream py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-600">Lịch sử</p>
          <h1 className="text-4xl font-bold tracking-tight text-ink-900 lg:text-5xl">Chuyến đi của bạn</h1>
          <p className="mt-3 text-lg text-ink-600">Xin chào {user?.name || 'khách hàng'}, đây là những hành trình đã đặt</p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 border-l-4 border-red-500 p-5">
            <p className="text-red-900 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-ink-200 border-t-brand-500"></div>
              <p className="text-lg font-semibold text-ink-600">Đang tải lịch sử...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl bg-white p-16 text-center shadow-lg">
            <div className="mb-6 text-8xl"></div>
            <p className="text-2xl font-bold text-ink-900 mb-3">Bạn chưa đặt tour nào</p>
            <p className="text-ink-600 mb-8">Hãy khám phá các tour du lịch tuyệt vời ngay hôm nay</p>
            <button
              onClick={() => navigate('/')}
              className="inline-block rounded-2xl bg-brand-500 px-8 py-4 font-bold text-white hover:bg-brand-600 hover:shadow-xl transition-all duration-300"
            >
              ← Khám phá tours ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {bookings.map((booking) => {
              const status = booking.status || booking.Status
              return (
                <div key={booking.id || booking.BookingID} className="rounded-3xl bg-white shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="md:flex">
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-bold text-ink-900">
                          {booking.tourTitle || booking.TourTitle}
                        </h3>
                        <span
                          className={`px-5 py-2 rounded-full text-sm font-bold ${
                            STATUS_CLASS[status] || 'bg-ink-100 text-ink-800'
                          }`}
                        >
                          {STATUS_LABEL[status] || status}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 mb-6">
                        <div>
                          <p className="text-sm text-ink-600 mb-1">Ngày đi</p>
                          <p className="text-lg font-bold text-ink-900">
                            {new Date(booking.date || booking.Date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-ink-600 mb-1">Số lượng khách</p>
                          <p className="text-lg font-bold text-ink-900">{booking.guests || booking.Guests} người</p>
                        </div>
                      </div>

                      <p className="text-xs text-ink-500">
                        Mã đặt tour: <span className="font-mono font-bold text-ink-700">{booking.id || booking.BookingID}</span>
                      </p>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-ink-200 bg-cream p-8 md:w-56 flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-ink-600 mb-1">Tổng tiền</p>
                        <p className="text-2xl font-bold text-brand-600">
                          {Number(booking.total || booking.Total || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => setDetailBooking(booking)}
                          className="w-full rounded-xl bg-ink-900 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600 transition-all duration-300"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => setContactBooking(booking)}
                          className="w-full rounded-xl border-2 border-ink-300 px-5 py-3 text-sm font-bold text-ink-700 hover:bg-ink-100 transition"
                        >
                          Liên hệ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
        onContact={() => {
          setContactBooking(detailBooking)
          setDetailBooking(null)
        }}
      />
      <ContactModal booking={contactBooking} onClose={() => setContactBooking(null)} />
    </div>
  )
}