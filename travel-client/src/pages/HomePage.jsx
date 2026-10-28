import { useEffect, useState } from 'react'
import { getTours } from '../api/tourService'
import TourCard from '../components/TourCard/TourCard'
import SearchBox from '../components/SearchBox/SearchBox'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter'
import { getDestinations } from '../api/destinationService'
import { FALLBACK_DESTINATION_IMAGE, getImageUrl } from '../utils/imageUrl'
import { Link } from 'react-router-dom'

const stats = [
  { value: '18+', label: 'Tour cao cấp' },
  { value: '4.8', label: 'Đánh giá trung bình' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' },
  { value: '12k', label: 'Lượt khách hài lòng' },
]

export default function HomePage() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [destinations, setDestinations] = useState([])

  useEffect(() => {
    let active = true
    getTours({
      ...(selectedCategory && { categoryId: selectedCategory }),
      ...(searchKeyword && { keyword: searchKeyword }),
      ...(searchLocation && { location: searchLocation }),
    })
      .then((data) => {
        if (!active) return
        setTours(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Fetch tours error:', err)
        if (active) setError('Không thể tải danh sách tour. Vui lòng thử lại.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [selectedCategory, searchKeyword, searchLocation])

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch((err) => console.error('Fetch destinations error:', err))
  }, [])

  const handleSearch = ({ keyword = '', location = '' } = {}) => {
    setSearchKeyword(keyword)
    setSearchLocation(location)
    setTimeout(() => {
      document.getElementById('tours-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleDestinationClick = (dest) => {
    const searchTerm = dest.DestinationName === 'Hội An' ? 'Hội An' : dest.Province
    handleSearch({ location: searchTerm })
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  return (
    <div className="min-h-screen bg-cream">
      <section className="vivu-home-hero">
        <img className="vivu-home-hero-image" src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2200&q=90" alt="Du thuyền trên làn nước xanh ở Vịnh Hạ Long" />
        <div className="vivu-home-hero-shade"></div>
        <div className="vivu-home-hero-copy container-x">
          <p className="vivu-home-eyebrow"><IconDot /> Nền tảng du lịch tin cậy tại Việt Nam</p>
          <h1>Khám phá Việt Nam<br /><span>& thế giới trọn vẹn.</span></h1>
          <p className="vivu-home-intro">Tìm một hành trình đáng nhớ, từ tour được tuyển chọn đến những chuyến đi do chính bạn tạo nên.</p>
        </div>
        <div className="vivu-home-search container-x"><SearchBox onSearch={handleSearch} variant="floating" /></div>
      </section>

      <section className="vivu-services-band">
        <div className="container-x vivu-service-grid">
          <Link to="/flights"><span>✈</span><strong>Vé máy bay</strong><small>Tìm chuyến bay</small></Link>
          <Link to="/cars"><span>↗</span><strong>Thuê xe</strong><small>Đưa đón tận nơi</small></Link>
          <Link to="/hotels"><span>⌂</span><strong>Khách sạn</strong><small>Chọn nơi nghỉ</small></Link>
          <Link to="/planner"><span>✦</span><strong>Lịch trình AI</strong><small>Thiết kế chuyến đi</small></Link>
          <Link to="/community"><span>♡</span><strong>Cộng đồng</strong><small>Chia sẻ trải nghiệm</small></Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-ink-900/[0.06] bg-white">
        <div className="container-x grid grid-cols-2 gap-px py-8 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="px-4 text-center md:px-6">
              <div className="font-display text-3xl font-bold text-brand-600 lg:text-4xl">
                {item.value}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-500">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-14 lg:py-16">
        <div className="vivu-promo-strip">
          <div>
            <p className="eyebrow mb-3">ĐI THEO CÁCH CỦA BẠN</p>
            <h2 className="section-title">Một chuyến đi. Thật nhiều cách để bắt đầu.</h2>
            <p className="section-subtitle">Dùng trợ lý AI để lên lịch trình riêng, hoặc để chúng tôi chọn sẵn một tour hợp ý bạn.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link className="btn btn-primary" to="/planner">Lên lịch trình cùng AI</Link><Link className="btn btn-outline" to="/community">Đọc cảm nhận du khách</Link></div>
          </div>
          <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85" alt="Du khách khám phá một cung đường miền núi" loading="lazy" />
        </div>
      </section>

      {/* Popular Destinations */}
      {destinations.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-4">Điểm đến</p>
            <h2 className="section-title">Khám phá những nơi nổi bật</h2>
            <p className="section-subtitle">
              Từ vịnh biển ngọc đến phố cổ trăm tuổi — chọn điểm đến và để chúng
              tôi lập nên hành trình của bạn.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 8).map((dest, idx) => (
              <button
                key={dest.DestinationID}
                onClick={() => handleDestinationClick(dest)}
                className={`group relative overflow-hidden rounded-3xl shadow-soft ring-1 ring-ink-900/[0.04] transition duration-500 hover:-translate-y-1.5 hover:shadow-lift ${idx === 0 ? 'h-[420px] md:col-span-2 md:row-span-2' : 'h-[210px]'
                  }`}
              >
                <img
                  src={getImageUrl(dest.ImageURL, FALLBACK_DESTINATION_IMAGE)}
                  alt={dest.DestinationName}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = getImageUrl(FALLBACK_DESTINATION_IMAGE)
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/15 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3
                    className={`font-display font-semibold text-white drop-shadow ${idx === 0 ? 'text-3xl' : 'text-xl'
                      }`}
                  >
                    {dest.DestinationName}
                  </h3>
                  <p className="mt-1 text-sm text-ink-100">{dest.Province}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Tours */}
      <section id="tours-section" className="bg-cream-deep/60 py-20 lg:py-24">
        <div className="container-x">
          {error && (
            <div className="mb-8 rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-5 text-brand-800">
              <p className="font-semibold">⚠ {error}</p>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CategoryFilter
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton h-80 rounded-3xl"></div>
                  ))}
                </div>
              ) : tours.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-ink-200 bg-white py-32 text-center">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-ink-50 text-2xl">
                    🔍
                  </div>
                  <p className="font-display text-2xl font-semibold text-ink-900">
                    Không tìm thấy tour
                  </p>
                  <p className="mt-2 text-ink-500">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow mb-3">Bộ sưu tập</p>
                      <h2 className="section-title">Tour du lịch</h2>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white">
                      {tours.length} tour
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tours.map((tour, i) => (
                      <div
                        key={tour.id || tour.TourID}
                        className="animate-fade-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <TourCard tour={tour} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function IconDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-brand-300"></span>
}
