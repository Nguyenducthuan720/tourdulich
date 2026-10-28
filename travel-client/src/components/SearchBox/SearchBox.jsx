import { useState } from 'react'
import { Icon } from '../icons'

export default function SearchBox({ onSearch, variant = 'default' }) {
  const [values, setValues] = useState({ keyword: '', location: '', guests: '' })

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.({
      keyword: values.keyword.trim(),
      location: values.location.trim(),
      guests: values.guests,
    })
  }

  const handleReset = () => {
    setValues({ keyword: '', location: '', guests: '' })
    onSearch?.({ keyword: '', location: '', guests: '' })
  }

  const floating = variant === 'floating'

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-3 rounded-3xl border border-white/40 bg-white/95 p-3 shadow-glass backdrop-blur-xl md:grid-cols-[1.2fr_1.2fr_1fr_auto] md:gap-2 md:p-2.5 ${floating ? '-mt-16 relative z-20' : ''
        }`}
    >
      <label className="flex items-center gap-3 rounded-2xl bg-ink-50 px-5 py-3.5 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 md:py-4">
        <Icon name="search" className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="flex flex-1 flex-col">
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
        {values.keyword && (
          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, keyword: '' }))}
            className="shrink-0 text-ink-300 transition hover:text-ink-600"
            aria-label="Xóa từ khóa"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </label>

      <label className="flex items-center gap-3 rounded-2xl bg-ink-50 px-5 py-3.5 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 md:py-4">
        <Icon name="pin" className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="flex flex-1 flex-col">
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
        {values.location && (
          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, location: '' }))}
            className="shrink-0 text-ink-300 transition hover:text-ink-600"
            aria-label="Xóa điểm đến"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </label>

      <label className="flex items-center gap-3 rounded-2xl bg-ink-50 px-5 py-3.5 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 md:py-4">
        <Icon name="user" className="h-5 w-5 shrink-0 text-brand-500" />
        <span className="flex flex-1 flex-col">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-400">
            Số khách
          </span>
          <input
            name="guests"
            type="number"
            min="1"
            max="50"
            value={values.guests}
            onChange={updateValue}
            className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none placeholder:text-ink-400"
            placeholder="Bao nhiêu người?"
          />
        </span>
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="btn btn-primary flex-1 md:h-full md:px-8"
          aria-label="Tìm tour"
        >
          <Icon name="search" className="h-5 w-5" />
          <span className="md:hidden lg:inline">Tìm tour</span>
        </button>
        {(values.keyword || values.location || values.guests) && (
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline md:h-full"
            aria-label="Xóa bộ lọc"
            title="Xóa bộ lọc"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}

