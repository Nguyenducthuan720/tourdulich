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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-slate-600 font-medium">Đang tải chi tiết tour...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-2xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-slate-900">Không tìm thấy tour</p>
          <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">← Quay lại trang chủ</button>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Image Section */}
      <div className="relative h-screen max-h-96 w-full overflow-hidden bg-slate-200">
        <img
          src={mainImage}
          alt={tourName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-900 font-semibold hover:bg-white transition z-10"
        >
          ← Quay lại
        </button>

        {/* Category Badge */}
        <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end">
          <span className="px-4 py-2 rounded-full bg-white/90 text-slate-900 text-sm font-bold">
            🏷️ {categoryName}
          </span>
          <span className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-bold">
            ⭐ 4.8/5
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">{tourName}</h1>
          <div className="flex gap-6 text-lg font-semibold drop-shadow-lg">
            <span>📍 {destination}</span>
            <span>⏱️ {duration}</span>
            <span>👥 {availableSeats} chỗ</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="rounded-xl bg-white overflow-hidden shadow-md mb-8">
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${mainImage === img ? 'border-emerald-500' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`Tour ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition"
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="flex border-b border-slate-200">
                {[
                  { id: 'overview', label: ' Tổng quan', icon: '' },
                  { id: 'itinerary', label: ' Lịch trình', icon: '' },
                  { id: 'highlights', label: ' Điểm nổi bật', icon: '' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 px-4 py-4 font-semibold text-center border-b-2 transition ${selectedTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {selectedTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4"> Mô tả tour</h3>
                      <p className="text-slate-700 leading-relaxed text-lg">{description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 border border-emerald-200">
                        <p className="text-sm text-emerald-900 font-medium">Thời gian</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">⏱</p>
                        <p className="text-lg font-bold text-slate-900">{duration}</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 border border-blue-200">
                        <p className="text-sm text-blue-900 font-medium">Giá từ</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1"></p>
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(price)}</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 border border-orange-200">
                        <p className="text-sm text-orange-900 font-medium">Còn lại</p>
                        <p className="text-2xl font-bold text-orange-600 mt-1">👥</p>
                        <p className="text-lg font-bold text-slate-900">{availableSeats} chỗ</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'itinerary' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900">🗺️ Lịch trình chi tiết</h3>
                    {[1, 2, 3].map((day) => (
                      <div key={day} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg flex-shrink-0">
                            {day}
                          </div>
                          {day < 3 && <div className="w-1 h-12 bg-gradient-to-b from-emerald-500 to-transparent mt-2"></div>}
                        </div>
                        <div className="pb-6">
                          <h4 className="text-xl font-bold text-slate-900 mb-2">Ngày {day}: {day === 1 ? 'Khởi hành' : day === 2 ? 'Tham quan' : 'Trở về'}</h4>
                          <p className="text-slate-600 leading-relaxed">
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
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6"> Điểm nổi bật</h3>
                    {[
                      ' Hướng dẫn viên chuyên nghiệp, nói tiếng Anh/Trung',
                      ' Khách sạn 3-5 sao, vị trí tuyệt vời',
                      'Ăn sáng, trưa, tối đầy đủ, ẩm thực địa phương',
                      ' Bảo hiểm du lịch toàn diện',
                      ' Gợi ý cá nhân hóa từ AI, tối ưu hóa lịch trình',
                      ' Vận chuyển thoải mái với xe cao cấp',
                    ].map((highlight, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition">
                        <span className="text-2xl flex-shrink-0">{highlight.split(' ')[0]}</span>
                        <p className="text-slate-800 font-medium">{highlight.slice(highlight.indexOf(' ') + 1)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div className="sticky top-24 rounded-xl bg-white shadow-lg overflow-hidden border border-slate-200">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

              <div className="p-6">
                <h3 className="mb-6 text-2xl font-bold text-slate-900"> Đặt tour</h3>

                {/* Price Summary */}
                <div className="mb-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-5 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Người lớn</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Trẻ em (≤11 tuổi)</p>
                      <p className="text-2xl font-bold text-orange-500">{formatCurrency(childPrice)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-emerald-200">Trẻ em giảm 30% · Đã bao gồm tất cả chi phí</p>
                </div>

                {/* Guest Selection */}
                <div className="mb-5">
                  <label className="mb-3 block text-sm font-bold text-slate-700">👥 Số lượng khách</label>

                  {/* Adults */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">🧑 Người lớn</p>
                        <p className="text-xs text-slate-500">{formatCurrency(price)} / người</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="h-8 w-8 rounded-md bg-white hover:bg-emerald-50 hover:text-emerald-600 font-bold text-lg transition shadow-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-lg">{adults}</span>
                        <button
                          onClick={() => setAdults(Math.min(availableSeats - children, adults + 1))}
                          className="h-8 w-8 rounded-md bg-white hover:bg-emerald-50 hover:text-emerald-600 font-bold text-lg transition shadow-sm"
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
                        <p className="text-sm font-semibold text-slate-800">👶 Trẻ em <span className="text-xs font-normal text-slate-500">(≤11 tuổi)</span></p>
                        <p className="text-xs text-orange-500 font-medium">{formatCurrency(childPrice)} / trẻ em</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="h-8 w-8 rounded-md bg-white hover:bg-orange-50 hover:text-orange-600 font-bold text-lg transition shadow-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold text-lg">{children}</span>
                        <button
                          onClick={() => setChildren(Math.min(availableSeats - adults, children + 1))}
                          className="h-8 w-8 rounded-md bg-white hover:bg-orange-50 hover:text-orange-600 font-bold text-lg transition shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Price Breakdown */}
                <div className="mb-6 rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-2">
                  {adults > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">🧑 Người lớn × {adults}</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(price * adults)}</span>
                    </div>
                  )}
                  {children > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">👶 Trẻ em × {children}</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(childPrice * children)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">Tổng cộng ({totalGuests} khách)</span>
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  onClick={handleBooking}
                  className="w-full mb-3 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/50 transition duration-200 hover:scale-105"
                >
                   Đặt tour ngay
                </button>

                {/* Available Seats Warning */}
                {availableSeats <= 5 && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-xs text-red-700 font-semibold"> Chỉ còn {availableSeats} chỗ, đặt nhanh!</p>
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">ℹ Chính sách hủy</p>
                  <p className="text-xs text-blue-800">Hủy miễn phí trước 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
