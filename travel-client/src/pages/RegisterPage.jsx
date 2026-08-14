import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/icons'

const features = [
  'Hơn 18 tour cao cấp trong và ngoài nước',
  'Hỗ trợ khách hàng 24/7 tận tâm',
  'Thanh toán linh hoạt, bảo mật tuyệt đối',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!formData.name || !formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    try {
      setLoading(true)
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-ink-900/[0.05] md:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden flex-col justify-between bg-ink-900 p-10 text-white md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700/30 via-transparent to-transparent"></div>
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-display text-lg font-bold">
              T
            </span>
            <span className="font-display text-xl font-semibold">Tour Lượng</span>
          </div>

          <div className="relative">
            <p className="eyebrow mb-4 text-brand-300">Bắt đầu ngay</p>
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Mở cửa thế giới
              <span className="block italic text-brand-300">của bạn</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-ink-200">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-ink-400">
            © 2026 Tour Lượng. All rights reserved.
          </p>
        </aside>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center md:text-left">
            <h1 className="font-display text-3xl font-semibold text-ink-900">Đăng ký</h1>
            <p className="mt-2 text-sm text-ink-500">
              Tạo tài khoản để bắt đầu hành trình cùng Tour Lượng.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Họ tên</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
              />
              <p className="mt-1 text-xs text-ink-400">Tối thiểu 6 ký tự</p>
            </div>

            <div>
              <label className="field-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-ink-600">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded border-ink-300 accent-brand-500"
                required
              />
              <span>
                Tôi đồng ý với{' '}
                <Link to="#" className="font-semibold text-brand-600 hover:text-brand-700">
                  điều khoản sử dụng
                </Link>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-ink-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
