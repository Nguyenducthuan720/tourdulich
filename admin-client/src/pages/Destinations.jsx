import { useEffect, useState } from 'react'
import { getDestinations, createDestination, updateDestination, deleteDestination } from '../api/adminService'
import { Icon } from '../components/icons'

const emptyForm = {
  name: '',
  image: '',
  description: '',
}

export default function Destinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const data = await getDestinations()
      setDestinations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch destinations error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (destination) => {
    setEditing(destination)
    setForm({
      name: destination.DestinationName || destination.name || '',
      image: destination.ImageURL || destination.image || '',
      description: destination.Description || destination.description || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên điểm đến')
      return
    }
    try {
      setSaving(true)
      if (editing) {
        await updateDestination(editing.DestinationID || editing.id, {
          name: form.name,
          image: form.image,
          description: form.description,
        })
      } else {
        await createDestination({
          name: form.name,
          image: form.image,
          description: form.description,
        })
      }
      setModalOpen(false)
      fetchDestinations()
    } catch (error) {
      alert(error.message || 'Lỗi lưu điểm đến')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (destination) => {
    if (!confirm(`Xóa điểm đến "${destination.DestinationName || destination.name}"?`)) return
    try {
      await deleteDestination(destination.DestinationID || destination.id)
      fetchDestinations()
    } catch (error) {
      alert(error.message || 'Lỗi xóa điểm đến')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Điểm đến</h1>
          <p className="mt-1 text-sm text-ink-500">Thêm, chỉnh sửa và xóa điểm đến du lịch</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Thêm điểm đến
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải điểm đến...</p>
          </div>
        </div>
      ) : destinations.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-400">Chưa có điểm đến nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Tên</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Mô tả</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((destination) => (
                  <tr key={destination.DestinationID || destination.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-ink-500">#{destination.DestinationID || destination.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-ink-100 overflow-hidden">
                          {(destination.ImageURL || destination.image) ? (
                            <img src={destination.ImageURL || destination.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ink-400">
                              <Icon name="pin" className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-ink-900">{destination.DestinationName || destination.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-600 line-clamp-1">{destination.Description || destination.description || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(destination)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(destination)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-ink-200 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">{editing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
                <h2 className="font-display text-xl font-semibold text-ink-900">{editing ? 'Cập nhật điểm đến' : 'Tạo điểm đến mới'}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-ink-400 hover:text-ink-800 transition">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="field-label">Tên điểm đến</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Vịnh Hạ Long" />
              </div>
              <div>
                <label className="field-label">URL ảnh</label>
                <input className="input-field" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/images/destinations/halong.jpg" />
              </div>
              <div>
                <label className="field-label">Mô tả</label>
                <textarea className="input-field" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn về điểm đến..." />
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
