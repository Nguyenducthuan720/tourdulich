import { useState } from 'react'
import { Icon } from '../icons'

export default function SearchBox({ onSearch, variant = 'default' }) {
  const [values, setValues] = useState({ keyword: '', location: '', date: '' })

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.(values.keyword, values.location)
  }

  const floating = variant === 'floating'

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-3 rounded-3xl border border-white/40 bg-white/95 p-3 shadow-glass backdrop-blur-xl md:grid-cols-[1.2fr_1.2fr_1fr_auto] md:gap-2 md:p-2.5 ${
        floating ? '-mt-16 relative z-20' : ''
      }`}
    >
      <label className="flex items-center gap-3 rounded-2xl bg-ink-50 px-5 py-3.5 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 md:py-4">
        <Icon name="search" className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="flex flex-col">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
            Từ khóa
          </span>
          <input
            name="keyword"
            value={values.keyword}
            onChange={updateValue}
            className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none placeholder:text-ink-400"
            placeholder="Tên tour, chủ đề..."
          />
        </span>
      </label>

      <label className="flex items-center gap-3 rounded-2xl bg-ink-50 px-5 py-3.5 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 md:py-4">
        <Icon name="pin" className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="flex flex-col">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
            Điểm đến
          </span>
          <input
            name="location"
            value={values.location}
            onChange={updateValue}
            className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none placeholder:text-ink-400"
            placeholder="Đà Nẵng, Phú Quốc..."
          />
        </span>
      </label>

      <label className="flex items-center gap-3 rounded-2xl bg-ink-50 px-5 py-3.5 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 md:py-4">
        <Icon name="calendar" className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="flex flex-col">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
            Ngày đi
          </span>
          <input
            name="date"
            type="date"
            value={values.date}
            onChange={updateValue}
            className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none"
          />
        </span>
      </label>

      <button
        type="submit"
        className="btn btn-primary md:h-full md:px-8"
        aria-label="Tìm tour"
      >
        <Icon name="search" className="h-5 w-5" />
        <span className="md:hidden lg:inline">Tìm tour</span>
      </button>
    </form>
  )
}
