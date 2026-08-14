import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin', label: ' Dashboard'},
  { to: '/admin/users', label: ' Quản lý Users'},
  { to: '/admin/reviews', label: ' Quản lý Đánh giá'},
  { to: '/admin/bookings', label: ' Quản lý Đặt hàng'},
  { to: '/admin/tours', label: ' Quản lý Tours'},
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-ink-100 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-ink-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto z-50`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-ink-700">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-ink-700 flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && <span className="font-bold text-lg truncate uppercase tracking-widest text-ink-100">Admin Panel</span>}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                location.pathname === item.to
                  ? 'bg-ink-800 text-white border-l-4 border-ink-300'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200 border-l-4 border-transparent'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ink-700 bg-ink-900">
          {sidebarOpen && (
            <div className="mb-4 p-3 bg-ink-800 border border-ink-700">
              <p className="text-xs text-cream0 uppercase tracking-wider mb-1">Đăng nhập với</p>
              <p className="text-sm font-semibold text-ink-200 truncate">{user?.name}</p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full mb-2 px-4 py-2 text-xs font-medium bg-ink-800 hover:bg-ink-700 text-ink-300 transition-colors border border-ink-700"
          >
            {sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-xs font-medium bg-ink-800 hover:bg-ink-700 text-ink-300 transition-colors border border-ink-700"
          >
            {sidebarOpen ? 'Đăng xuất' : ''}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-ink-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-ink-800 uppercase tracking-wider">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-cream0 font-medium">
                {user?.name} ({user?.role})
              </span>
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-ink-600 border border-ink-300 hover:bg-cream transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
