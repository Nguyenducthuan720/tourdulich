import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../api/adminService'
import { Icon } from '../components/icons'

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'Tour Du Lịch',
    contactEmail: '',
    phone: '',
    address: '',
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await getSettings()
      setSettings((prev) => ({ ...prev, ...data }))
    } catch (error) {
      console.error('Fetch settings error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateSettings(settings)
      alert('Lưu cài đặt thành công')
    } catch (error) {
      alert(error.message || 'Lỗi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Cài đặt</h1>
        <p className="mt-1 text-sm text-ink-500">Cấu hình chung của hệ thống</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải cài đặt...</p>
          </div>
        </div>
      ) : (
        <div className="card p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="field-label">Tên website</label>
              <input
                className="input-field"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Email liên hệ</label>
              <input
                className="input-field"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Số điện thoại</label>
              <input
                className="input-field"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Địa chỉ</label>
              <textarea
                className="input-field"
                rows="2"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="maintenance"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="maintenance" className="text-sm font-medium text-ink-700">
                Bật chế độ bảo trì
              </label>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button onClick={fetchSettings} className="btn btn-outline">Làm mới</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
