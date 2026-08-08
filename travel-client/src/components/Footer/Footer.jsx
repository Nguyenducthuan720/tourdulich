export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="mb-4 text-2xl font-bold">
              Tour Lượng
            </h2>
            <p className="mb-6 text-slate-400">
              Nền tảng quản lý và đặt tour trực tuyến hàng đầu. Tối ưu lịch trình, vận hành booking hiện đại với dịch vụ đẳng cấp.
            </p>
            <div className="flex gap-4">
              <a href="#" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-amber-500 transition">
                <span className="text-sm">f</span>
              </a>
              <a href="#" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-amber-500 transition">
                <span className="text-sm">ig</span>
              </a>
              <a href="#" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-amber-500 transition">
                <span className="text-sm">yt</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-amber-500">Dịch vụ</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-white transition cursor-pointer">Tour cao cấp trong nước</li>
              <li className="hover:text-white transition cursor-pointer">Tour quốc tế</li>
              <li className="hover:text-white transition cursor-pointer">Đặt vé máy bay</li>
              <li className="hover:text-white transition cursor-pointer">Đặt khách sạn</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-amber-500">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📧</span>
                <span>2311557359@nttu.edu.vn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📱</span>
                <span>0902882390</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>© 2026 Tour Lượng. All rights reserved. Designed with ✦ premium quality.</p>
        </div>
      </div>
    </footer>
  )
}
