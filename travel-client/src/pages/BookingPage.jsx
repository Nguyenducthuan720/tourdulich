import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { createBooking, getFlights } from '../api/bookingService'
import { useAuth } from '../context/AuthContext'
import { fallbackTours } from '../data/mockData'

const ROOM_OPTIONS = [
  { id: 'Standard', title: 'Phòng Tiêu Chuẩn', desc: 'Diện tích 25m2, đầy đủ tiện nghi cơ bản.', price: 0, icon: '🛏️' },
  { id: 'Deluxe', title: 'Phòng Deluxe', desc: 'Diện tích 35m2, ban công view đẹp, bồn tắm.', price: 500000, icon: '✨' },
  { id: 'Suite', title: 'Phòng VIP / Suite', desc: 'Diện tích 50m2, phòng khách riêng, dịch vụ 24/7.', price: 1500000, icon: '👑' }
]

const PAYMENT_METHODS = [
  { id: 'Chuyển khoản', title: 'Chuyển khoản ngân hàng', desc: 'Thanh toán qua quét mã QR hoặc chuyển khoản', icon: '🏦' },
  { id: 'Thẻ tín dụng', title: 'Thẻ Visa / Master', desc: 'Thanh toán bảo mật qua cổng thanh toán', icon: '💳' },
  { id: 'Ví điện tử', title: 'Momo / ZaloPay', desc: 'Thanh toán nhanh chóng bằng ví điện tử', icon: '📱' }
]

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

  const [step, setStep] = useState(1)
  
  const adults = parseInt(searchParams.get('adults')) || 1
  const children = parseInt(searchParams.get('children')) || 0
  const totalGuests = adults + children
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
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
    fetchData()
  }, [id, isAuthenticated, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const tourData = await getTourById(id)
      setTour(tourData)
      
      const flightData = await getFlights()
      setFlights(flightData)
    } catch (error) {
      console.error('Fetch booking data error:', error)
      setTour(fallbackTours[0])
    } finally {
      setLoading(false)
    }
  }

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

      await createBooking(bookingData)
      
      setSuccess(isCombo ? 'Đặt gói Combo (Tour + Vé máy bay) thành công!' : 'Đặt tour thành công! Vui lòng kiểm tra email để xác nhận')
      setTimeout(() => {
        navigate('/my-bookings')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Lỗi khi xử lý đặt chỗ')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="h-32 bg-slate-200 rounded-3xl animate-pulse mb-8"></div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[600px] bg-slate-200 rounded-3xl animate-pulse"></div>
            <div className="h-[600px] bg-slate-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-7xl mb-4">🔍</p>
          <p className="text-2xl font-bold text-slate-900">Không tìm thấy tour</p>
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        
        {/* Wizard Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Xác nhận đặt tour</h1>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  step >= 1 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-bold ${step >= 1 ? 'text-amber-600' : 'text-slate-500'}`}>Bước 1</p>
                  <p className={`text-base font-bold ${step >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>Lựa chọn dịch vụ</p>
                </div>
              </div>
              
              <div className="flex-1 h-2 bg-slate-200 rounded-full mx-4 overflow-hidden">
                <div className={`h-full bg-amber-500 rounded-full transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className={`text-sm font-bold ${step >= 2 ? 'text-amber-600' : 'text-slate-500'}`}>Bước 2</p>
                  <p className={`text-base font-bold ${step >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>Thanh toán</p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                  step >= 2 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 animate-fade-in">
            <p className="text-emerald-900 font-bold text-lg">✓ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border-2 border-red-200 p-5 animate-fade-in">
            <p className="text-red-900 font-bold text-lg">⚠️ {error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-8 shadow-lg border border-slate-100">
              
              {/* STEP 1: ROOM & FLIGHT SELECTION */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-900 pb-4 border-b-2 border-slate-100">Lựa chọn dịch vụ</h2>
                  
                  {/* 1. Hạng phòng */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800">1. Hạng phòng khách sạn</h3>
                    <div className="grid gap-4">
                      {ROOM_OPTIONS.map((room) => (
                        <div 
                          key={room.id}
                          onClick={() => setRoomType(room.id)}
                          className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg ${
                            roomType === room.id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-200'
                          }`}
                        >
                          {roomType === room.id && (
                            <div className="absolute top-5 right-5 text-amber-600">
                              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                            </div>
                          )}
                          <div className="flex items-start gap-5">
                            <div className="text-4xl">{room.icon}</div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-slate-900 mb-2">{room.title}</h4>
                              <p className="text-sm text-slate-600 mb-3">{room.desc}</p>
                              <p className="text-base font-bold text-amber-700">
                                {room.price === 0 ? 'Miễn phí phụ thu' : `Phụ thu: +${room.price.toLocaleString()} VNĐ / người`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Loại giường */}
                  <div className="space-y-4 pt-6 border-t-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">2. Loại giường (Tùy chọn)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`cursor-pointer rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
                        bedType === 'Double' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-200'
                      }`}>
                        <input type="radio" name="bedType" className="hidden" checked={bedType === 'Double'} onChange={() => setBedType('Double')} />
                        <p className="text-3xl mb-2">🛏️</p>
                        <p className={`font-bold ${bedType === 'Double' ? 'text-amber-700' : 'text-slate-700'}`}>Giường đôi lớn</p>
                      </label>
                      <label className={`cursor-pointer rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
                        bedType === 'Twin' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-200'
                      }`}>
                        <input type="radio" name="bedType" className="hidden" checked={bedType === 'Twin'} onChange={() => setBedType('Twin')} />
                        <p className="text-3xl mb-2">🛏️🛏️</p>
                        <p className={`font-bold ${bedType === 'Twin' ? 'text-amber-700' : 'text-slate-700'}`}>2 Giường đơn</p>
                      </label>
                    </div>
                  </div>

                  {/* 3. Combo Flight */}
                  <div className="space-y-4 pt-6 border-t-2 border-slate-100">
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
                        <p className="font-bold text-sky-900 text-lg mb-1">✈️ Mua thêm vé máy bay (Combo)</p>
                        <p className="text-sm text-sky-700">Tiết kiệm tới 15% chi phí so với mua lẻ</p>
                      </div>
                    </label>

                    {isCombo && (
                      <div className="p-6 bg-gradient-to-br from-sky-50 to-slate-50 border-2 rounded-2xl space-y-6 border-sky-200 shadow-inner animate-fade-in">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Chọn chuyến bay</label>
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
                                    parseInt(flightId) === f.FlightID ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-slate-200 bg-white hover:border-sky-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl ${parseInt(flightId) === f.FlightID ? 'bg-sky-200' : 'bg-slate-100'}`}>
                                      ✈️
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-1">
                                        {f.AirlineName} 
                                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-lg font-medium text-slate-600">{f.FlightNumber}</span>
                                      </p>
                                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                                        <span>{f.DepartureAirport}</span>
                                        <span className="text-slate-400">→</span>
                                        <span>{f.ArrivalAirport}</span>
                                      </div>
                                      <p className="text-xs text-slate-500">
                                        {new Date(f.DepartureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(f.ArrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} | {new Date(f.DepartureTime).toLocaleDateString('vi-VN')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Phụ thu</p>
                                    <p className="font-bold text-2xl text-sky-600">+{Number(f.Price).toLocaleString()}đ</p>
                                    <p className="text-xs text-slate-400 font-medium">/ khách</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tên hành khách</label>
                            <input 
                              type="text" 
                              placeholder="NGUYEN VAN A"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:border-sky-500 focus:outline-none transition"
                              value={passengerName} 
                              onChange={e => setPassengerName(e.target.value.toUpperCase())} 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">CCCD / Hộ chiếu</label>
                            <input 
                              type="text" 
                              placeholder="Số giấy tờ định danh"
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:border-sky-500 focus:outline-none transition"
                              value={idCard} 
                              onChange={e => setIdCard(e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Mã ghế ngồi (Tùy chọn)</label>
                          <input 
                            type="text" 
                            placeholder="VD: 14A, 14B"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:border-sky-500 focus:outline-none transition"
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
                      className="rounded-2xl bg-amber-500 px-10 py-4 font-bold text-white hover:bg-amber-600 transition-all duration-300 hover:shadow-2xl hover:scale-105 text-lg"
                    >
                      Tiếp tục thanh toán →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT & CONFIRMATION */}
              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-900 pb-4 border-b-2 border-slate-100">Thông tin thanh toán</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800">1. Ngày khởi hành</h3>
                      <div className="rounded-2xl bg-slate-50 p-5 border-2 border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                          Chọn ngày khởi hành
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800">2. Phương thức thanh toán</h3>
                      <div className="grid gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <label 
                            key={method.id}
                            className={`flex items-center gap-5 cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
                              paymentMethod === method.id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-200'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value={method.id}
                              checked={paymentMethod === method.id}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                            />
                            <div className="text-3xl">{method.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900 text-base">{method.title}</h4>
                              <p className="text-sm text-slate-600 mt-1">{method.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-3">Yêu cầu đặc biệt (Tùy chọn)</h3>
                      <textarea
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Ví dụ: Phòng non-smoking, người ăn chay, đón tại sân bay..."
                        rows="4"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition"
                      ></textarea>
                    </div>

                    <div className="flex gap-4 pt-6 border-t-2 border-slate-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 rounded-2xl border-2 border-slate-300 px-6 py-4 font-bold text-slate-700 hover:bg-slate-50 transition text-lg"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-2xl bg-amber-500 px-6 py-4 font-bold text-white hover:bg-amber-600 transition disabled:opacity-50 hover:shadow-2xl text-lg"
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
            <div className="sticky top-24 rounded-3xl bg-white shadow-2xl border-2 border-slate-100 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <div className="p-6">
                <h3 className="mb-6 text-2xl font-bold text-slate-900 border-b-2 border-slate-100 pb-4">Tóm tắt đơn hàng</h3>

                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tên Tour</p>
                    <p className="font-bold text-slate-900 text-lg">{tourName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Khách hàng</p>
                    <p className="font-medium text-slate-800">{user?.name} ({user?.email})</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Số khách</p>
                      <div className="text-sm font-bold text-slate-800">
                        {adults > 0 && <span> {adults} người lớn</span>}
                        {adults > 0 && children > 0 && <span className="mx-1">·</span>}
                        {children > 0 && <span> {children} trẻ em</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Thời gian</p>
                      <p className="font-bold text-slate-800">{duration}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-5 p-5 bg-amber-50 rounded-2xl border-2 border-amber-200">
                  <p className="text-xs text-amber-900 font-bold uppercase tracking-wider mb-2">Khách sạn</p>
                  <p className="font-bold text-amber-900 text-lg flex justify-between items-center">
                    <span>{selectedRoom?.title}</span>
                    <span className="text-2xl">{selectedRoom?.icon}</span>
                  </p>
                  <p className="text-sm text-amber-700 mt-2 font-medium">Giường: {bedType === 'Double' ? 'Giường đôi lớn' : '2 Giường đơn'}</p>
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
                  <div className="flex justify-between text-slate-700">
                    <span>Giá tour người lớn × {adults}</span>
                    <span className="font-bold">{(basePrice * adults).toLocaleString()} VNĐ</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between text-orange-700">
                      <span>Giá tour trẻ em × {children} <span className="text-xs">(giảm 30%)</span></span>
                      <span className="font-bold">{(childPrice * children).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {roomSurcharge > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Phụ thu phòng × {totalGuests}</span>
                      <span className="font-bold">{(roomSurcharge * totalGuests).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {isCombo && flightPrice > 0 && (
                    <div className="flex justify-between text-sky-700">
                      <span>Vé máy bay × {totalGuests}</span>
                      <span className="font-bold">{(flightPrice * totalGuests).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="pt-4 mt-4 border-t-2 border-slate-200">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-900 font-bold text-lg">Tổng thanh toán</span>
                      <span className="text-3xl font-bold text-amber-600">
                        {totalPrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <p className="text-right text-xs text-slate-500 mt-2 font-medium">Đã bao gồm thuế và phí dịch vụ</p>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600 font-bold">
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
