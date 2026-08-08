import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import { FALLBACK_TOUR_IMAGE, getImageUrl } from '../../utils/imageUrl'

export default function TourCard({ tour }) {
  const imageUrl = getImageUrl(tour.ImageURL || tour.image)
  const tourId = tour.TourID || tour.id
  const categoryName = tour.CategoryName || tour.category || 'Khám phá'
  const tourName = tour.TourName || tour.title
  const destination = tour.Destination || tour.location
  const price = tour.Price || tour.price
  const duration = tour.Duration || tour.duration
  const description = tour.Description || tour.description
  const availableSeats = tour.AvailableSeats || tour.seats

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <img 
          src={imageUrl} 
          alt={tourName} 
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
        
        {/* Category Badge */}
        <div className="absolute left-4 top-4 inline-block rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-lg">
          {categoryName}
        </div>

        {/* Rating Badge */}
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          ★ 4.8
        </div>

        {/* Seats Badge */}
        {availableSeats < 5 && (
          <div className="absolute bottom-4 left-4 inline-block rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            🔥 Còn {availableSeats} chỗ
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Location and Duration */}
        <div className="flex items-center justify-between gap-2 text-sm text-slate-600 font-medium mb-3">
          <span className="flex items-center gap-1.5">📍 {destination}</span>
          <span className="flex items-center gap-1.5">⏱ {duration}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold leading-tight text-slate-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition">
          {tourName}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        {/* Divider */}
        <div className="border-t border-slate-100 my-4"></div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* Price */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Từ</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(price)}</p>
          </div>

          {/* CTA Button */}
          <Link
            to={`/tours/${tourId}`}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-all duration-300 hover:shadow-xl whitespace-nowrap"
          >
            Chi tiết →
          </Link>
        </div>
      </div>
    </article>
  )
}
