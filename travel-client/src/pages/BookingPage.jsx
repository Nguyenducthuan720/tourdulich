import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { createBooking, getFlights } from '../api/bookingService'
import { useAuth } from '../context/AuthContext'
import { fallbackTours } from '../data/mockData'
import { Icon } from '../components/icons'
import './VivuCheckout.css'

function SvgIcon({ children, className = 'w-8 h-8' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const ROOM_ICON = (
  <>
    <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M3 14h18v4" />
    <path d="M3 18v2M21 18v2" />
    <circle cx="7" cy="11" r="1.5" />
  </>
)
const SUITE_ICON = (
  <>
    <path d="M12 3l1.8 5.4L19 9.2l-5.2 1.8L12 16l-1.8-5L5 9.2l5.2-1.8L12 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </>
)
const BANK_ICON = (
  <>
    <path d="M3 21h18" />
    <path d="M4 21V10l8-5 8 5v11" />
    <path d="M8 21v-5h8v5" />
    <path d="M9 10h.01M15 10h.01" />
  </>
)
const CARD_ICON = (
  <>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 14h4" />
  </>
)
const WALLET_ICON = (
  <>
    <path d="M3 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M3 7l2-3h11" />
    <circle cx="17" cy="13" r="1.5" />
  </>
)
const BED_DOUBLE_ICON = (
  <>
    <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M3 14h18v4" />
    <path d="M3 18v2M21 18v2" />
  </>
)
const BED_TWIN_ICON = (
  <>
    <path d="M3 18v-6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6" />
    <path d="M13 17v-5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v5" />
    <path d="M3 18v2M21 18v2" />
  </>
)

const ROOM_OPTIONS = [
  { id: 'Standard', title: 'Phòng Tiêu Chuẩn', desc: 'Diện tích 25m2, đầy đủ tiện nghi cơ bản.', price: 0, icon: <SvgIcon className="w-8 h-8 text-brand-500">{ROOM_ICON}</SvgIcon> },
  { id: 'Deluxe', title: 'Phòng Deluxe', desc: 'Diện tích 35m2, ban công view đẹp, bồn tắm.', price: 500000, icon: <SvgIcon className="w-8 h-8 text-brand-500">{ROOM_ICON}</SvgIcon> },
  { id: 'Suite', title: 'Phòng VIP / Suite', desc: 'Diện tích 50m2, phòng khách riêng, dịch vụ 24/7.', price: 1500000, icon: <SvgIcon className="w-8 h-8 text-brand-500">{SUITE_ICON}</SvgIcon> }
]

const PAYMENT_METHODS = [
  { id: 'vnpay', title: 'VNPay', desc: 'Thanh toán qua cổng VNPay', icon: <SvgIcon className="w-7 h-7 text-brand-600">{CARD_ICON}</SvgIcon> },
  { id: 'momo', title: 'MoMo', desc: 'Thanh toán qua ví điện tử MoMo', icon: <SvgIcon className="w-7 h-7 text-brand-600">{WALLET_ICON}</SvgIcon> },
  { id: 'Chuyển khoản', title: 'Chuyển khoản ngân hàng', desc: 'Thanh toán qua quét mã QR hoặc chuyển khoản', icon: <SvgIcon className="w-7 h-7 text-brand-600">{BANK_ICON}</SvgIcon> },
]

const DEFAULT_BOOKING_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export default function BookingPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  
  const [tour, setTour] = useState(null)
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const submitLockRef = useRef(false)

  const [step, setStep] = useState(1)
  
  const adults = parseInt(searchParams.get('adults')) || 1
  const children = parseInt(searchParams.get('children')) || 0
  const totalGuests = adults + children
  const [bookingDate, setBookingDate] = useState(DEFAULT_BOOKING_DATE)
  const [roomType, setRoomType] = useState('Standard')
  const [bedType, setBedType] = useState('Double')
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản')
  const [specialRequest, setSpecialRequest] = useState('')

  const [isCombo, setIsCombo] = useState(false)
  const [flightId, setFlightId] = useState('')
  const [passengerName, setPassengerName] = useState('')
  const [idCard, setIdCard] = useState('')
  const [seatNumber, setSeatNumber] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    let active = true
    async function loadBookingData() {
      try {
        const [tourData, flightData] = await Promise.all([getTourById(id), getFlights()])
        if (!active) return
        setTour(tourData)
        setFlights(flightData)
      } catch (error) {
        console.error('Fetch booking data error:', error)
        if (active) setTour(fallbackTours[0])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadBookingData()
    return () => { active = false }
  }, [id, isAuthenticated, navigate])

  const handleNextStep = () => {
    if (isCombo) {
      if (totalGuests !== 1) {
        setError('Đặt combo vé máy bay hiện hỗ trợ 1 khách mỗi booking. Vui lòng đặt riêng hoặc chọn 1 khách.')
        return
      }
      if (!flightId) {
        setError('Vui lòng chọn một chuyến bay phù hợp cho gói Combo!')
        return
      }
      if (!passengerName.trim() || !idCard.trim()) {
        setError('Vui lòng điền đầy đủ Tên hành khách và Số CCCD/Hộ chiếu!')
        return
      }
    }
    setError(null)
    setStep(2)
    window.scrollTo(0, 0)
  }

  const handlePrevStep = () => {
    setStep(1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Guard: block accidental double-click / double submit
    if (submitLockRef.current) return
    submitLockRef.current = true

    setError(null)
    setSuccess(null)

    try {
      setSubmitting(true)
      
      const bookingData = {
        tourId: tour?.TourID || tour?.id,
        date: bookingDate,
        guests: totalGuests,
        adults: adults,
        children: children,
        roomType: roomType,
        paymentMethod: paymentMethod,
        specialRequest: specialRequest,
        ...(isCombo && {
          flightId: parseInt(flightId),
          passengerName: passengerName.trim(),
          idCard: idCard.trim(),
          seatNumber: seatNumber.trim()
        })
      }

      const booking = await createBooking(bookingData)
      
      const bookingId = booking.id || booking.bookingId || booking.BookingID
      const total = booking.total || booking.TotalAmount || totalPrice || 0

      const method =
        paymentMethod === 'vnpay' || paymentMethod === 'momo' ? paymentMethod : 'bank_transfer'

      navigate(`/payment?bookingId=${bookingId}&amount=${total}&method=${method}`)
    } catch (err) {
      setError(err.message || 'Lỗi khi xử lý đặt chỗ')
      submitLockRef.current = false
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="h-32 bg-ink-200 rounded-3xl animate-pulse mb-8"></div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[600px] bg-ink-200 rounded-3xl animate-pulse"></div>
            <div className="h-[600px] bg-ink-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-7xl mb-4">🔍</p>
          <p className="text-2xl font-bold text-ink-900">Không tìm thấy tour</p>
        </div>
      </div>
    )
  }

  const tourName = tour.TourName || tour.title
  const basePrice = tour.Price || tour.price
  const duration = tour.Duration || tour.duration
  
  const selectedRoom = ROOM_OPTIONS.find(r => r.id === roomType)
  const roomSurcharge = selectedRoom ? selectedRoom.price : 0
  
  const selectedFlight = flights.find(f => f.FlightID === parseInt(flightId))
  const flightPrice = (isCombo && selectedFlight) ? selectedFlight.Price : 0

  const childPrice = Math.round(basePrice * 0.7)
  const totalPrice = (basePrice + roomSurcharge + flightPrice) * adults + (childPrice + roomSurcharge + flightPrice) * children

  return (
    <div className="vivu-checkout-page min-h-screen bg-cream py-12">
      <div className="mx-auto max-w-6xl px-4">
        <header className="vivu-checkout-header mb-10">
          <div className="vivu-checkout-title-row">
            <div>
              <p className="vivu-checkout-overline">VIVU TRAVEL · ĐẶT CHỖ AN TOÀN</p>
              <h1 className="text-4xl font-bold text-ink-900">Hoàn tất hành trình</h1>
              <p className="vivu-checkout-intro">Rà soát dịch vụ và thông tin trước khi xác nhận đặt tour.</p>
            </div>
            <a className="vivu-checkout-support" href="tel:19006868"><span>Hỗ trợ 24/7</span><strong>1900 6868</strong></a>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  step >= 1 ? 'bg-brand-500 text-white shadow-lg' : 'bg-ink-200 text-ink-500'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-bold ${step >= 1 ? 'text-brand-600' : 'text-ink-500'}`}>Bước 1</p>
                  <p className={`text-base font-bold ${step >= 1 ? 'text-ink-900' : 'text-ink-500'}`}>Lựa chọn dịch vụ</p>
                </div>
              </div>
              
              <div className="flex-1 h-2 bg-ink-200 rounded-full mx-4 overflow-hidden">
                <div className={`h-full bg-brand-500 rounded-full transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className={`text-sm font-bold ${step >= 2 ? 'text-brand-600' : 'text-ink-500'}`}>Bước 2</p>
                  <p className={`text-base font-bold ${step >= 2 ? 'text-ink-900' : 'text-ink-500'}`}>Ngày & thanh toán</p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  step >= 2 ? 'bg-brand-500 text-white shadow-lg' : 'bg-ink-200 text-ink-500'
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>
        </header>

        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 animate-fade-in">
            <p className="text-emerald-900 font-bold text-lg">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border-2 border-red-200 p-5 animate-fade-in">
            <p className="text-red-900 font-bold text-lg">{error}</p>
          </div>
        )}

        <div className="vivu-checkout-grid grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="vivu-checkout-form-panel rounded-3xl bg-white p-8 shadow-lg border border-ink-100">
              
              {/* STEP 1: ROOM & FLIGHT SELECTION */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-ink-900 pb-4 border-b-2 border-ink-100">Lựa chọn dịch vụ</h2>
                  
                  {/* 1. Hạng phòng */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-ink-800">1. Hạng phòng khách sạn</h3>
                    <div className="vivu-room-choice-list grid gap-4">
                      {ROOM_OPTIONS.map((room) => (
                        <div 
                          key={room.id}
                          onClick={() => setRoomType(room.id)}
                          className={`vivu-room-choice relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg ${
                            roomType === room.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200 hover:border-brand-200'
                          }`}
                        >
                          {roomType === room.id && (
                            <div className="absolute top-5 right-5 text-brand-600">
                              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                            </div>
                          )}
                            <div className="flex items-start gap-5">
                              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50">
                                {room.icon}
                              </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-ink-900 mb-2">{room.title}</h4>
                              <p className="text-sm text-ink-600 mb-3">{room.desc}</p>
                              <p className="amount text-base font-bold text-brand-700">
                                {room.price === 0 ? 'Miễn phí phụ thu' : `Phụ thu: +${room.price.toLocaleString()} VNĐ / người`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Loại giường */}
                  <div className="vivu-bed-choice-section space-y-4">
                    <h3 className="text-lg font-bold text-ink-800">2. Loại giường (Tùy chọn)</h3>
                    <div className="vivu-bed-choice-grid grid grid-cols-2 gap-4">
                      <label className={`vivu-bed-choice cursor-pointer rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
                        bedType === 'Double' ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200 hover:border-brand-200'
                      }`}>
                        <input type="radio" name="bedType" className="hidden" checked={bedType === 'Double'} onChange={() => setBedType('Double')} />
                        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-600">
                          <SvgIcon className="w-6 h-6">{BED_DOUBLE_ICON}</SvgIcon>
                        </div>
                        <p className={`font-bold ${bedType === 'Double' ? 'text-brand-700' : 'text-ink-700'}`}>Giường đôi lớn</p>
                      </label>
                      <label className={`vivu-bed-choice cursor-pointer rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
                        bedType === 'Twin' ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200 hover:border-brand-200'
                      }`}>
                        <input type="radio" name="bedType" className="hidden" checked={bedType === 'Twin'} onChange={() => setBedType('Twin')} />
                        <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-600">
                          <SvgIcon className="w-6 h-6">{BED_TWIN_ICON}</SvgIcon>
                        </div>
                        <p className={`font-bold ${bedType === 'Twin' ? 'text-brand-700' : 'text-ink-700'}`}>2 Giường đơn</p>
                      </label>
                    </div>
                  </div>

                  {/* 3. Combo Flight */}
                  <div className="space-y-4 pt-6 border-t-2 border-ink-100">
                    <label className={`flex items-center gap-5 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      isCombo ? 'bg-sky-50 border-sky-400 shadow-lg' : 'bg-white border-sky-200 hover:border-sky-300'
                    }`}>
                      <input 
                        type="checkbox"
                        className="w-6 h-6 rounded text-sky-600 focus:ring-sky-500 transition-transform hover:scale-110" 
                        checked={isCombo} 
                        onChange={(e) => {
                          setIsCombo(e.target.checked)
                          if(!e.target.checked) setFlightId('')
                        }} 
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sky-900 text-lg mb-1">Mua thêm vé máy bay (Combo)</p>
                        <p className="text-sm text-sky-700">Tiết kiệm tới 15% chi phí so với mua lẻ</p>
                      </div>
                    </label>

                    {isCombo && (
                      <div className="p-6 bg-gradient-to-br from-sky-50 to-cream border-2 rounded-2xl space-y-6 border-sky-200 shadow-inner animate-fade-in">
                        <div>
                          <label className="block text-sm font-bold text-ink-700 mb-3 uppercase tracking-wider">Chọn chuyến bay</label>
                          <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                            {flights.length === 0 ? (
                              <div className="p-6 bg-white rounded-2xl border border-red-200 text-center">
                                <p className="text-base text-red-600 font-medium">Hiện không có chuyến bay nào khả dụng</p>
                              </div>
                            ) : (
                              flights.map(f => (
                                <div 
                                  key={f.FlightID}
                                  onClick={() => setFlightId(f.FlightID)}
                                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                                    parseInt(flightId) === f.FlightID ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-ink-200 bg-white hover:border-sky-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                  <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl ${parseInt(flightId) === f.FlightID ? 'bg-sky-200' : 'bg-ink-100'}`}>
                                    <Icon name="plane" className="h-7 w-7 text-sky-600" />
                                  </div>
                                    <div>
                                      <p className="font-bold text-ink-900 text-lg flex items-center gap-2 mb-1">
                                        {f.AirlineName} 
                                        <span className="text-xs px-2 py-1 bg-ink-100 rounded-lg font-medium text-ink-600">{f.FlightNumber}</span>
                                      </p>
                                      <div className="flex items-center gap-2 text-sm font-bold text-ink-700 mb-1">
                                        <span>{f.DepartureAirport}</span>
                                        <span className="text-ink-400">→</span>
                                        <span>{f.ArrivalAirport}</span>
                                      </div>
                                      <p className="text-xs text-ink-500">
                                        {new Date(f.DepartureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(f.ArrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} | {new Date(f.DepartureTime).toLocaleDateString('vi-VN')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <p className="text-xs text-ink-500 mb-1 font-semibold uppercase tracking-wider">Phụ thu</p>
                                    <p className="amount font-bold text-2xl text-sky-600">+{Number(f.Price).toLocaleString()}đ</p>
                                    <p className="text-xs text-ink-400 font-medium">/ khách</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-bold text-ink-700 mb-2">Tên hành khách</label>
                            <input 
                              type="text" 
                              placeholder="User Name"
                              className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 text-sm focus:border-sky-500 focus:outline-none transition"
                              value={passengerName} 
                              onChange={e => setPassengerName(e.target.value.toUpperCase())} 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-ink-700 mb-2">CCCD / Hộ chiếu</label>
                            <input 
                              type="text" 
                              placeholder="Số giấy tờ định danh"
                              className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 text-sm focus:border-sky-500 focus:outline-none transition"
                              value={idCard} 
                              onChange={e => setIdCard(e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-ink-700 mb-2">Mã ghế ngồi (Tùy chọn)</label>
                          <input 
                            type="text" 
                            placeholder="VD: 14A, 14B"
                            className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 text-sm focus:border-sky-500 focus:outline-none transition"
                            value={seatNumber} 
                            onChange={e => setSeatNumber(e.target.value)} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      onClick={handleNextStep}
                      className="rounded-2xl bg-brand-500 px-10 py-4 font-bold text-white hover:bg-brand-600 transition-all duration-300 hover:shadow-2xl hover:scale-105 text-lg"
                    >
                      Tiếp tục thanh toán →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT & CONFIRMATION */}
              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-ink-900 pb-4 border-b-2 border-ink-100">Thông tin thanh toán</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="vivu-checkout-contact-card">
                      <div className="vivu-checkout-contact-title"><span>✓</span><div><strong>Thông tin người liên hệ</strong><small>Thông tin từ tài khoản Vivu Travel</small></div><span className="vivu-checkout-verified">Đã xác minh</span></div>
                      <div className="vivu-checkout-contact-fields"><div><small>Họ và tên</small><strong>{user?.name || 'Khách hàng Vivu'}</strong></div><div><small>Email nhận xác nhận</small><strong>{user?.email || 'Chưa có email tài khoản'}</strong></div></div>
                    </section>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-ink-800">1. Ngày khởi hành</h3>
                      <div className="rounded-2xl bg-cream p-5 border-2 border-ink-200">
                        <label className="block text-sm font-bold text-ink-700 mb-3 uppercase tracking-wider">
                          Chọn ngày khởi hành
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-xl border-2 border-ink-200 focus:outline-none focus:border-brand-500 transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-ink-800">2. Phương thức thanh toán</h3>
                      <div className="grid gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <label 
                            key={method.id}
                            className={`flex items-center gap-5 cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
                              paymentMethod === method.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200 hover:border-brand-200'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value={method.id}
                              checked={paymentMethod === method.id}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-5 h-5 text-brand-600 focus:ring-brand-500"
                            />
                            <div className="text-3xl">{method.icon}</div>
                            <div className="flex-1">
                              <p className="text-sm text-ink-600 mt-1">{method.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-ink-800 mb-3">Yêu cầu đặc biệt (Tùy chọn)</h3>
                      <textarea
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Ví dụ: Phòng non-smoking, người ăn chay, đón tại sân bay..."
                        rows="4"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-ink-200 focus:outline-none focus:border-brand-500 transition"
                      ></textarea>
                    </div>

                    <div className="flex gap-4 pt-6 border-t-2 border-ink-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 rounded-2xl border-2 border-ink-300 px-6 py-4 font-bold text-ink-700 hover:bg-cream transition text-lg"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-2xl bg-brand-500 px-6 py-4 font-bold text-white hover:bg-brand-600 transition disabled:opacity-50 hover:shadow-2xl text-lg"
                      >
                        {submitting ? 'Đang xử lý...' : '✓ Xác nhận & Thanh toán'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar Summary Card */}
          <div className="lg:col-span-1">
            <div className="vivu-checkout-summary sticky top-24 rounded-3xl bg-white shadow-2xl border-2 border-ink-100 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-600"></div>
              <div className="p-6">
                <h3 className="mb-6 text-2xl font-bold text-ink-900 border-b-2 border-ink-100 pb-4">Tóm tắt đơn hàng</h3>

                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-1">Tên Tour</p>
                    <p className="font-bold text-ink-900 text-lg">{tourName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-1">Khách hàng</p>
                    <p className="font-medium text-ink-800">{user?.name} ({user?.email})</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-1">Số khách</p>
                      <div className="text-sm font-bold text-ink-800">
                        {adults > 0 && <span> {adults} người lớn</span>}
                        {adults > 0 && children > 0 && <span className="mx-1">·</span>}
                        {children > 0 && <span> {children} trẻ em</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-1">Thời gian</p>
                      <p className="font-bold text-ink-800">{duration}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between rounded-2xl bg-cream p-5 border-2 border-ink-200">
                  <div>
                    <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-1">Ngày khởi hành</p>
                    <p className="font-bold text-ink-800">{new Date(bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-1">Thanh toán</p>
                    <p className="font-bold text-ink-800">{paymentMethod}</p>
                  </div>
                </div>

                <div className="mb-5 p-5 bg-brand-50 rounded-2xl border-2 border-brand-200">
                  <p className="text-xs text-brand-900 font-bold uppercase tracking-wider mb-2">Khách sạn</p>
                  <p className="font-bold text-brand-900 text-lg flex justify-between items-center">
                    <span>{selectedRoom?.title}</span>
                    <span className="text-2xl">{selectedRoom?.icon}</span>
                  </p>
                  <p className="text-sm text-brand-700 mt-2 font-medium">Giường: {bedType === 'Double' ? 'Giường đôi lớn' : '2 Giường đơn'}</p>
                </div>

                {isCombo && selectedFlight && (
                  <div className="mb-6 p-5 bg-sky-50 rounded-2xl border-2 border-sky-200">
                    <p className="text-xs text-sky-900 font-bold uppercase tracking-wider mb-2">Vé máy bay</p>
                    <p className="font-bold text-sky-900 text-base">
                      {selectedFlight.AirlineName} ({selectedFlight.FlightNumber})
                    </p>
                    <p className="text-sm text-sky-700 mt-2 font-medium">
                      {selectedFlight.DepartureCity} → {selectedFlight.ArrivalCity}
                    </p>
                  </div>
                )}

                <div className="mb-6 space-y-3 text-base">
                  <div className="flex justify-between text-ink-700">
                    <span>Giá tour người lớn × {adults}</span>
                    <span className="amount font-bold">{(basePrice * adults).toLocaleString()} VNĐ</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between text-brand-700">
                      <span>Giá tour trẻ em × {children} <span className="text-xs">(giảm 30%)</span></span>
                      <span className="amount font-bold">{(childPrice * children).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {roomSurcharge > 0 && (
                    <div className="flex justify-between text-ink-700">
                      <span>Phụ thu phòng × {totalGuests}</span>
                      <span className="amount font-bold">{(roomSurcharge * totalGuests).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {isCombo && flightPrice > 0 && (
                    <div className="flex justify-between text-sky-700">
                      <span>Vé máy bay × {totalGuests}</span>
                      <span className="amount font-bold">{(flightPrice * totalGuests).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="pt-4 mt-4 border-t-2 border-ink-200">
                    <div className="flex justify-between items-end">
                      <span className="text-ink-900 font-bold text-lg">Tổng thanh toán</span>
                      <span className="amount text-3xl font-bold text-brand-600">
                        {totalPrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <p className="text-right text-xs text-ink-500 mt-2 font-medium">Đã bao gồm thuế và phí dịch vụ</p>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-ink-100 flex items-center justify-center gap-2 text-xs text-ink-600 font-bold">
                  <span> Thanh toán bảo mật 100% SSL</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
