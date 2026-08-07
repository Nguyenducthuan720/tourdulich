import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      if (user?.role?.toLowerCase() === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/30">
          {/* Header Background */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          
          <div className="p-8">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-3xl">✈️</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
              <p className="text-slate-500">Chào mừng bạn trở lại tour luong</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border-l-4 border-red-400 p-4 animate-pulse">
                <p className="text-red-800 text-sm font-medium">
                  <span className="font-bold">Lỗi: </span>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                   Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50 text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                   Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50 text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer rounded border-slate-300 accent-emerald-600" />
                  <span className="text-slate-600 font-medium">Ghi nhớ tôi</span>
                </label>
                <Link to="#" className="text-emerald-600 hover:text-emerald-700 font-semibold transition">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed duration-200 hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Đang đăng nhập...
                  </span>
                ) : (
                  ' Đăng nhập'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-slate-400 text-xs font-medium">HOẶC</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-2">
              <button className="w-full border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <span></span> Google
              </button>
              <button className="w-full border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <span></span> Facebook
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600 text-sm">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 transition">
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Test Credentials */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-bold text-blue-900 mb-1"> Thông tin test:</p>
              <p className="text-xs text-blue-800">Email: admin@tourdulich.com</p>
              <p className="text-xs text-blue-800">Password: admin@123456</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/80 text-xs">
          <p>© 2026 tour luong. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  )
}
