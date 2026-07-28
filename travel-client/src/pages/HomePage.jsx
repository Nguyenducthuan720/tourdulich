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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-16 shadow-lg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-8">
            <h1 className="mb-2 text-5xl font-bold text-white drop-shadow-lg">Tour Lượng</h1>
            <p className="text-lg text-emerald-50">Khám phá những chuyến đi tuyệt - Hơn 18 tour tuyệt vời đang chờ bạn</p>
          </div>
          <SearchBox onSearch={handleSearch} />
        </div>
      </div>

      {/* Popular Destinations */}
      {destinations.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">🎯 Điểm đến nổi bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.slice(0, 8).map(dest => (
              <div 
                key={dest.DestinationID} 
                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-square shadow-sm hover:shadow-xl transition"
                onClick={() => handleDestinationClick(dest)}
              >
                <img 
                  src={getImageUrl(dest.ImageURL, FALLBACK_DESTINATION_IMAGE)} 
                  alt={dest.DestinationName} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                  onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(FALLBACK_DESTINATION_IMAGE); }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg drop-shadow-md">{dest.DestinationName}</h3>
                  <p className="text-white/80 text-sm line-clamp-1 drop-shadow-md">{dest.Province}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div id="tours-section" className="mx-auto max-w-7xl px-4 py-12">
        {error && (
          <div className="mb-6 rounded-lg bg-amber-50 border-l-4 border-amber-400 p-4 text-amber-800">
            <p className="text-sm font-medium">lỗi {error}</p>
          </div>
        )}

        {/* Layout: Filter + Tours */}
        <div className="grid gap-6 lg:grid-cols-4 xl:grid-cols-5">
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
          <div className="lg:col-span-3 xl:col-span-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                  <p className="text-slate-600 font-medium">Đang tải tours...</p>
                </div>
              </div>
            ) : tours.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-lg font-semibold text-slate-600">Không tìm thấy tour nào</p>
                <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-900">
                     Tours Du Lịch
                  </h2>
                  <span className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
                    {tours.length} tour
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tours.map((tour) => (
                    <TourCard key={tour.id || tour.TourID} tour={tour} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
