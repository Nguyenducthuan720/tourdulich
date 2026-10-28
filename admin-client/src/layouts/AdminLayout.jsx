import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/icons'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/tours', label: 'Tours', icon: 'map' },
  { to: '/categories', label: 'Danh mục', icon: 'spark' },
  { to: '/destinations', label: 'Điểm đến', icon: 'pin' },
  { to: '/flights', label: 'Chuyến bay', icon: 'plane' },
  { to: '/bookings', label: 'Đặt hàng', icon: 'check' },
  { to: '/users', label: 'Users', icon: 'user' },
  { to: '/reviews', label: 'Đánh giá', icon: 'star' },
  { to: '/ai-insights', label: 'AI Insights', icon: 'chart' },
  { to: '/settings', label: 'Cài đặt', icon: 'spark' },
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

  const pageTitle = {
    '/': 'Bảng điều khiển',
    '/tours': 'Quản lý Tours',
    '/categories': 'Quản lý Danh mục',
    '/destinations': 'Quản lý Điểm đến',
    '/flights': 'Quản lý Chuyến bay',
    '/bookings': 'Quản lý Đặt hàng',
    '/users': 'Quản lý Users',
    '/reviews': 'Quản lý Đánh giá',
    '/ai-insights': 'AI Insights',
    '/settings': 'Cài đặt',
  }[location.pathname] || 'Admin'

  return (
    <div className="min-h-screen bg-ink-100 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-ink-900 text-white transition-all duration-300 fixed h-screen flex flex-col z-50`}
      >
        {/* Logo */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-ink-700">
          <Link to="/" className={`flex items-center gap-3 overflow-hidden ${!sidebarOpen ? 'mx-auto' : ''}`}>
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            {sidebarOpen && (
              <span className="font-bold text-base truncate uppercase tracking-widest text-ink-100">
                Admin Panel
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                title={!sidebarOpen ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
                }`}
              >
                <span className="shrink-0 grid h-9 w-9 place-items-center rounded-lg bg-ink-800/60 text-current group-hover:bg-ink-700">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}

                {!sidebarOpen && isActive && (
                  <span className="absolute left-full ml-2 rounded-lg bg-ink-800 px-2 py-1 text-xs font-medium text-ink-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-ink-700 p-3 space-y-2">
          {sidebarOpen && user && (
            <div className="p-3 bg-ink-800 border border-ink-700 rounded-xl">
              <p className="text-[0.65rem] text-ink-400 uppercase tracking-wider mb-1">Đăng nhập với</p>
              <p className="text-sm font-semibold text-ink-100 truncate">{user.name}</p>
              <p className="text-xs text-ink-400 truncate">{user.email}</p>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-800 px-3 py-2 text-xs font-medium text-ink-300 hover:bg-ink-700 hover:text-ink-100 transition-colors"
          >
            <Icon name={sidebarOpen ? 'chevronLeft' : 'chevronRight'} className="h-4 w-4" />
            {sidebarOpen && <span>Thu gọn</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full rounded-xl border border-ink-700 bg-ink-800 px-3 py-2 text-xs font-medium text-ink-300 hover:bg-ink-700 hover:text-ink-100 transition-colors ${
              !sidebarOpen ? 'flex items-center justify-center' : ''
            }`}
            title={!sidebarOpen ? 'Đăng xuất' : undefined}
          >
            <Icon name="arrowRight" className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 min-h-screen`}>
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur border-b border-ink-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-brand-500" />
              <h1 className="text-xl font-bold text-ink-800 uppercase tracking-wider text-balance">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink-500 font-medium">
                {user?.name} ({user?.role})
              </span>
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-ink-600 border border-ink-300 hover:border-brand-400 hover:text-brand-700 rounded-lg transition-colors"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-gradient-to-br from-ink-50 to-cream min-h-[calc(100vh-73px)]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
