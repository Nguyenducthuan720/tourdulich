import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../icons'

const navItems = [
  { to: '/', label: 'Tour du lịch', end: true, desktop: true },
  { to: '/flights', label: 'Vé máy bay', desktop: true },
  { to: '/cars', label: 'Thuê xe', desktop: true },
  { to: '/hotels', label: 'Khách sạn', desktop: true },
  { to: '/planner', label: 'Lịch trình AI', desktop: true },
  { to: '/community', label: 'Cộng đồng' },
  { to: '/my-bookings', label: 'Đơn hàng' },
  { to: '/flight-booking', label: 'Đặt vé máy bay' },
  { to: '/profile', label: 'Hồ sơ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`

  return (
    <header className="vivu-header sticky top-0 z-50 border-b border-ink-900/[0.06] bg-cream/95 backdrop-blur-xl">
      <div className="vivu-utility-bar">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <span>Hotline 24/7: <a href="tel:19006868">1900 6868</a><span className="hidden sm:inline"> · Hỗ trợ bạn trên mọi hành trình</span></span>
          <Link to="/community" className="hidden sm:inline">Đánh giá thực tế từ cộng đồng <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <nav className="container-x flex items-center justify-between gap-5 py-3">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <span className="vivu-mark grid h-11 w-11 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white shadow-soft transition-transform duration-300 group-hover:-rotate-6">
            V
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-none text-brand-600">
              Vivu Travel
            </span>
            <span className="mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-500">
              OTA Vietnam
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="vivu-desktop-links hidden items-center gap-5 xl:flex">
          {navItems.filter((item) => item.desktop).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 xl:flex">
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
          className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 transition hover:border-brand-400 hover:text-brand-600 xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Mở menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-ink-900/[0.06] bg-cream px-6 pb-6 xl:hidden">
          <div className="flex flex-col gap-1 pt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-white'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            )            )}

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
