import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { getTourReviews, createReview } from '../api/reviewService'
import { formatCurrency } from '../utils/formatters'
import { FALLBACK_TOUR_IMAGE, getImageUrl } from '../utils/imageUrl'
import { Icon } from '../components/icons'
import { useAuth } from '../context/AuthContext'

export default function TourDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [mainImage, setMainImage] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [reviewTotal, setReviewTotal] = useState(0)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState(null)

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

  const fetchReviews = async () => {
    try {
      const data = await getTourReviews(id)
      setReviews(data.items || [])
      setAvgRating(data.avgRating || 0)
      setReviewTotal(data.total || 0)
    } catch (error) {
      console.error('Fetch reviews error:', error)
    }
  }

  useEffect(() => {
    fetchTourDetail()
  }, [id])

  useEffect(() => {
    if (id) fetchReviews()
  }, [id])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setReviewMsg({ type: 'error', text: 'Vui lòng đăng nhập để đánh giá tour' })
      return
    }
    if (!rating) {
      setReviewMsg({ type: 'error', text: 'Vui lòng chọn số sao' })
      return
    }
    try {
      setSubmitting(true)
      setReviewMsg(null)
      await createReview({ tourId: id, rating, comment })
      setRating(0)
      setComment('')
      setReviewMsg({ type: 'success', text: 'Cảm ơn bạn đã đánh giá tour!' })
      fetchReviews()
    } catch (error) {
      setReviewMsg({ type: 'error', text: error.message || 'Không thể gửi đánh giá' })
    } finally {
      setSubmitting(false)
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
    { id: 'reviews', label: `Đánh giá (${reviewTotal})` },
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
            <Icon name="star" className="h-3.5 w-3.5" /> {(avgRating || 4.8).toFixed(1)}/5
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

                {selectedTab === 'reviews' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-display text-3xl font-semibold text-ink-900">Đánh giá tour</h3>
                      <p className="mt-1 text-ink-500">
                        Điểm trung bình: <span className="font-bold text-brand-600">{avgRating.toFixed(1)}</span> / 5 ·{' '}
                        {reviewTotal} lượt đánh giá
                      </p>
                    </div>

                    {/* Form đánh giá */}
                    <form onSubmit={handleSubmitReview} className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                      <p className="mb-4 text-sm font-bold uppercase tracking-wider text-brand-900">
                        {isAuthenticated ? 'Chia sẻ trải nghiệm của bạn' : 'Bạn muốn đánh giá tour này?'}
                      </p>

                      <div className="mb-4">
                        <p className="mb-2 text-sm font-semibold text-ink-700">Chọn số sao</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                              aria-label={`${star} sao`}
                            >
                              <Icon
                                name="star"
                                className={`h-8 w-8 ${
                                  star <= (hoverRating || rating) ? 'text-brand-500' : 'text-ink-300'
                                }`}
                                fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="3"
                        placeholder="Viết nhận xét của bạn về tour..."
                        className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                      />

                      {reviewMsg && (
                        <p
                          className={`mt-3 text-sm font-semibold ${
                            reviewMsg.type === 'success' ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {reviewMsg.text}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-3">
                        {!isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm font-semibold text-brand-600 hover:underline"
                          >
                            Đăng nhập
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={submitting || !isAuthenticated}
                          className="btn btn-primary px-6 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                      </div>
                    </form>

                    {/* Danh sách đánh giá */}
                    {reviews.length === 0 ? (
                      <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center">
                        <p className="text-ink-500">
                          Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên đánh giá!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.ReviewID} className="rounded-2xl border border-ink-200 bg-white p-6">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 font-bold text-white">
                                  {(review.UserName || 'K').charAt(0).toUpperCase()}
                                </span>
                                <div>
                                  <p className="font-semibold text-ink-900">{review.UserName}</p>
                                  <p className="text-xs text-ink-400">
                                    {new Date(review.CreatedAt).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Icon
                                    key={star}
                                    name="star"
                                    className={`h-4 w-4 ${star <= review.Rating ? 'text-brand-500' : 'text-ink-200'}`}
                                    fill={star <= review.Rating ? 'currentColor' : 'none'}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.Comment ? (
                              <p className="text-sm leading-relaxed text-ink-600">{review.Comment}</p>
                            ) : (
                              <p className="text-sm italic text-ink-400">(Không có nhận xét)</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500">Người lớn</p>
                      <p className="font-display text-2xl font-bold leading-tight text-brand-600 tabular-nums break-words">{formatCurrency(price)}</p>
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500">Trẻ em (≤11)</p>
                      <p className="font-display text-2xl font-bold leading-tight text-brand-500 tabular-nums break-words">{formatCurrency(childPrice)}</p>
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
                    <div className="flex items-center justify-between gap-3 text-base">
                      <span className="font-medium text-ink-700">Người lớn × {adults}</span>
                      <span className="min-w-0 text-right font-bold text-ink-900 tabular-nums break-words">{formatCurrency(price * adults)}</span>
                    </div>
                  )}
                  {children > 0 && (
                    <div className="flex items-center justify-between gap-3 text-base">
                      <span className="font-medium text-ink-700">Trẻ em × {children}</span>
                      <span className="min-w-0 text-right font-bold text-brand-600 tabular-nums break-words">{formatCurrency(childPrice * children)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-t border-ink-200 pt-3">
                    <span className="text-base font-bold text-ink-700">Tổng cộng ({totalGuests} khách)</span>
                    <span className="min-w-0 text-right font-display text-2xl font-bold leading-tight text-ink-900 tabular-nums break-words">{formatCurrency(totalPrice)}</span>
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
