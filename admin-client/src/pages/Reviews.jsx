import { useEffect, useState } from 'react'
import { getReviews, deleteReview } from '../api/adminService'
import { Icon } from '../components/icons'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await getReviews(page, 10)
      setReviews(data.data)
      setTotal(data.total)
      setPages(data.pages)
    } catch (error) {
      console.error('Fetch reviews error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [page])

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa review này?')) return
    try {
      await deleteReview(id)
      fetchReviews()
    } catch (error) {
      alert('Lỗi xóa review')
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="text-brand-500">{i < rating ? '★' : '☆'}</span>
    ))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Đánh giá</h1>
        <p className="mt-1 text-sm text-ink-500">Xem và quản lý đánh giá từ khách hàng</p>
      </div>

      <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl">
        <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
          Tổng cộng: {total} đánh giá
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-ink-600 font-medium uppercase text-sm tracking-widest">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white border border-ink-300">
          <p className="text-ink-600 font-medium uppercase text-sm tracking-widest">Không tìm thấy review nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.ReviewID}
              className="bg-white p-6 border border-ink-200 border-l-4 border-l-brand-500 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink-900">{review.UserName}</p>
                    <span className="text-xs px-2 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full font-medium">
                      {review.Email}
                    </span>
                  </div>
                  <p className="text-sm text-ink-500">Tour: {review.TourName}</p>
                </div>
                <button
                  onClick={() => handleDelete(review.ReviewID)}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-ink-600 hover:bg-ink-700 rounded-lg transition"
                >
                  Xóa
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg text-brand-500">{renderStars(review.Rating)}</span>
                <span className="text-sm font-semibold text-ink-600">({review.Rating}/5)</span>
              </div>

              <p className="text-ink-700 text-sm leading-relaxed">{review.Comment}</p>

              <p className="text-xs text-ink-400 mt-3">
                {new Date(review.ReviewDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          ))}

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border border-ink-300 flex items-center justify-between rounded-2xl">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-ink-300 hover:bg-cream disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-ink-600">
              Trang {page} / {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-ink-300 hover:bg-cream disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
