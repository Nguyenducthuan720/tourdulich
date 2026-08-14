import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatters'
import { FALLBACK_TOUR_IMAGE, getImageUrl } from '../../utils/imageUrl'
import { Icon } from '../icons'

export default function TourCard({ tour }) {
  const imageUrl = getImageUrl(tour.ImageURL || tour.image)
  const tourId = tour.TourID || tour.id
  const categoryName = tour.CategoryName || tour.category || 'Khám phá'
  const tourName = tourNamed(tour)
  const destination = tour.Destination || tour.location
  const price = tour.Price || tour.price
  const duration = tour.Duration || tour.duration
  const description = tour.Description || tour.description
  const availableSeats = tour.AvailableSeats || tour.seats

  return (
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <img
          src={imageUrl}
          alt={tourName}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = getImageUrl(FALLBACK_TOUR_IMAGE)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-transparent to-transparent opacity-90"></div>

        <span className="badge badge-light absolute left-4 top-4">
          {categoryName}
        </span>
        <span className="badge badge-brand absolute right-4 top-4">
          <Icon name="star" className="h-3.5 w-3.5" />
          4.8
        </span>

        {availableSeats != null && availableSeats < 5 && (
          <span className="badge badge-danger absolute bottom-4 left-4">
            Còn {availableSeats} chỗ
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-4 text-sm font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="pin" className="h-4 w-4 text-brand-500" />
            {destination}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="h-4 w-4 text-brand-500" />
            {duration}
          </span>
        </div>

        <h3 className="mb-2 font-display text-xl font-semibold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-600">
          <Link to={`/tours/${tourId}`} className="after:absolute after:inset-0">
            {tourName}
          </Link>
        </h3>

        <p className="mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-500">
          {description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-5">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-400">
              Giá từ
            </p>
            <p className="font-display text-2xl font-bold text-brand-600">
              {formatCurrency(price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover:bg-brand-500">
            Chi tiết
            <Icon name="arrowRight" className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  )
}

function tourNamed(tour) {
  return tour.TourName || tour.title || 'Tour du lịch'
}
