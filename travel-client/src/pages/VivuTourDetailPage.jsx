import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTourById } from '../api/tourService'
import { createReview, getTourReviews } from '../api/reviewService'
import { formatCurrency } from '../utils/formatters'
import { FALLBACK_TOUR_IMAGE, getImageUrl } from '../utils/imageUrl'
import { useAuth } from '../context/AuthContext'
import './VivuTourDetailPage.css'

const included = ['Lưu trú theo tiêu chuẩn của chương trình tour.', 'Phương tiện di chuyển theo lịch trình đã công bố.', 'Hướng dẫn viên đồng hành và hỗ trợ trong chuyến đi.', 'Các bữa ăn, vé tham quan được ghi trong mô tả tour.']
const excluded = ['Chi phí cá nhân và đồ uống ngoài chương trình.', 'Phụ thu phòng đơn hoặc nâng cấp dịch vụ nếu có.', 'Các dịch vụ tùy chọn không được ghi trong mô tả tour.']

export default function VivuTourDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [reviewTotal, setReviewTotal] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState(null)
  const [saved, setSaved] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    let active = true
    getTourById(id).then((data) => { if (active) setTour(data) }).catch((error) => {
      console.error('Fetch tour detail error:', error)
      if (active) setTour(null)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    let active = true
    getTourReviews(id).then((data) => {
      if (!active) return
      setReviews(data.items || [])
      setAvgRating(Number(data.avgRating) || 0)
      setReviewTotal(Number(data.total) || 0)
    }).catch((error) => console.error('Fetch reviews error:', error))
    return () => { active = false }
  }, [id])

  async function submitReview(event) {
    event.preventDefault()
    if (!isAuthenticated) {
      setReviewMessage({ type: 'error', text: 'Vui lòng đăng nhập để đánh giá tour.' })
      return
    }
    if (!rating) {
      setReviewMessage({ type: 'error', text: 'Vui lòng chọn số sao.' })
      return
    }
    try {
      setSubmitting(true)
      setReviewMessage(null)
      await createReview({ tourId: id, rating, comment })
      setRating(0)
      setComment('')
      setReviewMessage({ type: 'success', text: 'Cảm ơn bạn đã đánh giá tour!' })
      const data = await getTourReviews(id)
      setReviews(data.items || [])
      setAvgRating(Number(data.avgRating) || 0)
      setReviewTotal(Number(data.total) || 0)
    } catch (error) {
      setReviewMessage({ type: 'error', text: error.message || 'Không thể gửi đánh giá.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="vivu-tour-loading"><div className="container-x"><div className="skeleton h-12 w-2/3 rounded-lg" /><div className="skeleton mt-6 h-[390px] rounded-lg" /><div className="skeleton mt-8 h-64 rounded-lg" /></div></div>
  if (!tour) return <div className="vivu-tour-empty"><h1>Không tìm thấy tour</h1><p>Tour có thể đã bị gỡ hoặc đường dẫn không hợp lệ.</p><Link className="btn btn-primary" to="/">Khám phá các tour</Link></div>

  const name = tour.TourName || tour.title || 'Tour du lịch'
  const destination = tour.Destination || tour.location || 'Việt Nam'
  const duration = tour.Duration || tour.duration || 'Lịch trình linh hoạt'
  const price = Number(tour.Price ?? tour.price ?? 0)
  const seats = Number(tour.AvailableSeats ?? tour.seats ?? 0)
  const totalGuests = adults + children
  const childPrice = Math.round(price * 0.7)
  const total = price * adults + childPrice * children
  const gallery = [...new Set([tour.ImageURL || tour.image, ...(tour.images || [])].filter(Boolean).map((image) => getImageUrl(image)))]
  if (!gallery.length) gallery.push(getImageUrl(FALLBACK_TOUR_IMAGE))
  const mainImage = gallery[imageIndex] || gallery[0]
  const days = Math.max(1, Number.parseInt(String(duration).match(/\d+/)?.[0] || '3', 10))
  const rawSchedule = tour.schedules || tour.Schedules || []
  const itinerary = rawSchedule.length
    ? rawSchedule.map((item) => ({ day: item.DayNumber || item.day, text: item.Activity || item.activity }))
    : Array.from({ length: Math.min(days, 7) }, (_, index) => ({ day: index + 1, text: index === 0 ? `Khởi hành, nhận phòng và bắt đầu khám phá ${destination}.` : index === days - 1 ? 'Tự do mua sắm đặc sản, trả phòng và trở về điểm hẹn.' : `Tham quan các điểm nổi bật tại ${destination} cùng hướng dẫn viên.` }))

  async function shareTour() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMessage('Đã sao chép liên kết tour.')
    } catch {
      setShareMessage('Hãy sao chép đường dẫn tour trên thanh địa chỉ.')
    }
  }

  return (
    <main className="vivu-tour-page">
      <div className="vivu-tour-container">
        <nav className="vivu-tour-breadcrumb" aria-label="Đường dẫn"><Link to="/">Trang chủ</Link><span>/</span><Link to="/">Tour du lịch</Link><span>/</span><span>{destination}</span></nav>
        <header className="vivu-tour-heading">
          <div className="vivu-tour-tags"><span className="vivu-tour-tag vivu-tour-tag-hot">✦ Tour được yêu thích</span><span className="vivu-tour-tag">✓ Đặt chỗ an tâm</span><span className="vivu-tour-code">Mã tour {tour.TourID || tour.id}</span></div>
          <div className="vivu-tour-title-row"><h1>{name}</h1><div className="vivu-tour-title-actions"><button type="button" onClick={shareTour}>↗ <span>Chia sẻ</span></button><button className={saved ? 'is-saved' : ''} type="button" onClick={() => setSaved((value) => !value)} aria-pressed={saved}>{saved ? '♥' : '♡'} <span>{saved ? 'Đã lưu' : 'Lưu tour'}</span></button></div></div>
          {shareMessage && <p className="vivu-tour-share-message" role="status">{shareMessage}</p>}
          <div className="vivu-tour-meta"><a href="#tour-reviews" className="vivu-tour-rating"><span>★</span><strong>{(avgRating || 4.8).toFixed(1)}</strong><small>({reviewTotal} đánh giá)</small></a><span>◷ {duration}</span><span>⌖ {destination}</span><span>♧ Còn {seats} chỗ</span></div>
        </header>

        <section className="vivu-tour-gallery" id="tour-gallery" aria-label="Hình ảnh tour">
          <button type="button" className="vivu-tour-gallery-main" onClick={() => setImageIndex((imageIndex + 1) % gallery.length)} aria-label="Xem ảnh tiếp theo"><img src={mainImage} alt={`${name} - ảnh ${imageIndex + 1}`} onError={(event) => { event.currentTarget.src = getImageUrl(FALLBACK_TOUR_IMAGE) }} /><span className="vivu-gallery-caption">{destination} · {name}</span></button>
          <div className="vivu-tour-gallery-side">{gallery.slice(1, 5).map((image, index) => <button key={image} type="button" className={`vivu-tour-gallery-thumb ${imageIndex === index + 1 ? 'active' : ''}`} onClick={() => setImageIndex(index + 1)}><img src={image} alt={`${name} ${index + 2}`} onError={(event) => { event.currentTarget.src = getImageUrl(FALLBACK_TOUR_IMAGE) }} /></button>)}{gallery.length < 2 && <div className="vivu-tour-gallery-note"><span>VIVU TRAVEL</span><strong>Hành trình<br />đáng nhớ</strong></div>}{gallery.length > 1 && <button type="button" className="vivu-tour-gallery-all" onClick={() => setImageIndex((imageIndex + 1) % gallery.length)}>▦ Xem ảnh tiếp theo</button>}</div>
        </section>

        <div className="vivu-tour-layout">
          <div className="vivu-tour-content">
            <nav className="vivu-tour-section-nav" aria-label="Mục lục tour"><a href="#tour-overview">Tổng quan</a><a href="#tour-itinerary">Lịch trình</a><a href="#tour-services">Giá & dịch vụ</a><a href="#tour-policy">Chính sách</a><a href="#tour-reviews">Đánh giá ({reviewTotal})</a></nav>
            <section className="vivu-tour-section" id="tour-overview"><div className="vivu-tour-section-title"><span className="vivu-tour-section-icon">✦</span><div><span className="vivu-tour-eyebrow">ĐIỂM NHẤN</span><h2>Điểm nhấn nổi bật của chuyến đi</h2></div></div><p className="vivu-tour-description">{tour.Description || tour.description || `Cùng Vivu Travel khám phá ${destination} với lịch trình được sắp xếp cân bằng giữa trải nghiệm và thời gian nghỉ ngơi.`}</p><div className="vivu-tour-highlights">{[{ title: 'Lịch trình chọn lọc', text: `Khám phá những điểm đáng nhớ tại ${destination} trong ${duration}.` }, { title: 'Đồng hành chu đáo', text: 'Đội ngũ hỗ trợ theo sát thông tin tour và các nhu cầu trong chuyến đi.' }, { title: 'Dịch vụ minh bạch', text: 'Giá, thời lượng và dịch vụ được trình bày rõ trước khi đặt.' }, { title: 'Đặt chỗ an tâm', text: 'Xác nhận thông tin và thanh toán qua luồng bảo mật của Vivu Travel.' }].map((item) => <article key={item.title}><span>✓</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></section>
            <section className="vivu-tour-section" id="tour-itinerary"><div className="vivu-tour-section-title"><span className="vivu-tour-section-icon">↗</span><div><span className="vivu-tour-eyebrow">TỪNG CHẶNG ĐƯỜNG</span><h2>Lịch trình chi tiết</h2><p>{duration} · Có thể thay đổi theo điều kiện thực tế</p></div></div><div className="vivu-tour-itinerary">{itinerary.map((item, index) => <article key={`${item.day}-${index}`}><span className="vivu-tour-day">N{item.day}</span><div><h3>Ngày {item.day}</h3><p>{item.text}</p></div></article>)}</div></section>
            <section className="vivu-tour-section" id="tour-services"><div className="vivu-tour-section-title"><span className="vivu-tour-section-icon">▤</span><div><span className="vivu-tour-eyebrow">MINH BẠCH CHI PHÍ</span><h2>Giá tour & chi tiết dịch vụ</h2></div></div><div className="vivu-tour-service-grid"><div><h3><span>✓</span> Dịch vụ bao gồm</h3><ul>{included.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3 className="not-included"><span>−</span> Chưa bao gồm</h3><ul>{excluded.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
            <section className="vivu-tour-section" id="tour-policy"><div className="vivu-tour-section-title"><span className="vivu-tour-section-icon">◇</span><div><span className="vivu-tour-eyebrow">TRƯỚC KHI ĐẶT</span><h2>Chính sách hoàn hủy & lưu ý</h2></div></div><div className="vivu-tour-policy-copy"><p>Chính sách đổi, hủy và hoàn tiền được áp dụng theo điều kiện của tour và nhà cung cấp. Vui lòng kiểm tra điều khoản hiển thị trong bước xác nhận trước khi thanh toán.</p><p>Quý khách chuẩn bị giấy tờ tùy thân còn hiệu lực. Với hành trình có chuyến bay hoặc lưu trú, thông tin hành khách cần khớp với giấy tờ sử dụng khi làm thủ tục.</p></div></section>
            <section className="vivu-tour-section" id="tour-reviews"><div className="vivu-tour-review-heading"><div className="vivu-tour-section-title"><span className="vivu-tour-section-icon">★</span><div><span className="vivu-tour-eyebrow">CHIA SẺ TỪ DU KHÁCH</span><h2>Đánh giá thực tế</h2></div></div><div className="vivu-tour-rating-total"><strong>{(avgRating || 0).toFixed(1)}</strong><span>★ ★ ★ ★ ★</span><small>{reviewTotal} đánh giá</small></div></div>
              <form className="vivu-tour-review-form" onSubmit={submitReview}><div><strong>{isAuthenticated ? 'Chia sẻ trải nghiệm của bạn' : 'Bạn đã trải nghiệm tour này?'}</strong><small>Đánh giá giúp du khách khác chọn hành trình phù hợp.</small></div><div className="vivu-tour-star-picker" aria-label="Chọn số sao">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} sao`} aria-pressed={rating === star} className={star <= rating ? 'selected' : ''} onClick={() => setRating(star)}>★</button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows="3" placeholder="Viết cảm nhận của bạn..." /><div className="vivu-tour-review-submit">{reviewMessage && <p className={reviewMessage.type} role="status">{reviewMessage.text}</p>}{!isAuthenticated && <button className="vivu-tour-text-button" type="button" onClick={() => navigate('/login')}>Đăng nhập</button>}<button type="submit" disabled={submitting || !isAuthenticated}>{submitting ? 'Đang gửi…' : 'Gửi đánh giá'}</button></div></form>
              <div className="vivu-tour-review-list">{reviews.length ? reviews.map((review) => <article key={review.ReviewID}><div className="vivu-review-avatar">{(review.UserName || 'V').slice(0, 1).toUpperCase()}</div><div className="vivu-tour-review-body"><div className="vivu-tour-review-meta"><strong>{review.UserName || 'Du khách Vivu'}</strong><time>{review.CreatedAt ? new Date(review.CreatedAt).toLocaleDateString('vi-VN') : ''}</time><span>{'★'.repeat(Number(review.Rating) || 0)}<i>{'★'.repeat(5 - (Number(review.Rating) || 0))}</i></span></div><p>{review.Comment || 'Du khách chưa để lại nội dung.'}</p></div></article>) : <p className="vivu-tour-no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm.</p>}</div>
            </section>
          </div>
          <aside className="vivu-tour-booking"><div className="vivu-tour-price"><div><small>Giá từ</small><strong>{formatCurrency(price)}</strong><span>/ người lớn</span></div><span className="vivu-tour-price-badge">Giá tốt</span></div><div className="vivu-tour-date"><label>Ngày khởi hành</label><div><span>◷</span><strong>Lịch khởi hành linh hoạt</strong><small>Ngày cụ thể sẽ chọn ở bước đặt tour</small></div></div><div className="vivu-tour-passengers"><h3>Số lượng hành khách</h3><div><span><strong>Người lớn</strong><small>{formatCurrency(price)} / người</small></span><div className="vivu-tour-counter"><button type="button" aria-label="Giảm số người lớn" onClick={() => setAdults((count) => Math.max(1, count - 1))}>−</button><output>{adults}</output><button type="button" aria-label="Tăng số người lớn" onClick={() => setAdults((count) => Math.min(seats - children, count + 1))} disabled={adults + children >= seats}>+</button></div></div><div><span><strong>Trẻ em <small>(≤11 tuổi)</small></strong><small>{formatCurrency(childPrice)} / trẻ em</small></span><div className="vivu-tour-counter"><button type="button" aria-label="Giảm số trẻ em" onClick={() => setChildren((count) => Math.max(0, count - 1))}>−</button><output>{children}</output><button type="button" aria-label="Tăng số trẻ em" onClick={() => setChildren((count) => Math.min(seats - adults, count + 1))} disabled={adults + children >= seats}>+</button></div></div></div><div className="vivu-tour-total"><span>Tổng dự kiến · {totalGuests} khách</span><strong>{formatCurrency(total)}</strong><small>Thuế và phí được hiển thị trước khi xác nhận</small></div><button className="vivu-tour-book-button" type="button" onClick={() => navigate(`/booking/${tour.id || tour.TourID}?adults=${adults}&children=${children}`)}>Đặt tour ngay <span>→</span></button><a className="vivu-tour-consult" href="tel:19006868">☎ Tư vấn miễn phí · 1900 6868</a>{seats > 0 && seats <= 5 && <p className="vivu-tour-limited">Chỉ còn {seats} chỗ khả dụng.</p>}<div className="vivu-tour-trust"><span>✓ Xác nhận qua hệ thống</span><span>✓ Thanh toán an toàn</span></div></aside>
        </div>
      </div>
    </main>
  )
}