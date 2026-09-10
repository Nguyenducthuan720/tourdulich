import { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/adminService'
import { Icon } from '../components/icons'

const emptyForm = {
  name: '',
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch categories error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (category) => {
    setEditing(category)
    setForm({
      name: category.CategoryName || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên danh mục')
      return
    }
    try {
      setSaving(true)
      if (editing) {
        await updateCategory(editing.CategoryID, { name: form.name })
      } else {
        await createCategory({ name: form.name })
      }
      setModalOpen(false)
      fetchCategories()
    } catch (error) {
      alert(error.message || 'Lỗi lưu danh mục')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    if (!confirm(`Xóa danh mục "${category.CategoryName}"?`)) return
    try {
      await deleteCategory(category.CategoryID)
      fetchCategories()
    } catch (error) {
      alert(error.message || 'Lỗi xóa danh mục')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Danh mục</h1>
          <p className="mt-1 text-sm text-ink-500">Thêm, chỉnh sửa và xóa danh mục tour</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải danh mục...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-400">Chưa có danh mục nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Tên danh mục</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.CategoryID} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-ink-500">#{category.CategoryID}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-ink-900">{category.CategoryName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
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
          <div className="card w-full max-w-md">
            <div className="p-6 border-b border-ink-200 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">{editing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
                <h2 className="font-display text-xl font-semibold text-ink-900">{editing ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-ink-400 hover:text-ink-800 transition">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6">
              <label className="field-label">Tên danh mục</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Nghỉ dưỡng"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
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
