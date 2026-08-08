import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { formatCurrency } from '../utils/formatters'
import { FALLBACK_TOUR_IMAGE, getImageUrl } from '../utils/imageUrl'

export default function TourDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [mainImage, setMainImage] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    fetchTourDetail()
  }, [id])

  useEffect(() => {
    if (tour) {
      setMainImage(getImageUrl(tour.ImageURL || tour.image))
    }
  }, [tour])

  const fetchTourDetail = async () => {
    try {
      setLoading(true)
      const data = await getTourById(id)
      setTour(data)
    } catch (error) {
      console.error('Fetch tour detail error:', error)
      setTour(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = () => {
    navigate(`/booking/${tour?.id || tour?.TourID}?adults=${adults}&children=${children}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="h-[600px] bg-slate-200 animate-pulse"></div>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
              <div className="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
            </div>
            <div className="h-[600px] bg-slate-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="mb-6 text-7xl"></div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Không tìm thấy tour</h1>
          <p className="text-slate-600 mb-8">Tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => navigate('/')} className="rounded-2xl bg-amber-500 px-8 py-4 font-bold text-white hover:bg-amber-600 transition">
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  const tourName = tour.TourName || tour.title
  const destination = tour.Destination || tour.location
  const price = tour.Price || tour.price
  const duration = tour.Duration || tour.duration
  const description = tour.Description || tour.description
  const categoryName = tour.CategoryName || 'Khám phá'
  const availableSeats = tour.AvailableSeats || tour.seats
  const childPrice = Math.round(price * 0.7)
  const totalPrice = price * adults + childPrice * children
  const totalGuests = adults + children

  const galleryImages = [
    ...new Set([tour?.ImageURL || tour?.image, ...(tour?.images || [])].filter(Boolean).map((img) => getImageUrl(img))),
  ]
  if (galleryImages.length === 0) {
    galleryImages.push(mainImage || getImageUrl(FALLBACK_TOUR_IMAGE))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden bg-slate-900">
        <img
          src={mainImage}
          alt={tourName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/95 text-slate-900 font-bold hover:bg-white transition z-10"
        >
          ← Quay lại
        </button>

        {/* Category & Rating */}
        <div className="absolute top-6 right-6 flex gap-3 flex-wrap justify-end">
          <span className="px-5 py-2.5 rounded-full bg-white/95 text-slate-900 text-sm font-bold shadow-lg">
            🏷️ {categoryName}
          </span>
          <span className="px-5 py-2.5 rounded-full bg-amber-500 text-white text-sm font-bold shadow-lg">
            ⭐ 4.8/5
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">{tourName}</h1>
            <div className="flex flex-wrap gap-6 text-lg text-white/90 font-semibold drop-shadow-lg">
              <span className="flex items-center gap-2">📍 {destination}</span>
              <span className="flex items-center gap-2">⏱️ {duration}</span>
              <span className="flex items-center gap-2">👥 {availableSeats} chỗ còn trống</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="rounded-3xl bg-white overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">📸 Thư viện ảnh</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                        mainImage === img ? 'border-amber-500 scale-105 shadow-xl' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Tour ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="rounded-3xl bg-white shadow-lg overflow-hidden">
              <div className="flex border-b-2 border-slate-100">
                {[
                  { id: 'overview', label: 'Tổng quan'},
                  { id: 'itinerary', label: 'Lịch trình'},
                  { id: 'highlights', label: 'Nổi bật'},
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 px-6 py-5 font-bold text-center border-b-4 transition-all duration-300 ${
                      selectedTab === tab.id
                        ? 'border-amber-500 text-amber-600 bg-amber-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl mb-2 block">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-8">
                {selectedTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-4">Mô tả tour</h3>
                      <p className="text-slate-700 leading-relaxed text-lg">{description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 border-2 border-emerald-200">
                        <p className="text-sm text-emerald-900 font-semibold mb-2">Thời gian</p>
                        <p className="text-3xl font-bold text-emerald-600 mb-1"></p>
                        <p className="text-xl font-bold text-slate-900">{duration}</p>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 border-2 border-amber-200">
                        <p className="text-sm text-amber-900 font-semibold mb-2">Giá từ</p>
                        <p className="text-3xl font-bold text-amber-600 mb-1"></p>
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(price)}</p>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 border-2 border-blue-200">
                        <p className="text-sm text-blue-900 font-semibold mb-2">Còn lại</p>
                        <p className="text-3xl font-bold text-blue-600 mb-1"></p>
                        <p className="text-xl font-bold text-slate-900">{availableSeats} chỗ</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'itinerary' && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-bold text-slate-900"> Lịch trình chi tiết</h3>
                    {[1, 2, 3].map((day) => (
                      <div key={day} className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-2xl flex-shrink-0 shadow-lg">
                            {day}
                          </div>
                          {day < 3 && <div className="w-1 h-16 bg-gradient-to-b from-amber-500 to-transparent mt-3 rounded-full"></div>}
                        </div>
                        <div className="flex-1 pb-6">
                          <h4 className="text-2xl font-bold text-slate-900 mb-3">
                            Ngày {day}: {day === 1 ? 'Khởi hành & Nhận phòng' : day === 2 ? 'Tham quan & Khám phá' : 'Tự do & Trở về'}
                          </h4>
                          <p className="text-slate-600 leading-relaxed text-lg">
                            {day === 1 && 'Khởi hành sáng từ điểm tập trung, tới đích vào chiều tối. Nhận phòng, ăn tối và ở lại khách sạn.'}
                            {day === 2 && 'Tham quan các điểm du lịch nổi tiếng. Ăn sáng, trưa và tối. Ở lại khách sạn.'}
                            {day === 3 && 'Ăn sáng tại khách sạn. Có thời gian tự do khám phá. Trở về thành phố vào chiều tối.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTab === 'highlights' && (
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-slate-900 mb-8">✨ Điểm nổi bật</h3>
                    {[
                      {title: 'Hướng dẫn viên chuyên nghiệp', desc: 'Nói tiếng Anh/Trung, kinh nghiệm lâu năm' },
                      { title: 'Khách sạn 3-5 sao', desc: 'Vị trí tuyệt vời, tiện nghi hiện đại' },
                      { title: 'Ẩm thực đầy đủ', desc: 'Ăn sáng, trưa, tối, ẩm thực địa phương' },
                      { title: 'Bảo hiểm du lịch', desc: 'Toàn diện, hỗ trợ 24/7' },
                      { title: 'AI gợi ý cá nhân hóa', desc: 'Tối ưu hóa lịch trình theo sở thích' },
                      { title: 'Vận chuyển cao cấp', desc: 'Xe đời mới, thoải mái, an toàn' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-5 p-6 rounded-2xl bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 transition-all duration-300 hover:shadow-md">
                        <span className="text-4xl flex-shrink-0">{item.icon}</span>
                        <div>
                          <p className="text-xl font-bold text-slate-900 mb-1">{item.title}</p>
                          <p className="text-slate-700">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl bg-white shadow-2xl overflow-hidden border-2 border-slate-100">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>

              <div className="p-6">
                <h3 className="mb-6 text-2xl font-bold text-slate-900"> Đặt tour</h3>

                {/* Price Summary */}
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 border-2 border-amber-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Người lớn</p>
                      <p className="text-3xl font-bold text-amber-600">{formatCurrency(price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Trẻ em (≤11)</p>
                      <p className="text-3xl font-bold text-orange-500">{formatCurrency(childPrice)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 pt-4 border-t border-amber-300">Trẻ em giảm 30% · Đã bao gồm tất cả chi phí</p>
                </div>

                {/* Guest Selection */}
                <div className="mb-6">
                  <label className="mb-4 block text-sm font-bold text-slate-700 uppercase tracking-wider">👥 Số lượng khách</label>

                  {/* Adults */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-base font-bold text-slate-900"> Người lớn</p>
                        <p className="text-xs text-slate-600">{formatCurrency(price)} / người</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-2">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="h-10 w-10 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-600 font-bold text-xl transition shadow-md"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-xl">{adults}</span>
                        <button
                          onClick={() => setAdults(Math.min(availableSeats - children, adults + 1))}
                          className="h-10 w-10 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-600 font-bold text-xl transition shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Children */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-slate-900"> Trẻ em <span className="text-xs font-normal text-slate-600">(≤11 tuổi)</span></p>
                        <p className="text-xs text-orange-600 font-semibold">{formatCurrency(childPrice)} / trẻ em</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-2">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="h-10 w-10 rounded-xl bg-white hover:bg-orange-50 hover:text-orange-600 font-bold text-xl transition shadow-md"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-xl">{children}</span>
                        <button
                          onClick={() => setChildren(Math.min(availableSeats - adults, children + 1))}
                          className="h-10 w-10 rounded-xl bg-white hover:bg-orange-50 hover:text-orange-600 font-bold text-xl transition shadow-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Price Breakdown */}
                <div className="mb-6 rounded-2xl bg-slate-50 p-5 border-2 border-slate-200 space-y-3">
                  {adults > 0 && (
                    <div className="flex items-center justify-between text-base">
                      <span className="text-slate-700 font-medium"> Người lớn × {adults}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(price * adults)}</span>
                    </div>
                  )}
                  {children > 0 && (
                    <div className="flex items-center justify-between text-base">
                      <span className="text-slate-700 font-medium"> Trẻ em × {children}</span>
                      <span className="font-bold text-orange-600">{formatCurrency(childPrice * children)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-300 pt-3 flex items-center justify-between">
                    <span className="text-base text-slate-700 font-bold">Tổng cộng ({totalGuests} khách)</span>
                    <span className="text-3xl font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  onClick={handleBooking}
                  className="w-full mb-4 py-4 px-6 rounded-2xl bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                   Đặt tour ngay
                </button>

                {/* Available Seats Warning */}
                {availableSeats <= 5 && (
                  <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 mb-4">
                    <p className="text-sm text-red-700 font-bold"> Chỉ còn {availableSeats} chỗ, đặt nhanh!</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-2">ℹ Chính sách hủy</p>
                  <p className="text-sm text-blue-800">Hủy miễn phí trước 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
