import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../icons'

const navItems = [
  { to: '/', label: ' Trang chủ' },
  { to: '/my-bookings', label: ' Lịch sử' },
  { to: '/flight-booking', label: ' Vé máy bay' },
  { to: '/profile', label: ' Hồ sơ' },
  { to: '/about', label: ' Về chúng tôi' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, logout, user } = useAuth()

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-semibold transition duration-300 ${
      isActive 
        ? 'text-amber-600' 
        : 'text-slate-700 hover:text-amber-600'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            ✦
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-slate-900">Tour Lượng</div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Premium Travel</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
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
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{user?.name || 'Tài khoản'}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-all duration-300"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-amber-600 transition" 
                to="/login"
              >
                Đăng nhập
              </Link>
              <Link
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 hover:shadow-xl transition-all duration-300"
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
          className="grid h-11 w-11 place-items-center rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Mở menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-2 pt-4">
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
            
            <div className="border-t border-slate-200 pt-4 mt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm font-bold text-slate-900 mb-3">
                     {user?.name || 'Tài khoản'}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }} 
                    className="w-full rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block rounded-xl px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => setOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="mt-2 block rounded-xl bg-amber-500 px-5 py-3 text-center text-sm font-bold text-white hover:bg-amber-600 transition"
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
