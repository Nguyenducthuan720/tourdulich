import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../api/authService'
import { Icon } from '../components/icons'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    try {
      setLoading(true)
      console.debug('[admin-client][login] submitting', email)
      const data = await apiLogin(email, password)
      console.debug('[admin-client][login] success', data)
      setSession(data.token, data.user)
      navigate('/')
    } catch (err) {
      console.error('[admin-client][login] failed', err)
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-ink-900/10">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-white">
            <span className="font-display text-2xl font-bold">A</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-white">Admin Panel</h1>
          <p className="mt-2 text-sm text-brand-100">Đăng nhập để quản trị hệ thống</p>
        </div>

        <div className="p-8">
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
                placeholder="admin@tourdulich.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-xs font-semibold text-brand-900">Tài khoản admin mặc định</p>
            <p className="mt-1 text-xs text-brand-800">Email: admin@tourdulich.com</p>
            <p className="text-xs text-brand-800">Mật khẩu: admin@123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
