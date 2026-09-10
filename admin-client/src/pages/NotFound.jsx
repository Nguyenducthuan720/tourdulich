import { Link } from 'react-router-dom'
import { Icon } from '../components/icons'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="card p-12 text-center max-w-md">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          <Icon name="map" className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-2">404</h1>
        <p className="text-ink-500 mb-8">Trang bạn tìm kiếm không tồn tại.</p>
        <Link to="/" className="btn btn-primary">
          <Icon name="arrowRight" className="h-4 w-4" />
          Về bảng điều khiển
        </Link>
      </div>
    </div>
  )
}
