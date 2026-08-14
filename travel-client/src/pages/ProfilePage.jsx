import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword, getProfile, updateProfile } from '../api/userService'
import { useAuth } from '../context/AuthContext'

const initialProfile = { name: '', email: '', phone: '', address: '', avatar: '' }

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(initialProfile)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    getProfile()
      .then(data => {
        const profileData = { 
          name: data.name || '', 
          email: data.email || '', 
          phone: data.phone || '', 
          address: data.address || '',
          avatar: data.avatar || ''
        }
        setProfile(profileData)
        setAvatarPreview(data.avatar || '')
      })
      .catch(err => setError(err.message || 'Không thể tải hồ sơ'))
      .finally(() => setLoading(false))
  }, [])

  const updateField = (field, value) => setProfile(current => ({ ...current, [field]: value }))
  const updatePasswordField = (field, value) => setPasswords(current => ({ ...current, [field]: value }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setProfile(current => ({ ...current, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const updated = await updateProfile(profile)
      setProfile({ 
        name: updated.name, 
        email: updated.email, 
        phone: updated.phone || '', 
        address: updated.address || '',
        avatar: updated.avatar || ''
      })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-48 bg-ink-200 rounded-3xl animate-pulse mb-8"></div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="h-[500px] bg-ink-200 rounded-3xl animate-pulse"></div>
            <div className="space-y-6">
              <div className="h-[350px] bg-ink-200 rounded-3xl animate-pulse"></div>
              <div className="h-[200px] bg-ink-200 rounded-3xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const avatarDisplay = avatarPreview || (profile.name || user?.name || 'U').charAt(0).toUpperCase()
  const isAvatarImage = avatarPreview && avatarPreview.startsWith('data:')

  return (
    <main className="min-h-screen bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Card */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 p-8 lg:p-10 text-white shadow-2xl">
          <div className="flex flex-wrap items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-white/20 text-5xl font-bold ring-4 ring-white/30 overflow-hidden shadow-2xl">
                {isAvatarImage ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{avatarDisplay}</span>
                )}
              </div>
              <label className="absolute inset-0 grid place-items-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
                <span className="text-white text-sm font-bold">Đổi ảnh</span>
              </label>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-100 mb-1">Tài khoản Tour Lượng</p>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{profile.name || user?.name || 'Người dùng'}</h1>
              <p className="text-brand-100">{profile.email || user?.email}</p>
            </div>
            
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-5 py-2 text-sm font-bold border border-white/30">
              {user?.role || 'Customer'}
            </span>
          </div>
        </div>

        {/* Messages */}
        {(message || error) && (
          <div className={`mb-6 rounded-2xl border-2 p-5 font-bold text-lg animate-fade-in ${
            error ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}>
            {error ? ` ${error}` : `✓ ${message}`}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="rounded-3xl border-2 border-ink-100 bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ink-900 mb-2">Thông tin cá nhân</h2>
              <p className="text-ink-600">Cập nhật thông tin dùng khi đặt tour và vé máy bay</p>
            </div>
            
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-ink-700 uppercase tracking-wider">Họ và tên</span>
                <input 
                  required 
                  value={profile.name} 
                  onChange={e => updateField('name', e.target.value)} 
                  className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-ink-700 uppercase tracking-wider">Email</span>
                <input 
                  required 
                  type="email" 
                  value={profile.email} 
                  onChange={e => updateField('email', e.target.value)} 
                  className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-ink-700 uppercase tracking-wider">Số điện thoại</span>
                <input 
                  value={profile.phone} 
                  onChange={e => updateField('phone', e.target.value)} 
                  placeholder="Nhập số điện thoại"
                  className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-ink-700 uppercase tracking-wider">Địa chỉ</span>
                <textarea 
                  value={profile.address} 
                  onChange={e => updateField('address', e.target.value)} 
                  rows="3" 
                  placeholder="Nhập địa chỉ"
                  className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                />
              </label>
            </div>
            
            <button 
              disabled={saving} 
              className="mt-8 w-full rounded-xl bg-brand-500 px-6 py-4 font-bold text-white transition hover:bg-brand-600 disabled:opacity-50 hover:shadow-2xl text-lg"
            >
              {saving ? 'Đang lưu...' : ' Lưu thay đổi'}
            </button>
          </form>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="rounded-3xl border-2 border-ink-100 bg-white p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ink-900 mb-2"> Bảo mật tài khoản</h2>
                <p className="text-ink-600">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
              </div>
              
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink-700">Mật khẩu hiện tại</span>
                  <input 
                    required 
                    type="password" 
                    value={passwords.currentPassword} 
                    onChange={e => updatePasswordField('currentPassword', e.target.value)} 
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                  />
                </label>
                
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink-700">Mật khẩu mới</span>
                  <input 
                    required 
                    minLength="6" 
                    type="password" 
                    value={passwords.newPassword} 
                    onChange={e => updatePasswordField('newPassword', e.target.value)} 
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                  />
                </label>
                
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink-700">Xác nhận mật khẩu mới</span>
                  <input 
                    required 
                    minLength="6" 
                    type="password" 
                    value={passwords.confirmPassword} 
                    onChange={e => updatePasswordField('confirmPassword', e.target.value)} 
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-ink-200 px-5 py-4 outline-none focus:border-brand-500 transition"
                  />
                </label>
              </div>
              
              <button 
                disabled={changingPassword} 
                className="mt-8 w-full rounded-xl border-2 border-brand-500 px-6 py-4 font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50 text-lg"
              >
                {changingPassword ? 'Đang cập nhật...' : ' Đổi mật khẩu'}
              </button>
            </form>

            {/* Quick Links */}
            <div className="rounded-3xl border-2 border-ink-100 bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-ink-900 mb-5"> Quản lý chuyến đi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link 
                  to="/my-bookings" 
                  className="rounded-2xl bg-gradient-to-br from-ink-50 to-ink-100 p-5 text-base font-bold text-ink-700 transition hover:from-brand-50 hover:to-brand-100 hover:text-brand-700 border-2 border-ink-200 hover:border-brand-300"
                >
                   Lịch sử đặt tour →
                </Link>
                <Link 
                  to="/flight-booking" 
                  className="rounded-2xl bg-gradient-to-br from-ink-50 to-ink-100 p-5 text-base font-bold text-ink-700 transition hover:from-brand-50 hover:to-brand-100 hover:text-brand-700 border-2 border-ink-200 hover:border-brand-300"
                >
                   Đặt vé máy bay →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
