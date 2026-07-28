import { useState } from 'react'
import { Icon } from '../icons'

export default function SearchBox({ onSearch }) {
  const [values, setValues] = useState({ keyword: '', location: '', date: '' })

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.(values.keyword, values.location)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-xl border border-white/20 bg-white/95 backdrop-blur-sm p-4 shadow-2xl shadow-emerald-950/20 md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      {/* Keyword Input */}
      <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition">
        <span className="text-xl"></span>
        <input
          name="keyword"
          value={values.keyword}
          onChange={updateValue}
          className="w-full bg-transparent text-sm outline-none placeholder-slate-400"
          placeholder="Tìm tour, chủ đề..."
        />
      </label>

      {/* Location Input */}
      <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition">
        <span className="text-xl"></span>
        <input
          name="location"
          value={values.location}
          onChange={updateValue}
          className="w-full bg-transparent text-sm outline-none placeholder-slate-400"
          placeholder="Điểm đến..."
        />
      </label>

      {/* Date Input */}
      <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-400 transition">
        <span className="text-xl"></span>
        <input
          name="date"
          type="date"
          value={values.date}
          onChange={updateValue}
          className="w-full bg-transparent text-sm outline-none placeholder-slate-400"
        />
      </label>

      {/* Search Button */}
      <button 
        type="submit"
        className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-emerald-500/50 transition duration-200 hover:scale-105"
      >
         Tìm tour
      </button>
    </form>
  )
}
