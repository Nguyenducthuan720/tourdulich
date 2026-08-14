import { Link } from 'react-router-dom'
import { Icon } from '../components/icons'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="text-center">
        <span className="mx-auto mb-8 grid h-32 w-32 place-items-center rounded-full bg-brand-50 text-brand-500 ring-1 ring-brand-100">
          <Icon name="map" className="h-14 w-14" />
        </span>
        <h1 className="font-display text-8xl font-bold text-brand-500">404</h1>
        <h2 className="mt-4 font-display text-4xl font-semibold text-ink-900">
          Trang không tìm thấy
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-ink-500">
          Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Hãy quay lại trang chủ để khám phá những tour du lịch tuyệt vời.
        </p>
        <Link to="/" className="btn btn-primary btn-lg mt-10">
          <Icon name="arrowRight" className="h-5 w-5 rotate-180" />
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  )
}
