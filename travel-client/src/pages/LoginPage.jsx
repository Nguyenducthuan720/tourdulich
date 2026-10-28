import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/icons'

const features = [
  'Hơn 18 tour cao cấp trong và ngoài nước',
  'Hỗ trợ khách hàng 24/7 tận tâm',
  'Thanh toán linh hoạt, bảo mật tuyệt đối',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }
    try {
      setLoading(true)
      const user = await login({ email, password })
      const isAdmin = user?.role?.toLowerCase() === 'admin'

      if (isAdmin) {
        const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5176'
        // Absolute URL -> full page navigation (React Router navigate() only handles in-app paths)
        window.location.href = adminUrl
        return
      }

      navigate('/')
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream via-cream to-brand-50 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-lift ring-1 ring-ink-900/[0.05] md:grid-cols-2">
        {/* Brand panel */}
        <aside className="vivu-auth-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white md:flex">
          <div className="vivu-auth-shade absolute inset-0"></div>
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/15 text-lg font-bold">
              V
            </span>
            <span className="text-xl font-extrabold">Vivu Travel</span>
          </div>

          <div className="relative">
            <p className="eyebrow mb-4 text-white/80">Chào mừng trở lại</p>
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Tiếp nối hành trình
              <span className="block italic text-white/90">của bạn</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-white">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/60">
            © 2026 Vivu Travel. All rights reserved.
          </p>
        </aside>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center md:text-left">
            <h1 className="font-display text-3xl font-semibold text-ink-900">Đăng nhập</h1>
            <p className="mt-2 text-sm text-ink-500">
              Đăng nhập để đặt tour và quản lý hành trình của bạn.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">⚠ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="field-label mb-0">Mật khẩu</label>
                <Link to="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input-field pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400 hover:text-brand-600"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-ink-200"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">hoặc</span>
            <div className="h-px flex-1 bg-ink-200"></div>
          </div>

          <div className="text-center text-sm text-ink-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
