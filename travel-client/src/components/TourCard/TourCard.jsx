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
    <article className="group overflow-hidden rounded-xl bg-white shadow-md hover:shadow-2xl transition duration-300 border border-slate-100 hover:border-emerald-200 h-full flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-200">
        <img 
          src={imageUrl} 
          alt={tourName} 
          className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
          }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
        
        {/* Category Badge */}
        <div className="absolute left-3 top-3 inline-block rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-emerald-900 shadow-md">
           {categoryName}
        </div>

        {/* Rating Badge */}
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-bold shadow-md">
           4.8
        </div>

        {/* Seats Badge */}
        {availableSeats < 5 && (
          <div className="absolute bottom-3 left-3 inline-block rounded-full bg-red-500 text-white px-3 py-1 text-xs font-bold shadow-md">
             {availableSeats} chỗ
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Location and Duration */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-medium mb-2">
          <span className="flex items-center gap-1"> {destination}</span>
          <span className="flex items-center gap-1"> {duration}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-tight text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition">
          {tourName}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">
          {description}
        </p>

        {/* Divider */}
        <div className="border-t border-slate-100 my-3"></div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* Price */}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Từ</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(price)}</p>
          </div>

          {/* CTA Button */}
          <Link
            to={`/tours/${tourId}`}
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/50 transition duration-200 hover:scale-105 whitespace-nowrap"
          >
            Chi tiết →
          </Link>
        </div>
      </div>
    </article>
  )
}
