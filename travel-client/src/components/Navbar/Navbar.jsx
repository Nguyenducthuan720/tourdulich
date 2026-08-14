import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../icons'

const navItems = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/my-bookings', label: 'Lịch sử' },
  { to: '/flight-booking', label: 'Vé máy bay' },
  { to: '/profile', label: 'Hồ sơ' },
  { to: '/about', label: 'Về chúng tôi' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, logout, user } = useAuth()

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/[0.06] bg-cream/85 backdrop-blur-xl">
      <nav className="container-x flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-display text-lg font-bold text-white shadow-soft transition-transform duration-500 group-hover:rotate-[18deg]">
            T
          </span>
          <span>
            <span className="block font-display text-xl font-semibold leading-none text-ink-900">
              Tour Lượng
            </span>
            <span className="mt-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-600">
              Premium Travel
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
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
            <div className="flex items-center gap-4 pl-4">
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-ink-900">
                  {user?.name || 'Tài khoản'}
                </div>
                <div className="text-xs text-ink-400">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="btn btn-outline"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:border-brand-400 hover:text-brand-600 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Mở menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-ink-900/[0.06] bg-cream px-6 pb-6 md:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-white'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-white'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <div className="mt-4 border-t border-ink-900/[0.06] pt-4">
              {isAuthenticated ? (
                <>
                  <div className="px-4 pb-3 text-sm font-semibold text-ink-900">
                    {user?.name || 'Tài khoản'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className="btn btn-outline w-full"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="btn btn-outline w-full"
                    onClick={() => setOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary w-full"
                    onClick={() => setOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
