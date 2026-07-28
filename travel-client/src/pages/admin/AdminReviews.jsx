import { useEffect, useState } from 'react'
import { getReviews, deleteReview } from '../../api/adminService'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [page])

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

  const handleDelete = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa review này?')) {
      try {
        await deleteReview(id)
        fetchReviews()
      } catch (error) {
        console.error('Delete review error:', error)
        alert('Lỗi xóa review')
      }
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i}>{i < rating ? '★' : '☆'}</span>
    ))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-wider">Quản lý Đánh giá</h1>
      </div>

      <div className="mb-4 p-4 bg-slate-50 border border-slate-300">
        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Tổng cộng: {total} đánh giá
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-slate-600 font-medium uppercase text-sm tracking-widest">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-300">
          <p className="text-slate-600 font-medium uppercase text-sm tracking-widest">Không tìm thấy review nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.ReviewID}
              className="bg-white p-6 border border-slate-300 border-l-4 border-l-slate-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{review.UserName}</p>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-800 border border-slate-200">
                      {review.Email}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Tour: {review.TourName}</p>
                </div>
                <button
                  onClick={() => handleDelete(review.ReviewID)}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-slate-600 hover:bg-slate-700"
                >
                  Xóa
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg text-slate-700">{renderStars(review.Rating)}</span>
                <span className="text-sm font-semibold text-slate-500">({review.Rating}/5)</span>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed">{review.Comment}</p>

              <p className="text-xs text-slate-400 mt-3">
                {new Date(review.ReviewDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          ))}

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border border-slate-300 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-medium text-slate-600">
              Trang {page} / {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
