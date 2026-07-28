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
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto z-50`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-700 flex items-center justify-center text-white font-bold">
                A
              </div>
              {sidebarOpen && <span className="font-bold text-lg truncate uppercase tracking-widest text-slate-100">Admin Panel</span>}
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
                  ? 'bg-slate-800 text-white border-l-4 border-slate-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
          {sidebarOpen && (
            <div className="mb-4 p-3 bg-slate-800 border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Đăng nhập với</p>
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full mb-2 px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            {sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            {sidebarOpen ? 'Đăng xuất' : ''}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium">
                {user?.name} ({user?.role})
              </span>
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors"
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
