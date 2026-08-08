import { useEffect, useState } from 'react'
import { getTours } from '../api/tourService'
import TourCard from '../components/TourCard/TourCard'
import SearchBox from '../components/SearchBox/SearchBox'
import CategoryFilter from '../components/CategoryFilter/CategoryFilter'
import { getDestinations } from '../api/destinationService'
import { FALLBACK_DESTINATION_IMAGE, getImageUrl } from '../utils/imageUrl'

export default function HomePage() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [destinations, setDestinations] = useState([])

  useEffect(() => {
    fetchTours()
    fetchDestinations()
  }, [selectedCategory])

  const fetchDestinations = async () => {
    try {
      const data = await getDestinations()
      setDestinations(data)
    } catch (err) {
      console.error('Fetch destinations error:', err)
    }
  }

  const fetchTours = async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const queryParams = {
        ...params,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(searchKeyword && { keyword: searchKeyword }),
        ...(searchLocation && { location: searchLocation }),
      }
      const data = await getTours(queryParams)
      setTours(data)
    } catch (err) {
      console.error('Fetch tours error:', err)
      setError(err.message)
      // Do not use fallback tours anymore
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword, location) => {
    setSearchKeyword(keyword)
    setSearchLocation(location)
    fetchTours({ keyword, location })
  }

  const handleDestinationClick = (dest) => {
    // Sử dụng Tỉnh/Thành phố để tìm kiếm sẽ chính xác hơn vì Database lưu Destination theo Tỉnh
    // Riêng Hội An thì tìm theo tên vì Tour lưu Destination là Đà Nẵng
    const searchTerm = dest.DestinationName === 'Hội An' ? 'Hội An' : dest.Province
    handleSearch('', searchTerm)
    setTimeout(() => {
      document.getElementById('tours-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80" 
            alt="Hero" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 backdrop-blur-sm">
              ✦ Premium Travel Experience
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white lg:text-7xl">
              Khám phá thế giới
              <span className="block text-amber-400">theo cách của bạn</span>
            </h1>
            <p className="mb-10 text-xl text-slate-300">
              Trải nghiệm hơn 18 tour du lịch cao cấp trong và ngoài nước. Dịch vụ đẳng cấp, giá trị đích thực.
            </p>
          </div>
          
          <div className="max-w-4xl">
            <SearchBox onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      {destinations.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-12">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-amber-600">Điểm đến</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Khám phá điểm đến nổi bật
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 8).map((dest, idx) => (
              <div 
                key={dest.DestinationID} 
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition-all hover:shadow-xl ${
                  idx === 0 ? 'md:col-span-2 md:row-span-2' : ''
                } ${idx === 0 ? 'h-[400px]' : 'h-[200px]'}`}
                onClick={() => handleDestinationClick(dest)}
              >
                <img 
                  src={getImageUrl(dest.ImageURL, FALLBACK_DESTINATION_IMAGE)} 
                  alt={dest.DestinationName} 
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110" 
                  onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(FALLBACK_DESTINATION_IMAGE); }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className={`font-bold text-white drop-shadow-lg ${idx === 0 ? 'text-3xl' : 'text-xl'}`}>
                    {dest.DestinationName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-200">{dest.Province}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section id="tours-section" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {error && (
          <div className="mb-8 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 text-amber-900">
            <p className="font-semibold">⚠ {error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CategoryFilter 
                onCategorySelect={handleCategorySelect} 
                selectedCategory={selectedCategory}
              />
            </div>
          </div>

          {/* Tours Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
                  <p className="text-lg font-semibold text-slate-600">Đang tải tours...</p>
                </div>
              </div>
            ) : tours.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-32 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <p className="text-2xl font-bold text-slate-900">Không tìm thấy tour</p>
                <p className="mt-2 text-slate-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-amber-600">Bộ sưu tập</p>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                      Tours du lịch
                    </h2>
                  </div>
                  <span className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white">
                    {tours.length} tour
                  </span>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {tours.map((tour) => (
                    <TourCard key={tour.id || tour.TourID} tour={tour} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
