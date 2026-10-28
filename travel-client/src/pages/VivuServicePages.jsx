import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createReview, getTourReviews } from '../api/reviewService'
import { getFlights } from '../api/bookingService'
import { getTours } from '../api/tourService'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/formatters'
import './VivuServicePages.css'

const interestsList = ['Ẩm thực', 'Thiên nhiên', 'Văn hóa', 'Nghỉ dưỡng', 'Phiêu lưu']

const stays = [
  { id: 'phu-quoc', name: 'Vinpearl Resort & Spa Phú Quốc', city: 'Phú Quốc', rating: '9.2', count: '1.240', price: 2850000, tag: 'Nghỉ dưỡng bên biển', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85', amenities: ['Bãi biển riêng', 'Hồ bơi', 'Bữa sáng'] },
  { id: 'hoi-an', name: 'Anantara Hoi An Resort', city: 'Hội An', rating: '9.4', count: '862', price: 3400000, tag: 'Gần phố cổ', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85', amenities: ['Ven sông', 'Spa', 'Nhà hàng'] },
  { id: 'danang', name: 'InterContinental Danang', city: 'Đà Nẵng', rating: '9.6', count: '1.038', price: 6200000, tag: 'Kỳ nghỉ cao cấp', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85', amenities: ['Bãi biển riêng', 'Spa', 'Ẩm thực'] },
]

const cars = [
  { id: 'sedan', name: 'Sedan tiêu chuẩn', seats: 4, airport: 650000, day: 1500000, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1100&q=85', note: 'Phù hợp cho chuyến đi cá nhân hoặc cặp đôi.' },
  { id: 'suv', name: 'SUV gia đình', seats: 7, airport: 980000, day: 2200000, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1100&q=85', note: 'Rộng rãi cho gia đình và hành lý.' },
  { id: 'limo', name: 'Limousine cao cấp', seats: 9, airport: 1850000, day: 3800000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=85', note: 'Không gian riêng tư, tiện nghi đường dài.' },
]

function PageIntro({ label, title, description }) {
  return <div className="vivu-page-intro"><span>{label}</span><h1>{title}</h1><p>{description}</p></div>
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
}

export function PlannerPage() {
  const { user } = useAuth()
  const [destination, setDestination] = useState('Đà Nẵng và Hội An')
  const [duration, setDuration] = useState(4)
  const [budget, setBudget] = useState(12000000)
  const [interests, setInterests] = useState(['Ẩm thực', 'Thiên nhiên'])
  const [pace, setPace] = useState('Vừa phải')
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleInterest = (value) => setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])

  async function handlePlan(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setReply('')
    try {
      const response = await apiClient.post('/ai/chat', {
        session_id: `planner-${user?.id || 'guest'}-${Date.now()}`,
        user_id: user?.id || null,
        message: `Thiết kế lịch trình ${duration} ngày tại ${destination}. Ngân sách dự kiến ${formatCurrency(budget)} cho mỗi người. Sở thích: ${interests.join(', ') || 'khám phá điểm đến'}. Nhịp độ chuyến đi: ${pace}. Vui lòng chia theo từng ngày, gợi ý hoạt động và chỉ giới thiệu tour/giá có trong dữ liệu Vivu.`,
      })
      setReply(response.data?.reply || 'Hiện chưa tạo được lịch trình, vui lòng thử lại sau.')
    } catch (requestError) {
      setError(requestError.message || 'Không thể kết nối trợ lý du lịch lúc này.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vivu-service-page">
      <section className="vivu-planner-hero">
        <div className="vivu-planner-backdrop" />
        <div className="vivu-planner-content">
          <div className="vivu-planner-copy"><span className="vivu-overline">VIVU AI TRAVEL PLANNER</span><h1>Lịch trình hay<br />bắt đầu từ bạn.</h1><p>Nói cho Vivu biết bạn muốn đi đâu. Chúng tôi sẽ giúp bạn biến cảm hứng thành một hành trình vừa vặn.</p><div className="vivu-planner-promise"><span>✦</span> Gợi ý theo sở thích <span>·</span> Dựa trên dữ liệu tour Vivu</div></div>
          <form className="vivu-panel vivu-planner-form" onSubmit={handlePlan}>
            <div className="vivu-panel-heading"><div><span className="vivu-overline">CHUYẾN ĐI CỦA BẠN</span><h2>Bắt đầu lên kế hoạch</h2></div><span className="vivu-ai-mark">✦</span></div>
            <label>Điểm đến<input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Thành phố, vùng miền..." /></label>
            <div className="vivu-dual-fields"><label>Số ngày<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{[2, 3, 4, 5, 6, 7].map((days) => <option key={days} value={days}>{days} ngày</option>)}</select></label><label>Nhịp độ<select value={pace} onChange={(event) => setPace(event.target.value)}><option>Thư thả</option><option>Vừa phải</option><option>Năng động</option></select></label></div>
            <label className="vivu-range-label">Ngân sách mỗi người <strong>{formatCurrency(budget)}</strong><input type="range" min="3000000" max="30000000" step="1000000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></label>
            <fieldset className="vivu-interest-set"><legend>Bạn thích trải nghiệm nào?</legend><div>{interestsList.map((interest) => <label key={interest} className={`vivu-interest-chip ${interests.includes(interest) ? 'selected' : ''}`}><input type="checkbox" checked={interests.includes(interest)} onChange={() => toggleInterest(interest)} />{interest}</label>)}</div></fieldset>
            {error && <p className="vivu-service-error" role="alert">{error}</p>}
            <button className="vivu-action-button" disabled={loading} type="submit">{loading ? 'Đang lên lịch trình…' : '✦  Tạo lịch trình cùng AI'}</button>
            <p className="vivu-form-note">Vivu AI gợi ý tour dựa trên dữ liệu hiện có trên hệ thống.</p>
          </form>
        </div>
      </section>
      {reply ? <section className="vivu-itinerary-result"><div className="vivu-result-title"><span className="vivu-overline">GỢI Ý DÀNH RIÊNG CHO BẠN</span><h2>{destination} · {duration} ngày</h2><p>Ngân sách dự kiến {formatCurrency(budget)} / người · Nhịp độ {pace.toLowerCase()}</p></div><div className="vivu-ai-reply">{reply}</div><Link className="vivu-inline-link" to="/">Xem tour phù hợp <span>→</span></Link></section> : <section className="vivu-planner-inspiration"><img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85" alt="Du khách ngắm cảnh núi non Việt Nam" /><div><span className="vivu-overline">MỘT GỢI Ý ĐỂ BẮT ĐẦU</span><h2>Đà Nẵng & Hội An, 4 ngày</h2><p>Buổi sáng bên biển, chiều khám phá những con phố cũ, tối thưởng thức món ngon địa phương. Một hành trình có đủ khoảng trống để tận hưởng.</p><Link className="vivu-inline-link" to="/">Khám phá tour miền Trung <span>→</span></Link></div></section>}
    </div>
  )
}

export function CommunityPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [tours, setTours] = useState([])
  const [reviews, setReviews] = useState([])
  const [tourId, setTourId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [filter, setFilter] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const tourItems = await getTours()
        const availableTours = Array.isArray(tourItems) ? tourItems.slice(0, 8) : []
        if (!active) return
        setTours(availableTours)
        if (availableTours.length) {
          setTourId((current) => current || String(availableTours[0].TourID || availableTours[0].id))
        }
        const batches = await Promise.all(availableTours.map(async (tour) => {
          const id = tour.TourID || tour.id
          try {
            const result = await getTourReviews(id)
            return (result.items || []).map((review) => ({ ...review, tourId: id, tourName: tour.TourName || tour.title, destination: tour.Destination || tour.location }))
          } catch {
            return []
          }
        }))
        if (active) setReviews(batches.flat().sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)))
      } catch (loadError) {
        if (active) setError(loadError.message || 'Không thể tải đánh giá lúc này.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [reloadCount])

  async function handleReview(event) {
    event.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setSending(true)
    setError('')
    setMessage('')
    try {
      await createReview({ tourId: Number(tourId), rating, comment })
      setMessage('Cảm ơn bạn đã chia sẻ trải nghiệm.')
      setComment('')
      setReloadCount((count) => count + 1)
    } catch (submitError) {
      setError(submitError.message || 'Không thể gửi đánh giá.')
    } finally {
      setSending(false)
    }
  }

  const shownReviews = reviews.filter((review) => filter === 'Tất cả' || Number(review.Rating) >= 4)

  return (
    <div className="vivu-service-page vivu-community-page">
      <PageIntro label="CỘNG ĐỒNG DU LỊCH VIVU" title={<>Đi thật. Kể thật.<br /><em>Truyền cảm hứng.</em></>} description="Những chia sẻ chân thực từ người đã đi, ở và khám phá. Chọn một câu chuyện để tìm cảm hứng cho hành trình của riêng bạn." />
      <div className="vivu-community-layout"><section className="vivu-community-feed"><div className="vivu-feed-toolbar"><div className="vivu-feed-tabs">{['Tất cả', 'Đánh giá tốt'].map((item) => <button key={item} className={filter === item ? 'active' : ''} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div><span>{loading ? 'Đang tải…' : `${shownReviews.length} đánh giá`}</span></div>
        {error && <p className="vivu-service-error" role="alert">{error}</p>}
        {loading ? <div className="vivu-community-empty">Đang tải những chia sẻ mới nhất…</div> : shownReviews.length === 0 ? <div className="vivu-community-empty">Chưa có đánh giá cho các tour hiện tại. Hãy là người đầu tiên chia sẻ.</div> : shownReviews.map((review) => <article className="vivu-review-item" key={review.ReviewID}><div className="vivu-review-meta"><span className="vivu-review-avatar">{(review.UserName || 'V').slice(0, 1).toUpperCase()}</span><div><strong>{review.UserName || 'Du khách Vivu'}</strong><small>{new Date(review.CreatedAt).toLocaleDateString('vi-VN')} · {review.destination || 'Việt Nam'}</small></div><span className="vivu-review-stars" aria-label={`${review.Rating} trên 5 sao`}>{'★'.repeat(Number(review.Rating) || 0)}<span>{'★'.repeat(5 - (Number(review.Rating) || 0))}</span></span></div><h2>{review.tourName}</h2><p>{review.Comment || 'Du khách chưa để lại nội dung.'}</p><Link className="vivu-inline-link" to={`/tours/${review.tourId}`}>Xem tour <span>→</span></Link></article>)}
      </section><aside className="vivu-review-form-panel"><span className="vivu-overline">CHIA SẺ TRẢI NGHIỆM</span><h2>Chuyến đi gần nhất thế nào?</h2><p>Đánh giá của bạn giúp những người đi sau chọn được hành trình phù hợp.</p><form onSubmit={handleReview}><label>Tour bạn đã trải nghiệm<select required value={tourId} onChange={(event) => setTourId(event.target.value)}>{tours.map((tour) => <option key={tour.TourID || tour.id} value={tour.TourID || tour.id}>{tour.TourName || tour.title}</option>)}</select></label><label>Đánh giá của bạn<select value={rating} onChange={(event) => setRating(Number(event.target.value))}><option value="5">★★★★★  Rất tuyệt vời</option><option value="4">★★★★☆  Rất tốt</option><option value="3">★★★☆☆  Bình thường</option><option value="2">★★☆☆☆  Chưa tốt</option><option value="1">★☆☆☆☆  Không hài lòng</option></select></label><label>Cảm nhận<textarea rows="5" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Điều gì làm bạn nhớ nhất?" /></label>{error && <p className="vivu-service-error" role="alert">{error}</p>}{message && <p className="vivu-service-success" role="status">{message}</p>}<button className="vivu-action-button" type="submit" disabled={sending || !tours.length}>{sending ? 'Đang gửi…' : isAuthenticated ? 'Gửi đánh giá' : 'Đăng nhập để đánh giá'}</button></form></aside></div>
    </div>
  )
}

export function HotelsPage() {
  const [city, setCity] = useState('Tất cả điểm đến')
  const [query, setQuery] = useState('')
  const [roomType, setRoomType] = useState('Mọi loại phòng')
  const [selectedStay, setSelectedStay] = useState('')
  const [notice, setNotice] = useState('')
  const results = stays.filter((stay) => (city === 'Tất cả điểm đến' || stay.city === city) && `${stay.name} ${stay.city}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))

  return (
    <div className="vivu-service-page vivu-hotel-page"><PageIntro label="KHÁCH SẠN & RESORT" title={<>Nơi nghỉ ngơi<br /><em>cũng là một phần chuyến đi.</em></>} description="Những khách sạn và resort được chọn lọc cho kỳ nghỉ thật trọn vẹn." />
      <form className="vivu-search-panel" onSubmit={(event) => { event.preventDefault(); setNotice('Đã cập nhật danh sách chỗ nghỉ theo tiêu chí tìm kiếm.') }}><label>Điểm đến<select value={city} onChange={(event) => setCity(event.target.value)}><option>Tất cả điểm đến</option><option>Phú Quốc</option><option>Hội An</option><option>Đà Nẵng</option></select></label><label>Khách sạn hoặc địa danh<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: resort biển..." /></label><label>Nhận phòng<input type="date" /></label><label>Trả phòng<input type="date" /></label><label>Số khách<select><option>2 người lớn</option><option>1 người lớn</option><option>2 người lớn, 1 trẻ em</option><option>4 người lớn</option></select></label><button className="vivu-action-button" type="submit"><SearchIcon /> Tìm chỗ nghỉ</button></form>
      {notice && <p className="vivu-inline-notice" role="status">{notice}</p>}
      <div className="vivu-results-heading"><div><span className="vivu-overline">ĐIỂM ĐẾN ĐƯỢC YÊU THÍCH</span><h2>Chỗ nghỉ nổi bật</h2></div><label>Loại chỗ nghỉ<select value={roomType} onChange={(event) => setRoomType(event.target.value)}><option>Mọi loại phòng</option><option>Resort</option><option>Khách sạn</option></select></label></div>
      <div className="vivu-stay-grid">{results.map((stay) => <article className={`vivu-stay-card ${selectedStay === stay.id ? 'chosen' : ''}`} key={stay.id}><div className="vivu-stay-photo"><img src={stay.image} alt={stay.name} /><span>{stay.tag}</span><button type="button" aria-label={`Lưu ${stay.name}`} onClick={() => setNotice(`${stay.name} đã được lưu trong danh sách yêu thích của bạn.`)}>♡</button></div><div className="vivu-stay-info"><small>{stay.city} · {roomType === 'Mọi loại phòng' ? 'Khách sạn & resort' : roomType}</small><h3>{stay.name}</h3><p>{stay.amenities.join(' · ')}</p><div className="vivu-stay-price"><span><b>{stay.rating}</b> / 10 <small>({stay.count} đánh giá)</small></span><strong>{formatCurrency(stay.price)} <small>/ đêm</small></strong></div><button className="vivu-secondary-button" type="button" onClick={() => { setSelectedStay(stay.id); setNotice('Tính năng đặt phòng khách sạn sẽ khả dụng khi dịch vụ đặt phòng được kết nối.') }}>{selectedStay === stay.id ? 'Đã chọn chỗ nghỉ' : 'Xem phòng'}</button></div></article>)}</div>
      {results.length === 0 && <div className="vivu-community-empty">Không tìm thấy chỗ nghỉ phù hợp. Thử thay đổi điểm đến hoặc từ khóa.</div>}
    </div>
  )
}

export function CarsPage() {
  const [service, setService] = useState('Đưa đón sân bay')
  const [city, setCity] = useState('Đà Nẵng')
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedCar, setSelectedCar] = useState('')
  return <div className="vivu-service-page vivu-car-page"><PageIntro label="THUÊ XE & ĐƯA ĐÓN" title={<>Mỗi chặng đường<br /><em>đều thật thảnh thơi.</em></>} description="Chọn xe phù hợp, chủ động lịch trình và thoải mái tận hưởng điểm đến." />
    <section className="vivu-car-search"><div className="vivu-service-tabs" role="tablist" aria-label="Loại dịch vụ xe">{['Đưa đón sân bay', 'Thuê theo ngày'].map((tab) => <button key={tab} type="button" role="tab" aria-selected={service === tab} className={service === tab ? 'active' : ''} onClick={() => setService(tab)}>{tab}</button>)}</div><form className="vivu-search-panel" onSubmit={(event) => { event.preventDefault(); setNotice(`Đang hiển thị xe ${service.toLocaleLowerCase('vi')} tại ${city}.`) }}><label>Thành phố<select value={city} onChange={(event) => setCity(event.target.value)}><option>Đà Nẵng</option><option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Phú Quốc</option></select></label><label>Điểm đón<input value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Sân bay, khách sạn..." /></label><label>Điểm đến<input value={dropoff} onChange={(event) => setDropoff(event.target.value)} placeholder="Bạn muốn đến đâu?" /></label><label>Ngày và giờ<input type="datetime-local" /></label><button className="vivu-action-button" type="submit"><SearchIcon /> Tìm xe</button></form></section>
    {notice && <p className="vivu-inline-notice" role="status">{notice}</p>}<div className="vivu-results-heading"><div><span className="vivu-overline">XE ĐƯỢC ƯA CHUỘNG</span><h2>Chọn chiếc xe phù hợp</h2></div><span className="vivu-results-subtitle">Giá tham khảo · {city}</span></div>
    <div className="vivu-car-grid">{cars.map((car) => <article className={`vivu-car-card ${selectedCar === car.id ? 'chosen' : ''}`} key={car.id}><img src={car.image} alt={car.name} /><div className="vivu-car-info"><span className="vivu-overline">{service}</span><h3>{car.name}</h3><p>{car.seats} chỗ · Điều hòa · Tài xế riêng</p><p className="vivu-car-note">{car.note}</p><div className="vivu-stay-price"><strong>{formatCurrency(service === 'Đưa đón sân bay' ? car.airport : car.day)} <small>/{service === 'Đưa đón sân bay' ? 'chuyến' : 'ngày'}</small></strong><button className="vivu-secondary-button" type="button" onClick={() => { setSelectedCar(car.id); setNotice('Tính năng đặt xe sẽ khả dụng khi dịch vụ xe được kết nối.') }}>{selectedCar === car.id ? 'Đã chọn xe' : 'Chọn xe'}</button></div></div></article>)}</div>
    <div className="vivu-car-assurances"><span>✓  Đối tác tài xế được xác minh</span><span>✓  Giá hiển thị trước chuyến đi</span><span>✓  Hỗ trợ khách hàng 24/7</span></div>
  </div>
}

export function FlightsPage() {
  const navigate = useNavigate()
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('price')
  const [tripType, setTripType] = useState('Khứ hồi')
  useEffect(() => { getFlights().then((data) => setFlights(Array.isArray(data) ? data : data?.items || [])).catch((requestError) => setError(requestError.message || 'Không thể tải chuyến bay.')).finally(() => setLoading(false)) }, [])
  const departures = [...new Set(flights.map((flight) => flight.DepartureCity).filter(Boolean))]
  const arrivals = [...new Set(flights.map((flight) => flight.ArrivalCity).filter(Boolean))]
  const filtered = flights.filter((flight) => (!from || flight.DepartureCity === from) && (!to || flight.ArrivalCity === to)).sort((first, second) => sort === 'price' ? Number(first.Price) - Number(second.Price) : new Date(first.DepartureTime) - new Date(second.DepartureTime))
  return <div className="vivu-service-page vivu-flight-search-page"><section className="vivu-flight-search-hero"><img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=85" alt="Máy bay cất cánh giữa bầu trời trong" /><div><span className="vivu-overline">VÉ MÁY BAY · VIVU TRAVEL</span><h1>Đi xa hơn,<br /><em>theo cách của bạn.</em></h1><p>Tìm chuyến bay phù hợp, bắt đầu hành trình thật nhẹ nhàng.</p></div></section>
    <form className="vivu-flight-search-form" onSubmit={(event) => event.preventDefault()}><div className="vivu-flight-trip-type">{['Khứ hồi', 'Một chiều'].map((type) => <label key={type}><input type="radio" name="trip-type" checked={tripType === type} onChange={() => setTripType(type)} />{type}</label>)}</div><div className="vivu-flight-fields"><label>Điểm khởi hành<select value={from} onChange={(event) => setFrom(event.target.value)}><option value="">Tất cả điểm đi</option>{departures.map((city) => <option key={city}>{city}</option>)}</select></label><span className="vivu-flight-swap" aria-hidden="true">⇄</span><label>Điểm đến<select value={to} onChange={(event) => setTo(event.target.value)}><option value="">Tất cả điểm đến</option>{arrivals.map((city) => <option key={city}>{city}</option>)}</select></label><label>Ngày đi<input type="date" /></label><label>Hành khách<select><option>1 hành khách</option><option>2 hành khách</option><option>3 hành khách</option><option>4 hành khách</option></select></label><button className="vivu-action-button" type="submit"><SearchIcon /> Tìm chuyến bay</button></div></form>
    <div className="vivu-results-heading"><div><span className="vivu-overline">CHUYẾN BAY ĐANG MỞ BÁN</span><h2>{filtered.length} chuyến bay khả dụng</h2></div><label>Sắp xếp<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="price">Giá thấp nhất</option><option value="time">Giờ khởi hành</option></select></label></div>
    {error && <p className="vivu-service-error" role="alert">{error}</p>}{loading ? <div className="vivu-community-empty">Đang tìm chuyến bay…</div> : filtered.length === 0 ? <div className="vivu-community-empty">Chưa có chuyến bay phù hợp với lựa chọn này.</div> : <div className="vivu-flight-results">{filtered.map((flight) => <article className="vivu-flight-result" key={flight.FlightID}><div className="vivu-airline-icon">✈</div><div className="vivu-airline-name"><strong>{flight.AirlineName}</strong><small>{flight.FlightNumber}</small></div><div className="vivu-flight-time"><strong>{new Date(flight.DepartureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong><small>{flight.DepartureCity}</small></div><div className="vivu-flight-track"><small>Bay thẳng</small><span /></div><div className="vivu-flight-time"><strong>{new Date(flight.ArrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong><small>{flight.ArrivalCity}</small></div><div className="vivu-flight-fare"><strong>{formatCurrency(flight.Price)}</strong><button type="button" onClick={() => navigate('/flight-booking')}>Chọn vé</button></div></article>)}</div>}
    <p className="vivu-flight-note">Giá cuối cùng và lựa chọn chỗ ngồi sẽ được xác nhận trong bước đặt vé.</p>
  </div>
}