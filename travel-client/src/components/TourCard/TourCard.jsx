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

        <span className="badge badge-light absolute left-3 top-3 text-[0.65rem]">
          {categoryName}
        </span>
        <span className="badge badge-brand absolute right-3 top-3 text-[0.65rem]">
          <Icon name="star" className="h-3 w-3" />
          4.8
        </span>

        {availableSeats != null && availableSeats < 5 && (
          <span className="badge badge-danger absolute bottom-3 left-3 text-[0.65rem]">
            Còn {availableSeats} chỗ
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-3 text-xs font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="pin" className="h-3.5 w-3.5 text-brand-500" />
            {destination}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="h-3.5 w-3.5 text-brand-500" />
            {duration}
          </span>
        </div>

        <h3 className="mb-1.5 font-display text-lg font-semibold leading-snug text-ink-900 transition-colors duration-300 group-hover:text-brand-600">
          <Link to={`/tours/${tourId}`} className="after:absolute after:inset-0">
            {tourName}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-ink-500">
          {description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-4">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
              Giá từ
            </p>
            <p className="amount font-display text-xl font-bold leading-tight text-brand-600">
              {formatCurrency(price)}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 group-hover:bg-brand-500">
            Chi tiết
            <Icon name="arrowRight" className="h-3.5 w-3.5 shrink-0" />
          </span>
        </div>
      </div>
    </article>
  )
}

function tourNamed(tour) {
  return tour.TourName || tour.title || 'Tour du lịch'
}
