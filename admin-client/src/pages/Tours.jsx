import { useEffect, useState } from 'react'
import { getTours, createTour, updateTour, deleteTour, getCategories } from '../api/adminService'
import { Icon } from '../components/icons'

const emptyForm = {
  title: '',
  location: '',
  price: '',
  duration: '',
  categoryId: '',
  seats: '',
  description: '',
  image: '',
}

export default function Tours() {
  const [tours, setTours] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [toursData, cats] = await Promise.all([
        getTours(),
        getCategories(),
      ])
      setTours(toursData?.items || [])
      setCategories(cats || [])
    } catch (error) {
      console.error('Fetch tours error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (tour) => {
    setEditing(tour)
    setForm({
      title: tour.TourName || '',
      location: tour.Destination || '',
      price: tour.Price ?? '',
      duration: tour.Duration || '',
      categoryId: tour.CategoryID ?? '',
      seats: tour.AvailableSeats ?? '',
      description: tour.Description || '',
      image: tour.ImageURL || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.location || !form.price || !form.categoryId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    try {
      setSaving(true)
      const payload = {
        title: form.title,
        location: form.location,
        price: Number(form.price),
        duration: form.duration,
        categoryId: Number(form.categoryId),
        seats: Number(form.seats) || 0,
        description: form.description,
        image: form.image,
      }
      if (editing) {
        await updateTour(editing.TourID, payload)
      } else {
        await createTour(payload)
      }
      setModalOpen(false)
      fetchAll()
    } catch (error) {
      alert(error.message || 'Lỗi lưu tour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tour) => {
    if (!confirm(`Xóa tour "${tour.TourName}"?`)) return
    try {
      await deleteTour(tour.TourID)
      fetchAll()
    } catch (error) {
      alert(error.message || 'Lỗi xóa tour')
    }
  }

  const filtered = tours.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.TourName?.toLowerCase().includes(q) ||
      t.Destination?.toLowerCase().includes(q) ||
      t.CategoryName?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Tours</h1>
          <p className="mt-1 text-sm text-ink-500">Thêm, chỉnh sửa và xóa tour du lịch</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="spark" className="h-4 w-4" />
          Thêm tour mới
        </button>
      </div>

      <div className="mb-4 card p-4">
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Tìm theo tên tour, điểm đến..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải tours...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-400">Không tìm thấy tour nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Tour</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Điểm đến</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Loại</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-ink-500">Giá</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tour) => (
                  <tr key={tour.TourID} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-ink-500">#{tour.TourID}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-ink-100 overflow-hidden">
                          {tour.ImageURL ? (
                            <img src={tour.ImageURL} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-400">
                              <Icon name="map" className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900">{tour.TourName}</p>
                          <p className="truncate text-xs text-ink-400">{tour.Duration || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-600">{tour.Destination || '—'}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">{tour.CategoryName || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="amount font-semibold text-ink-800">
                        {tour.Price?.toLocaleString?.()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        Number(tour.Status) === 1
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-ink-100 text-ink-500 border border-ink-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${Number(tour.Status) === 1 ? 'bg-emerald-500' : 'bg-ink-400'}`} />
                        {Number(tour.Status) === 1 ? 'Hiện' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(tour)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(tour)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-ink-600 hover:bg-ink-700 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-ink-200 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">{editing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
                <h2 className="font-display text-xl font-semibold text-ink-900">{editing ? 'Cập nhật tour' : 'Tạo tour mới'}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-ink-400 hover:text-ink-800 transition">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label">Tên tour</label>
                  <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Tour Hạ Long 3N2Đ" />
                </div>
                <div>
                  <label className="field-label">Điểm đến</label>
                  <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Vịnh Hạ Long" />
                </div>
                <div>
                  <label className="field-label">Thời gian</label>
                  <input className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 ngày 2 đêm" />
                </div>
                <div>
                  <label className="field-label">Giá (đ)</label>
                  <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500000" />
                </div>
                <div>
                  <label className="field-label">Số chỗ</label>
                  <input type="number" className="input-field" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} placeholder="30" />
                </div>
                <div>
                  <label className="field-label">Loại tour</label>
                  <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">-- Chọn loại --</option>
                    {categories.map((c) => (
                      <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Mô tả</label>
                  <textarea className="input-field" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn về tour..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">URL ảnh</label>
                  <input className="input-field" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/images/tours/halong.jpg" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-ink-200 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn-outline">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
