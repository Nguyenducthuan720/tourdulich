import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../icons'

const navItems = [
  { to: '/', label: ' Trang chủ' },
  { to: '/my-bookings', label: ' Lịch sử' },
  { to: '/flight-booking', label: ' Vé máy bay' },
  { to: '/profile', label: ' Hồ sơ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, logout, user } = useAuth()

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
      isActive 
        ? 'bg-emerald-100 text-emerald-900 shadow-md' 
        : 'text-slate-700 hover:bg-slate-100'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
            
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">Tour Lượng</div>
            <div className="text-xs font-medium text-slate-500">Đi là sướng</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
               Admin
            </NavLink>
          )}
        </div>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">{user?.name || 'Tài khoản'}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:shadow-lg transition duration-200"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition" 
                to="/login"
              >
                Đăng nhập
              </Link>
              <Link
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:shadow-lg transition duration-200"
                to="/register"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 transition md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Mở menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={linkClass} 
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink 
                to="/admin" 
                className={linkClass} 
                onClick={() => setOpen(false)}
              >
                 Admin
              </NavLink>
            )}
            
            <div className="border-t border-slate-200 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm font-semibold text-slate-900 mb-2">
                     {user?.name || 'Tài khoản'}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }} 
                    className="w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700 transition mt-2"
                    onClick={() => setOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
