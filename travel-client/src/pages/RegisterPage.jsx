import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-block w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center mb-5 shadow-xl">
              <span className="text-4xl text-white">✦</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Đăng ký</h1>
            <p className="text-slate-600">Tạo tài khoản để bắt đầu hành trình</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-900 text-sm font-medium"> {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Họ tên</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition bg-slate-50"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 mt-0.5 rounded border-slate-300 accent-amber-500" required />
              <span className="text-sm text-slate-700">
                Tôi đồng ý với{' '}
                <Link to="#" className="text-amber-600 hover:text-amber-700 font-bold">
                  điều khoản sử dụng
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl hover:bg-amber-600 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">hoặc</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="space-y-3">
            <button className="w-full border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-3">
              <span></span> Đăng ký bằng Google
            </button>
            <button className="w-full border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-3">
              <span></span> Đăng ký bằng Facebook
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white text-sm">
          <p>© 2026 LuxeTrip AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
