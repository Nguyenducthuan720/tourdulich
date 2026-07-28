import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { createBooking, getFlights } from '../api/bookingService' // Đã import thêm getFlights
import { useAuth } from '../context/AuthContext'
import { fallbackTours } from '../data/mockData'

const ROOM_OPTIONS = [
  { id: 'Standard', title: 'Phòng Tiêu Chuẩn', desc: 'Diện tích 25m2, đầy đủ tiện nghi cơ bản.', price: 0, icon: '🛏️' },
  { id: 'Deluxe', title: 'Phòng Deluxe', desc: 'Diện tích 35m2, ban công view đẹp, bồn tắm.', price: 500000, icon: '✨' },
  { id: 'Suite', title: 'Phòng VIP / Suite', desc: 'Diện tích 50m2, phòng khách riêng, dịch vụ 24/7.', price: 1500000, icon: '👑' }
];

const PAYMENT_METHODS = [
  { id: 'Chuyển khoản', title: 'Chuyển khoản ngân hàng', desc: 'Thanh toán qua quét mã QR hoặc chuyển khoản', icon: '🏦' },
  { id: 'Thẻ tín dụng', title: 'Thẻ Visa / Master', desc: 'Thanh toán bảo mật qua cổng thanh toán', icon: '💳' },
  { id: 'Ví điện tử', title: 'Momo / ZaloPay', desc: 'Thanh toán nhanh chóng bằng ví điện tử', icon: '📱' }
];

export default function BookingPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  
  const [tour, setTour] = useState(null)
  const [flights, setFlights] = useState([]) // State lưu danh sách chuyến bay
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Wizard state
  const [step, setStep] = useState(1)
  
  // Form state gốc của bạn
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

  // Form state bổ sung cho tính năng COMBO MÁY BAY
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

  // Tải đồng thời cả thông tin Tour lẫn danh sách Chuyến bay
  const fetchData = async () => {
    try {
      setLoading(true)
      const tourData = await getTourById(id)
      setTour(tourData)
      
      // Gọi API lấy danh sách chuyến bay từ backend
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
    // Nếu chọn combo nhưng chưa chọn chuyến bay hoặc điền thiếu tên/CCCD thì chặn lại
    if (isCombo) {
      if (!flightId) {
        setError('Vui lòng chọn một chuyến bay phù hợp cho gói Combo!');
        return;
      }
      if (!passengerName.trim() || !idCard.trim()) {
        setError('Vui lòng điền đầy đủ Tên hành khách và Số CCCD/Hộ chiếu!');
        return;
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
      
      // Khởi tạo payload động dựa trên trạng thái gói Combo
      const bookingData = {
        tourId: tour?.TourID || tour?.id,
        date: bookingDate,
        guests: totalGuests,
        adults: adults,
        children: children,
        roomType: roomType,
        paymentMethod: paymentMethod,
        specialRequest: specialRequest,
        // Nếu chọn combo thì đẩy thêm các trường dữ liệu máy bay
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu chuyến bay và tour...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-slate-600">Không tìm thấy tour</p>
      </div>
    )
  }

  const tourName = tour.TourName || tour.title
  const basePrice = tour.Price || tour.price
  const duration = tour.Duration || tour.duration
  
  const selectedRoom = ROOM_OPTIONS.find(r => r.id === roomType)
  const roomSurcharge = selectedRoom ? selectedRoom.price : 0
  
  // Tính toán chi phí máy bay nếu người dùng chọn gói Combo
  const selectedFlight = flights.find(f => f.FlightID === parseInt(flightId))
  const flightPrice = (isCombo && selectedFlight) ? selectedFlight.Price : 0

  const childPrice = Math.round(basePrice * 0.7)

  // Tổng giá = (Giá tour người lớn * người lớn + Giá tour trẻ em * trẻ em + phụ thu phòng * tổng khách + vé máy bay * tổng khách)
  const totalPrice = (basePrice + roomSurcharge + flightPrice) * adults + (childPrice + roomSurcharge + flightPrice) * children

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        
        {/* Wizard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Xác nhận đặt tour</h1>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`h-1 flex-1 mx-4 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className={`text-sm font-bold ${step >= 1 ? 'text-emerald-700' : 'text-slate-500'}`}>Lựa chọn dịch vụ & Combo</span>
            <span className={`text-sm font-bold ${step >= 2 ? 'text-emerald-700' : 'text-slate-500'}`}>Thanh toán & Xác nhận</span>
          </div>
        </div>

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-emerald-800 font-medium">✓ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800 font-medium">⚠️ Lỗi: {error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              
              {/* STEP 1: ROOM & FLIGHT SELECTION */}
              {step === 1 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Lựa chọn phòng & Vé máy bay</h2>
                  
                  {/* 1. Hạng phòng */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">1. Hạng phòng khách sạn</h3>
                    <div className="grid gap-4">
                      {ROOM_OPTIONS.map((room) => (
                        <div 
                          key={room.id}
                          onClick={() => setRoomType(room.id)}
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                            roomType === room.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-200'
                          }`}
                        >
                          {roomType === room.id && (
                            <div className="absolute top-4 right-4 text-emerald-600">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            </div>
                          )}
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">{room.icon}</div>
                            <div>
                              <h4 className="font-bold text-slate-900">{room.title}</h4>
                              <p className="text-sm text-slate-600 mt-1">{room.desc}</p>
                              <p className="text-sm font-semibold text-emerald-700 mt-2">
                                {room.price === 0 ? 'Miễn phí phụ thu' : `Phụ thu: +${room.price.toLocaleString()} VNĐ / người`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Loại giường */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-slate-800">2. Loại giường (Tùy chọn)</h3>
                    <div className="flex gap-4">
                      <label className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${bedType === 'Double' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="bedType" className="hidden" checked={bedType === 'Double'} onChange={() => setBedType('Double')} />
                         Giường đôi lớn
                      </label>
                      <label className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${bedType === 'Twin' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input type="radio" name="bedType" className="hidden" checked={bedType === 'Twin'} onChange={() => setBedType('Twin')} />
                         2 Giường đơn
                      </label>
                    </div>
                  </div>

                  {/* 3. TÍNH NĂNG MỚI: ĐẶT KÈM VÉ MÁY BAY (COMBO) */}
                  <div className="hidden space-y-4 pt-4 border-t">
                    <label className={`flex items-center space-x-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${isCombo ? 'bg-sky-100 border-sky-400 shadow-md' : 'bg-white border-sky-100 hover:border-sky-300 hover:bg-sky-50'}`}>
                      <input 
                        type="checkbox" disabled
                        className="w-6 h-6 rounded text-sky-600 focus:ring-sky-500 transition-transform hover:scale-110" 
                        checked={isCombo} 
                        onChange={(e) => {
                          setIsCombo(e.target.checked);
                          if(!e.target.checked) setFlightId(''); // Reset chuyến bay nếu bỏ chọn
                        }} 
                      />
                      <div>
                        <span className="font-bold text-sky-900 block text-lg">✈️ Mua thêm vé máy bay đi kèm (Nâng cấp gói Combo)</span>
                        <span className="text-sm text-sky-700">Tiết kiệm tới 15% chi phí so với mua lẻ và được đảm bảo giữ chỗ hành trình</span>
                      </div>
                    </label>

                    {/* Form phụ hiển thị khi kích hoạt Combo */}
                    {isCombo && (
                      <div className="p-6 bg-gradient-to-b from-sky-50 to-slate-50 border-2 rounded-xl space-y-6 border-sky-200 shadow-inner">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3">Chọn chuyến bay phù hợp</label>
                          <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {flights.length === 0 ? (
                              <div className="p-4 bg-white rounded-lg border border-red-200 text-center">
                                <p className="text-sm text-red-600">Hiện không có chuyến bay nào khả dụng. Vui lòng thử lại sau.</p>
                              </div>
                            ) : (
                              flights.map(f => (
                                <div 
                                  key={f.FlightID}
                                  onClick={() => setFlightId(f.FlightID)}
                                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                                    parseInt(flightId) === f.FlightID ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-sky-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-xl ${parseInt(flightId) === f.FlightID ? 'bg-sky-200' : 'bg-slate-100'}`}>
                                      ✈️
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        {f.AirlineName} 
                                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-600">{f.FlightNumber}</span>
                                      </p>
                                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mt-1">
                                        <span>{f.DepartureAirport}</span>
                                        <span className="text-slate-400">➔</span>
                                        <span>{f.ArrivalAirport}</span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-1">
                                        {new Date(f.DepartureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(f.ArrivalTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} | {new Date(f.DepartureTime).toLocaleDateString('vi-VN')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <p className="text-sm text-slate-500 mb-1">Phụ thu vé bay</p>
                                    <p className="font-bold text-xl text-sky-600">+{f.Price.toLocaleString()}đ</p>
                                    <p className="text-xs text-slate-400 font-medium">/ khách</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên hành khách đại diện</label>
                            <input 
                              type="text" 
                              placeholder="Ví dụ: NGUYEN VAN A"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                              value={passengerName} 
                              onChange={e => setPassengerName(e.target.value.toUpperCase())} 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Số CCCD / Hộ chiếu</label>
                            <input 
                              type="text" 
                              placeholder="Nhập số giấy tờ định danh"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                              value={idCard} 
                              onChange={e => setIdCard(e.target.value)} 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Yêu cầu mã ghế ngồi (Nếu có)</label>
                          <input 
                            type="text" 
                            placeholder="VD: 14A, 14B (Tùy chọn theo tình trạng check-in lúc khởi hành)"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
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
                      className="rounded-lg bg-emerald-600 px-8 py-3 font-bold text-white hover:bg-emerald-700 transition hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Tiếp tục thanh toán →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT & CONFIRMATION */}
              {step === 2 && (
                <div className="animate-fade-in space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 border-b pb-4">Thông tin Thanh toán</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Thông tin chuyến đi */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800">1. Thông tin khởi hành</h3>
                      <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                           Ngày khởi hành mong muốn
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-800">2. Phương thức thanh toán</h3>
                      <div className="grid gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <label 
                            key={method.id}
                            className={`flex items-center gap-4 cursor-pointer rounded-lg border p-4 transition-all ${
                              paymentMethod === method.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value={method.id}
                              checked={paymentMethod === method.id}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-2xl">{method.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{method.title}</h4>
                              <p className="text-sm text-slate-500">{method.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Yêu cầu đặc biệt */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Yêu cầu đặc biệt (tùy chọn)</h3>
                      <textarea
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        placeholder="Ví dụ: Cần phòng non-smoking, người ăn chay, đón tại sân bay..."
                        rows="3"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      ></textarea>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        ← Quay lại chọn phòng
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 hover:shadow-lg"
                      >
                        {submitting ? ' Đang xử lý dữ liệu...' : '✓ Xác nhận đặt Combo & Thanh toán'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-6">
                <h3 className="mb-4 text-xl font-bold text-slate-900 border-b pb-4">Tóm tắt đơn hàng</h3>

                {/* Tour Info */}
                <div className="mb-6 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tên Tour</p>
                    <p className="font-bold text-slate-900">{tourName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Khách hàng</p>
                    <p className="font-medium text-slate-800">{user?.name} ({user?.email})</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Số khách</p>
                      <div className="text-sm font-medium text-slate-800">
                        {adults > 0 && <span>🧑 {adults} người lớn</span>}
                        {adults > 0 && children > 0 && <span className="mx-1">·</span>}
                        {children > 0 && <span>👶 {children} trẻ em</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Thời gian</p>
                      <p className="font-medium text-slate-800">{duration}</p>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider mb-1">Khách sạn lý tưởng</p>
                  <p className="font-bold text-emerald-900 flex justify-between">
                    <span>{selectedRoom?.title}</span>
                    <span>{selectedRoom?.icon}</span>
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">Giường: {bedType === 'Double' ? 'Giường đôi lớn' : '2 Giường đơn'}</p>
                </div>

                {/* Flight Combo Badge Info */}
                {isCombo && selectedFlight && (
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs text-orange-800 font-semibold uppercase tracking-wider mb-1">Vé máy bay đi kèm</p>
                    <p className="font-bold text-orange-900 text-sm">
                      {selectedFlight.AirlineName} ({selectedFlight.FlightNumber})
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Hành trình: {selectedFlight.DepartureCity} → {selectedFlight.ArrivalCity}
                    </p>
                  </div>
                )}

                {/* Pricing Detail */}
                <div className="mb-6 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Giá tour người lớn x {adults}</span>
                    <span className="font-medium">{(basePrice * adults).toLocaleString()} VNĐ</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Giá tour trẻ em x {children} <span className="text-xs">(giảm 30%)</span></span>
                      <span className="font-medium">{(childPrice * children).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {roomSurcharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Phụ thu phòng x {totalGuests}</span>
                      <span className="font-medium">{(roomSurcharge * totalGuests).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {isCombo && flightPrice > 0 && (
                    <div className="flex justify-between text-orange-700">
                      <span>Vé máy bay combo x {totalGuests}</span>
                      <span className="font-medium">{(flightPrice * totalGuests).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="pt-4 mt-2 border-t border-slate-200">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-900 font-bold">Tổng thanh toán</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {totalPrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <p className="text-right text-xs text-slate-500 mt-1">Đã bao gồm thuế và phí dịch vụ</p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <span>🔒 Thanh toán bảo mật 100% mã hóa SSL</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
