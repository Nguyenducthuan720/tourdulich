import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="inline-block w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <span className="text-7xl">🗺️</span>
          </div>
        </div>
        <h1 className="text-8xl font-bold text-amber-500 mb-4">404</h1>
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Trang không tìm thấy</h2>
        <p className="text-lg text-slate-600 mb-10">
          Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
          Hãy quay lại trang chủ để khám phá những tour du lịch tuyệt vời.
        </p>
        <Link
          to="/"
          className="inline-block bg-amber-500 text-white font-bold px-10 py-4 rounded-2xl hover:bg-amber-600 hover:shadow-xl transition-all duration-300"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  )
}
