import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { formatCurrency } from '../utils/formatters'
import { FALLBACK_TOUR_IMAGE, getImageUrl } from '../utils/imageUrl'
import { Icon } from '../components/icons'

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
      <div className="min-h-screen bg-cream">
        <div className="skeleton h-[600px]"></div>
        <div className="container-x py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="skeleton h-64 rounded-3xl"></div>
              <div className="skeleton h-96 rounded-3xl"></div>
            </div>
            <div className="skeleton h-[600px] rounded-3xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <span className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-brand-50 text-brand-500">
            <Icon name="map" className="h-12 w-12" />
          </span>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Không tìm thấy tour</h1>
          <p className="mt-3 text-ink-500">Tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary mt-8">
            Quay lại trang chủ
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
    ...new Set(
      [tour?.ImageURL || tour?.image, ...(tour?.images || [])]
        .filter(Boolean)
        .map((img) => getImageUrl(img)),
    ),
  ]
  if (galleryImages.length === 0) {
    galleryImages.push(mainImage || getImageUrl(FALLBACK_TOUR_IMAGE))
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'itinerary', label: 'Lịch trình' },
    { id: 'highlights', label: 'Nổi bật' },
  ]

  const highlights = [
    { title: 'Hướng dẫn viên chuyên nghiệp', desc: 'Nói tiếng Anh/Trung, kinh nghiệm lâu năm' },
    { title: 'Khách sạn 3-5 sao', desc: 'Vị trí tuyệt vời, tiện nghi hiện đại' },
    { title: 'Ẩm thực đầy đủ', desc: 'Ăn sáng, trưa, tối, ẩm thực địa phương' },
    { title: 'Bảo hiểm du lịch', desc: 'Toàn diện, hỗ trợ 24/7' },
    { title: 'AI gợi ý cá nhân hóa', desc: 'Tối ưu hóa lịch trình theo sở thích' },
    { title: 'Vận chuyển cao cấp', desc: 'Xe đời mới, thoải mái, an toàn' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative h-[560px] overflow-hidden bg-ink-900">
        <img
          src={mainImage}
          alt={tourName}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-ink-900/20"></div>

        <button
          onClick={() => navigate('/')}
          className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-5 py-3 text-sm font-semibold text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
        >
          <Icon name="arrowRight" className="h-4 w-4 rotate-180" />
          Quay lại
        </button>

        <div className="absolute right-6 top-6 flex flex-wrap justify-end gap-3">
          <span className="badge badge-light">{categoryName}</span>
          <span className="badge badge-brand">
            <Icon name="star" className="h-3.5 w-3.5" /> 4.8/5
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="container-x">
            <h1 className="font-display text-4xl font-semibold text-white drop-shadow-lg lg:text-6xl">
              {tourName}
            </h1>
            <div className="mt-4 flex flex-wrap gap-6 text-lg font-semibold text-white/90 drop-shadow-lg">
              <span className="inline-flex items-center gap-2">
                <Icon name="pin" className="h-5 w-5 text-brand-300" /> {destination}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="clock" className="h-5 w-5 text-brand-300" /> {duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="user" className="h-5 w-5 text-brand-300" /> {availableSeats} chỗ còn trống
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-x py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Gallery */}
            <div className="card overflow-hidden">
              <div className="p-6">
                <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900">Thư viện ảnh</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`aspect-square overflow-hidden rounded-2xl border-4 transition-all duration-300 ${
                        mainImage === img
                          ? 'scale-105 border-brand-500 shadow-lift'
                          : 'border-transparent hover:border-ink-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Tour ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
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
            <div className="card overflow-hidden">
              <div className="flex border-b border-ink-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 border-b-4 px-6 py-5 text-center text-sm font-semibold transition-all duration-300 ${
                      selectedTab === tab.id
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {selectedTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="mb-4 font-display text-3xl font-semibold text-ink-900">Mô tả tour</h3>
                      <p className="text-lg leading-relaxed text-ink-600">{description}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                        <p className="mb-2 text-sm font-semibold text-brand-900">Thời gian</p>
                        <p className="text-xl font-bold text-ink-900">{duration}</p>
                      </div>
                      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                        <p className="mb-2 text-sm font-semibold text-brand-900">Giá từ</p>
                        <p className="text-xl font-bold text-ink-900">{formatCurrency(price)}</p>
                      </div>
                      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
                        <p className="mb-2 text-sm font-semibold text-ink-600">Còn lại</p>
                        <p className="text-xl font-bold text-ink-900">{availableSeats} chỗ</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'itinerary' && (
                  <div className="space-y-8">
                    <h3 className="font-display text-3xl font-semibold text-ink-900">Lịch trình chi tiết</h3>
                    {[1, 2, 3].map((day) => (
                      <div key={day} className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 font-display text-2xl font-bold text-white shadow-lift">
                            {day}
                          </div>
                          {day < 3 && (
                            <div className="mt-3 h-16 w-1 rounded-full bg-gradient-to-b from-brand-500 to-transparent"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <h4 className="mb-3 font-display text-2xl font-semibold text-ink-900">
                            Ngày {day}:{' '}
                            {day === 1
                              ? 'Khởi hành & Nhận phòng'
                              : day === 2
                                ? 'Tham quan & Khám phá'
                                : 'Tự do & Trở về'}
                          </h4>
                          <p className="text-lg leading-relaxed text-ink-600">
                            {day === 1 &&
                              'Khởi hành sáng từ điểm tập trung, tới đích vào chiều tối. Nhận phòng, ăn tối và ở lại khách sạn.'}
                            {day === 2 &&
                              'Tham quan các điểm du lịch nổi tiếng. Ăn sáng, trưa và tối. Ở lại khách sạn.'}
                            {day === 3 &&
                              'Ăn sáng tại khách sạn. Có thời gian tự do khám phá. Trở về thành phố vào chiều tối.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTab === 'highlights' && (
                  <div className="space-y-4">
                    <h3 className="mb-6 font-display text-3xl font-semibold text-ink-900">Điểm nổi bật</h3>
                    {highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-5 rounded-2xl border border-brand-200 bg-brand-50 p-6 transition-all duration-300 hover:bg-brand-100"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                          <Icon name="check" className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-lg font-bold text-ink-900">{item.title}</p>
                          <p className="mt-1 text-ink-600">{item.desc}</p>
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
            <div className="card sticky top-24 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>

              <div className="p-6">
                <h3 className="mb-6 font-display text-2xl font-semibold text-ink-900">Đặt tour</h3>

                <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Người lớn</p>
                      <p className="font-display text-3xl font-bold text-brand-600">{formatCurrency(price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Trẻ em (≤11)</p>
                      <p className="font-display text-3xl font-bold text-brand-500">{formatCurrency(childPrice)}</p>
                    </div>
                  </div>
                  <p className="mt-4 border-t border-brand-200 pt-4 text-xs text-ink-500">
                    Trẻ em giảm 30% · Đã bao gồm tất cả chi phí
                  </p>
                </div>

                <div className="mb-6">
                  <p className="mb-4 block text-sm font-semibold uppercase tracking-wider text-ink-500">
                    Số lượng khách
                  </p>

                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-ink-900">Người lớn</p>
                        <p className="text-xs text-ink-500">{formatCurrency(price)} / người</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-2">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-white font-bold text-xl text-ink-700 shadow-sm transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-xl font-bold">{adults}</span>
                        <button
                          onClick={() => setAdults(Math.min(availableSeats - children, adults + 1))}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-white font-bold text-xl text-ink-700 shadow-sm transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-ink-900">
                          Trẻ em <span className="text-xs font-normal text-ink-500">(≤11 tuổi)</span>
                        </p>
                        <p className="text-xs font-semibold text-brand-600">{formatCurrency(childPrice)} / trẻ em</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-2">
                        <button
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-white font-bold text-xl text-ink-700 shadow-sm transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-xl font-bold">{children}</span>
                        <button
                          onClick={() => setChildren(Math.min(availableSeats - adults, children + 1))}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-white font-bold text-xl text-ink-700 shadow-sm transition hover:bg-brand-50 hover:text-brand-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 space-y-3 rounded-2xl border border-ink-200 bg-ink-50 p-5">
                  {adults > 0 && (
                    <div className="flex items-center justify-between text-base">
                      <span className="font-medium text-ink-700">Người lớn × {adults}</span>
                      <span className="font-bold text-ink-900">{formatCurrency(price * adults)}</span>
                    </div>
                  )}
                  {children > 0 && (
                    <div className="flex items-center justify-between text-base">
                      <span className="font-medium text-ink-700">Trẻ em × {children}</span>
                      <span className="font-bold text-brand-600">{formatCurrency(childPrice * children)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-ink-200 pt-3">
                    <span className="text-base font-bold text-ink-700">Tổng cộng ({totalGuests} khách)</span>
                    <span className="font-display text-3xl font-bold text-ink-900">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <button onClick={handleBooking} className="btn btn-primary mb-4 w-full text-base">
                  Đặt tour ngay
                  <Icon name="arrowRight" className="h-5 w-5" />
                </button>

                {availableSeats <= 5 && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-bold text-red-700">Chỉ còn {availableSeats} chỗ, đặt nhanh!</p>
                  </div>
                )}

                <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                  <p className="mb-2 text-sm font-bold text-brand-900">Chính sách hủy</p>
                  <p className="text-sm text-brand-800">Hủy miễn phí trước 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
