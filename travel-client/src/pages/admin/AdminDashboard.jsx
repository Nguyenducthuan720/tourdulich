import { useEffect, useState } from 'react'
import { getDashboardStats, getReviews } from '../../api/adminService'
import { Icon } from '../../components/icons'

const VIETNAM_MONTHS = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
]

const monthLabel = (m) => {
  const n = parseInt(m.split('-')[1], 10)
  return VIETNAM_MONTHS[n - 1] || m
}

const ratingColor = {
  1: '#b45309',
  2: '#d97706',
  3: '#ca8a04',
  4: '#b07a1f',
  5: '#c2882f',
}

function Stars({ rating }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          className={`h-4 w-4 ${i <= rating ? 'text-brand-500' : 'text-ink-200'}`}
          fill={i <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}

function StatCard({ icon, label, value, accent = 'brand' }) {
  const ring = {
    brand: 'bg-brand-50 text-brand-600',
    ink: 'bg-ink-100 text-ink-700',
    blue: 'bg-brand-50 text-brand-600',
  }[accent]
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${ring}`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</p>
        <p className="font-display text-2xl font-bold leading-tight text-ink-900">{value}</p>
      </div>
    </div>
  )
}

function TrendChart({ data, gradientId, height = '10rem' }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const w = 100
  const h = 42
  const pts = data.map((d, i) => {
    const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w
    const y = h - 4 - (d.count / max) * (h - 8)
    return [x, y]
  })
  const line = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height }} className="w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a44c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d4a44c" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="#c2882f"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.8" fill="#a56e22" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between">
        {data.map((d) => (
          <span key={d.month} className="text-[0.7rem] font-semibold text-ink-400">
            {monthLabel(d.month)}
          </span>
        ))}
      </div>
    </div>
  )
}

function RatingBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="space-y-3">
      {[...data].reverse().map((d) => (
        <div key={d.rating} className="flex items-center gap-3">
          <span className="flex w-14 items-center gap-1 text-sm font-semibold text-ink-600">
            {d.rating}
            <Icon name="star" className="h-3.5 w-3.5 text-brand-500" fill="currentColor" />
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.count / max) * 100}%`, background: ratingColor[d.rating] }}
            />
          </div>
          <span className="w-8 text-right text-sm font-bold text-ink-800">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

function RecentReview({ review }) {
  const date = review.CreatedAt
    ? new Date(review.CreatedAt).toLocaleDateString('vi-VN')
    : ''
  return (
    <li className="flex gap-4 border-b border-ink-100 py-4 last:border-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
        {(review.UserName || 'A').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink-900">{review.UserName}</p>
          <Stars rating={review.Rating} />
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-400">
          {review.TourName} · {date}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-ink-600">{review.Comment}</p>
      </div>
    </li>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [statData, reviewData] = await Promise.all([
        getDashboardStats(),
        getReviews(1, 5),
      ])
      setStats(statData)
      setReviews(reviewData?.data || [])
    } catch (error) {
      console.error('Fetch dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
          <p className="text-sm font-medium uppercase tracking-widest text-ink-600">
            Đang tải thống kê...
          </p>
        </div>
      </div>
    )
  }

  const avgRating = stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '0.0'

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <p className="eyebrow mb-2">Tổng quan</p>
        <h1 className="section-title">Bảng điều khiển</h1>
        <p className="mt-2 text-ink-500">
          Thống kê trực quan người dùng đăng ký và đánh giá tour.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon="user" label="Khách hàng" value={stats?.totalCustomers || 0} />
        <StatCard icon="map" label="Tour" value={stats?.totalTours || 0} accent="ink" />
        <StatCard icon="check" label="Đặt tour" value={stats?.totalBookings || 0} accent="ink" />
        <StatCard
          icon="spark"
          label="Doanh thu"
          value={`${Number(stats?.totalRevenue || 0).toLocaleString()}đ`}
        />
        <StatCard icon="star" label="Đánh giá" value={stats?.totalReviews || 0} />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1">6 tháng gần nhất</p>
              <h2 className="font-display text-xl font-semibold text-ink-900">
                Người dùng đăng ký mới
              </h2>
            </div>
            <span className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">
              {stats?.userTrend?.reduce((s, d) => s + d.count, 0) || 0} tài khoản
            </span>
          </div>
          <TrendChart data={stats?.userTrend || []} gradientId="userGrad" />
        </div>

        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1">Đánh giá</p>
              <h2 className="font-display text-xl font-semibold text-ink-900">Theo số sao</h2>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold text-brand-600">{avgRating}</p>
              <p className="text-xs font-semibold text-ink-400">trung bình</p>
            </div>
          </div>
          <RatingBars data={stats?.reviewsByRating || []} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-6">
            <p className="eyebrow mb-1">6 tháng gần nhất</p>
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Xu hướng bình luận tour
            </h2>
          </div>
          <TrendChart data={stats?.reviewTrend || []} gradientId="reviewGrad" />
        </div>

        <div className="card p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink-900">Đánh giá gần đây</h2>
            <span className="text-sm text-ink-400">{reviews.length} mới nhất</span>
          </div>
          {reviews.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-400">
              Chưa có đánh giá nào từ khách hàng.
            </p>
          ) : (
            <ul className="mt-2">
              {reviews.map((r) => (
                <RecentReview key={r.ReviewID} review={r} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
