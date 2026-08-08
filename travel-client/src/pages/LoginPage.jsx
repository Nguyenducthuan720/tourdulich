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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-block w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center mb-5 shadow-xl">
              <span className="text-4xl text-white">✦</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Đăng nhập</h1>
            <p className="text-slate-600">Chào mừng bạn trở lại Tour Lượng</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-900 text-sm font-medium">⚠ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-amber-500 transition bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-600 transition"
                >
                  {showPassword ? '' : ''}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-amber-500" />
                <span className="text-slate-600 font-medium">Ghi nhớ tôi</span>
              </label>
              <Link to="#" className="text-amber-600 hover:text-amber-700 font-bold transition">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-amber-500 text-white font-bold py-4 rounded-2xl hover:bg-amber-600 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">hoặc</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="space-y-3">
            <button className="w-full border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-3">
              <span></span> Google
            </button>
            <button className="w-full border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-3">
              <span></span> Facebook
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-sm">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-amber-600 font-bold hover:text-amber-700 transition">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-xs font-bold text-amber-900 mb-1">✦ Thông tin test:</p>
            <p className="text-xs text-amber-800">Email: admin@tourdulich.com</p>
            <p className="text-xs text-amber-800">Password: admin@123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
