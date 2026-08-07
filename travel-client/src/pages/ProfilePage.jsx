import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword, getProfile, updateProfile } from '../api/userService'
import { useAuth } from '../context/AuthContext'

const initialProfile = { name: '', email: '', phone: '', address: '' }

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(initialProfile)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then(data => setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '', address: data.address || '' }))
      .catch(err => setError(err.message || 'Không thể tải hồ sơ'))
      .finally(() => setLoading(false))
  }, [])

  const updateField = (field, value) => setProfile(current => ({ ...current, [field]: value }))
  const updatePasswordField = (field, value) => setPasswords(current => ({ ...current, [field]: value }))

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const updated = await updateProfile(profile)
      setProfile({ name: updated.name, email: updated.email, phone: updated.phone || '', address: updated.address || '' })
      localStorage.setItem('travel_user', JSON.stringify({ ...user, ...updated }))
      setMessage('Thông tin hồ sơ đã được cập nhật.')
    } catch (err) {
      setError(err.message || 'Cập nhật hồ sơ thất bại')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setChangingPassword(true)
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Đổi mật khẩu thành công.')
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Đang tải hồ sơ...</div>

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-lg">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/20 text-3xl font-bold ring-4 ring-white/20">
              {(profile.name || user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-100">Tài khoản Tour Lượng</p>
              <h1 className="mt-1 text-3xl font-bold">Hồ sơ cá nhân</h1>
              <p className="mt-1 text-emerald-100">Quản lý thông tin và bảo mật tài khoản của bạn</p>
            </div>
          </div>
        </div>

        {(message || error) && <div className={`mb-5 rounded-xl border p-4 text-sm font-medium ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error || message}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2><p className="mt-1 text-sm text-slate-500">Thông tin dùng khi đặt tour và vé máy bay</p></div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{user?.role || 'Customer'}</span>
            </div>
            <div className="space-y-4">
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Họ và tên</span><input required value={profile.name} onChange={e => updateField('name', e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Email</span><input required type="email" value={profile.email} onChange={e => updateField('email', e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Số điện thoại</span><input value={profile.phone} onChange={e => updateField('phone', e.target.value)} placeholder="Nhập số điện thoại" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Địa chỉ</span><textarea value={profile.address} onChange={e => updateField('address', e.target.value)} rows="3" placeholder="Nhập địa chỉ" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </form>

          <div className="space-y-6">
            <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Bảo mật tài khoản</h2>
              <p className="mt-1 text-sm text-slate-500">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
              <div className="mt-5 space-y-4">
                <input required type="password" value={passwords.currentPassword} onChange={e => updatePasswordField('currentPassword', e.target.value)} placeholder="Mật khẩu hiện tại" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                <input required minLength="6" type="password" value={passwords.newPassword} onChange={e => updatePasswordField('newPassword', e.target.value)} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                <input required minLength="6" type="password" value={passwords.confirmPassword} onChange={e => updatePasswordField('confirmPassword', e.target.value)} placeholder="Xác nhận mật khẩu mới" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </div>
              <button disabled={changingPassword} className="mt-5 w-full rounded-lg border border-emerald-600 px-4 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50">{changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</button>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Quản lý chuyến đi</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link to="/my-bookings" className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Xem lịch sử đặt tour →</Link>
                <Link to="/flight-booking" className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Đặt vé máy bay →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
