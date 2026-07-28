export default function Footer() {
  return (
    <footer className="border-t border-emerald-950/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-lg font-bold text-emerald-950">tour luong</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Nen tang quan ly va dat tour truc tuyen, toi uu lich trinh va van hanh booking hien dai.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Dich vu</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Tour cao cap trong nuoc</li>
            <li>Dat lich thong minh</li>
            <li>Quan ly khach hang</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Lien he</h3>
          <p className="mt-3 text-sm text-slate-600">2311557359@nttu.edu.vn</p>
          <p className="mt-1 text-sm text-slate-600">0902882390</p>
        </div>
      </div>
    </footer>
  )
}
