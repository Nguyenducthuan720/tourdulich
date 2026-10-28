import { useEffect, useState } from 'react'
import {
  getAIStats,
  getAISessions,
  getAISessionDetail,
  deleteAISession,
} from '../api/adminService'
import { Icon } from '../components/icons'

function StatCard({ icon, label, value, accent = 'brand' }) {
  const styles = {
    brand: 'from-brand-500/10 to-brand-600/5 text-brand-700 ring-brand-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 ring-emerald-500/20',
    sky: 'from-sky-500/10 to-sky-600/5 text-sky-700 ring-sky-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-700 ring-amber-500/20',
    violet: 'from-violet-500/10 to-violet-600/5 text-violet-700 ring-violet-500/20',
  }[accent]

  return (
    <div className={`card bg-gradient-to-br ${styles} ring-1`}>
      <div className="flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/70 text-current">
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
          <p className="amount font-display text-2xl font-bold leading-tight text-ink-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function BarList({ items, emptyText, accent = '#c2882f' }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  if (!items.length) return <p className="py-8 text-center text-sm text-ink-400">{emptyText}</p>
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm font-medium text-ink-700">{item.name}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.count / max) * 100}%`, background: accent }}
            />
          </div>
          <span className="w-8 text-right text-sm font-bold text-ink-800">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

export default function AIInsights() {
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchStats = async () => {
    try {
      setStats(await getAIStats())
    } catch (error) {
      console.error('Fetch AI stats error:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await getAISessions(page, 10, search)
      setSessions(data?.data || [])
      setTotal(data?.total || 0)
      setPages(data?.pages || 1)
    } catch (error) {
      console.error('Fetch AI sessions error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [page, search])

  const openDetail = async (sessionId) => {
    try {
      setDetailLoading(true)
      const data = await getAISessionDetail(sessionId)
      setDetail(data)
    } catch (error) {
      alert(error.message || 'Không lấy được chi tiết phiên chat')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (sessionId) => {
    if (!confirm(`Xoá phiên chat "${sessionId}"?`)) return
    try {
      await deleteAISession(sessionId)
      setDetail(null)
      fetchSessions()
      fetchStats()
    } catch (error) {
      alert(error.message || 'Lỗi xoá phiên chat')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">AI Insights</h1>
        <p className="mt-1 text-sm text-ink-500">
          Phân tích hội thoại chatbot, sở thích và hành vi khách hàng
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="spark" label="Phiên hội thoại" value={stats?.totalSessions || 0} accent="brand" />
        <StatCard icon="mail" label="Tổng tin nhắn" value={stats?.totalMessages || 0} accent="sky" />
        <StatCard
          icon="chart"
          label="Tin/phiên"
          value={stats?.avgMessagesPerSession || 0}
          accent="emerald"
        />
        <StatCard
          icon="user"
          label="Đã đăng nhập"
          value={`${stats?.loggedInSessions || 0} / ${stats?.totalSessions || 0}`}
          accent="violet"
        />
      </div>

      {/* Insight panels */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <p className="eyebrow mb-1">Quan tâm nhiều nhất</p>
          <h2 className="mb-5 font-display text-xl font-semibold text-ink-900">Điểm đến được hỏi</h2>
          <BarList items={stats?.topDestinations || []} emptyText="Chưa có dữ liệu điểm đến" />
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-1">Hồ sơ khách</p>
          <h2 className="mb-5 font-display text-xl font-semibold text-ink-900">Ngân sách & thời lượng</h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Ngân sách TB</p>
              <p className="amount font-display text-2xl font-bold text-brand-600">
                {Number(stats?.avgBudget || 0).toLocaleString()}đ
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Thời lượng TB</p>
              <p className="font-display text-2xl font-bold text-ink-900">
                {stats?.avgDuration || 0} ngày
              </p>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Thiết bị</p>
              <div className="mt-1 space-y-1">
                {(stats?.deviceSplit || []).map((d) => (
                  <p key={d.device} className="flex justify-between text-sm">
                    <span className="text-ink-600">{d.device}</span>
                    <span className="font-bold text-ink-900">{d.count}</span>
                  </p>
                ))}
                {!stats?.deviceSplit?.length && <p className="text-sm text-ink-400">Chưa có dữ liệu</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="card mb-6 p-6">
        <p className="eyebrow mb-1">Sở thích nổi bật</p>
        <h2 className="mb-4 font-display text-xl font-semibold text-ink-900">Thẻ hành vi được suy luận</h2>
        <div className="flex flex-wrap gap-2">
          {(stats?.topTags || []).map((t) => (
            <span
              key={t.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
            >
              {t.name}
              <span className="rounded-full bg-brand-500 px-1.5 text-[0.65rem] text-white">{t.count}</span>
            </span>
          ))}
          {!stats?.topTags?.length && <p className="text-sm text-ink-400">Chưa có thẻ nào</p>}
        </div>
      </div>

      {/* Sessions */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900">Phiên hội thoại</h2>
            <p className="text-sm text-ink-500">Tổng {total} phiên</p>
          </div>
          <input
            type="text"
            placeholder="Tìm theo mã phiên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="input-field w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800" />
              <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải...</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-12 text-center text-sm font-medium uppercase tracking-widest text-ink-400">
            Chưa có phiên hội thoại nào
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 border-b border-ink-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Phiên</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Khách</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Tin nhắn</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Điểm đến</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Cập nhật</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.session_id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-ink-800">{s.session_id}</p>
                        <p className="text-[0.7rem] text-ink-400">{s.meta_data?.device || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-600">
                        {s.user_id ? `#${s.user_id}` : <span className="text-ink-400">Khách</span>}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-ink-800">{s.messageCount || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(s.extracted_behavior?.preferred_destinations || []).slice(0, 2).map((d) => (
                            <span key={d} className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-medium text-brand-700">
                              {d}
                            </span>
                          ))}
                          {!s.extracted_behavior?.preferred_destinations?.length && (
                            <span className="text-xs text-ink-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-500">
                        {s.last_updated ? new Date(s.last_updated).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetail(s.session_id)}
                            className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 transition hover:bg-brand-50"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleDelete(s.session_id)}
                            className="rounded-lg bg-ink-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-ink-700"
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-ink-200 px-5 py-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-ink-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-cream disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm font-medium text-ink-600">
                Trang {page} / {pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="rounded-lg border border-ink-300 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-cream disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">
          <div className="card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-200 p-5">
              <div>
                <p className="eyebrow mb-1">Chi tiết phiên</p>
                <h3 className="font-mono text-sm font-semibold text-ink-900">
                  {detail?.session_id || 'Đang tải...'}
                </h3>
              </div>
              <button onClick={() => setDetail(null)} className="text-ink-400 transition hover:text-ink-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailLoading && !detail ? (
              <div className="p-10 text-center text-sm text-ink-500">Đang tải...</div>
            ) : (
              <>
                <div className="border-b border-ink-200 bg-cream p-5">
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">Khách</p>
                      <p className="font-semibold text-ink-900">
                        {detail.user_id ? `#${detail.user_id}` : 'Khách'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">Thiết bị</p>
                      <p className="font-semibold text-ink-900">{detail.meta_data?.device || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">Ngân sách</p>
                      <p className="amount font-semibold text-ink-900">
                        {detail.extracted_behavior?.max_budget_detected
                          ? `${Number(detail.extracted_behavior.max_budget_detected).toLocaleString()}đ`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">Số ngày</p>
                      <p className="font-semibold text-ink-900">
                        {detail.extracted_behavior?.duration_days_detected || '—'}
                      </p>
                    </div>
                  </div>
                  {(detail.extracted_behavior?.preferred_destinations?.length > 0 ||
                    detail.extracted_behavior?.inferred_tags?.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(detail.extracted_behavior.preferred_destinations || []).map((d) => (
                        <span key={d} className="rounded-full bg-brand-500 px-3 py-1 text-[0.7rem] font-semibold text-white">
                          {d}
                        </span>
                      ))}
                      {(detail.extracted_behavior.inferred_tags || []).map((t) => (
                        <span key={t} className="rounded-full border border-brand-200 bg-white px-3 py-1 text-[0.7rem] font-medium text-brand-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {(detail.conversations || []).map((c, i) => (
                    <div key={i} className={`flex ${c.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          c.sender === 'user'
                            ? 'bg-brand-600 text-white'
                            : 'border border-ink-100 bg-white text-ink-800'
                        }`}
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {c.message}
                        <p
                          className={`mt-1 text-[0.65rem] ${
                            c.sender === 'user' ? 'text-white/60' : 'text-ink-400'
                          }`}
                        >
                          {c.timestamp ? new Date(c.timestamp).toLocaleString('vi-VN') : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!detail.conversations?.length && (
                    <p className="py-8 text-center text-sm text-ink-400">Phiên này chưa có tin nhắn</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
