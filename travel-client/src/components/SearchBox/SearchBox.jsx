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
      className="grid gap-4 rounded-3xl bg-white/95 backdrop-blur-md p-6 shadow-2xl shadow-slate-900/30 md:grid-cols-[1fr_1fr_1fr_auto]"
    >
      {/* Keyword Input */}
      <label className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 focus-within:border-amber-500 focus-within:bg-white transition">
        <span className="text-xl"></span>
        <input
          name="keyword"
          value={values.keyword}
          onChange={updateValue}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder-slate-400"
          placeholder="Tìm tour, chủ đề..."
        />
      </label>

      {/* Location Input */}
      <label className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 focus-within:border-amber-500 focus-within:bg-white transition">
        <span className="text-xl"></span>
        <input
          name="location"
          value={values.location}
          onChange={updateValue}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder-slate-400"
          placeholder="Điểm đến..."
        />
      </label>

      {/* Date Input */}
      <label className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 focus-within:border-amber-500 focus-within:bg-white transition">
        <span className="text-xl"></span>
        <input
          name="date"
          type="date"
          value={values.date}
          onChange={updateValue}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder-slate-400"
        />
      </label>

      {/* Search Button */}
      <button 
        type="submit"
        className="rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-amber-600 hover:shadow-xl transition-all duration-300"
      >
        Tìm tour
      </button>
    </form>
  )
}
