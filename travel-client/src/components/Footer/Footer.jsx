import { Link } from 'react-router-dom'
import { Icon } from '../icons'

const socials = [
  { label: 'Facebook', short: 'Fb' },
  { label: 'Instagram', short: 'Ig' },
  { label: 'YouTube', short: 'Yt' },
]

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-100">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-display text-lg font-bold text-white">
                T
              </span>
              <span className="font-display text-xl font-semibold text-white">
                Tour Lượng
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-300">
              Nền tảng đặt tour trực tuyến hàng đầu — tối ưu lịch trình, vận hành
              booking hiện đại và dịch vụ đẳng cấp cho mọi hành trình.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white transition hover:bg-brand-500"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-400">
              Dịch vụ
            </h3>
            <ul className="space-y-3 text-sm text-ink-300">
              {[
                'Tour cao cấp trong nước',
                'Tour quốc tế',
                'Đặt vé máy bay',
                'Đặt khách sạn',
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <Icon name="arrowRight" className="h-3.5 w-3.5 text-brand-400" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-400">
              Khám phá
            </h3>
            <ul className="space-y-3 text-sm text-ink-300">
              {[
                { to: '/', label: 'Trang chủ' },
                { to: '/about', label: 'Về chúng tôi' },
                { to: '/flight-booking', label: 'Vé máy bay' },
                { to: '/my-bookings', label: 'Lịch sử đặt tour' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <Icon name="arrowRight" className="h-3.5 w-3.5 text-brand-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-400">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-ink-300">
              <li className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                TP. Hồ Chí Minh, Việt Nam
              </li>
              <li className="flex items-start gap-3">
                <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                2311557359@nttu.edu.vn
              </li>
              <li className="flex items-start gap-3">
                <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                0902 882 390
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-sm text-ink-400 md:flex-row md:text-left">
          <p>© 2026 Tour Lượng. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Designed with
            <span className="font-display text-base text-brand-400"> elegance</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
