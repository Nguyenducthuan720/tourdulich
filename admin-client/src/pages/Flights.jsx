import { useEffect, useState } from 'react'
import { getFlights, createFlight, updateFlight, deleteFlight } from '../api/adminService'
import { Icon } from '../components/icons'

const emptyForm = {
  airline: '',
  flightNumber: '',
  departure: '',
  arrival: '',
  departureTime: '',
  arrivalTime: '',
  price: '',
  seats: '',
  status: 1,
}

export default function Flights() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchFlights = async () => {
    try {
      setLoading(true)
      const data = await getFlights()
      setFlights(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch flights error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlights()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (flight) => {
    setEditing(flight)
    setForm({
      airline: flight.AirlineName || '',
      flightNumber: flight.FlightNumber || '',
      departure: flight.DepartureAirport || '',
      arrival: flight.ArrivalAirport || '',
      departureTime: flight.DepartureTime ? flight.DepartureTime.slice(0, 16) : '',
      arrivalTime: flight.ArrivalTime ? flight.ArrivalTime.slice(0, 16) : '',
      price: flight.Price ?? '',
      seats: flight.AvailableSeats ?? '',
      status: flight.Status ?? 1,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.airline || !form.flightNumber || !form.departure || !form.arrival || !form.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    try {
      setSaving(true)
      const payload = {
        airline: form.airline,
        flightNumber: form.flightNumber,
        departure: form.departure,
        arrival: form.arrival,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        price: Number(form.price),
        seats: Number(form.seats) || 0,
        status: Number(form.status),
      }
      if (editing) {
        await updateFlight(editing.FlightID, payload)
      } else {
        await createFlight(payload)
      }
      setModalOpen(false)
      fetchFlights()
    } catch (error) {
      alert(error.message || 'Lỗi lưu chuyến bay')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (flight) => {
    if (!confirm(`Xóa chuyến bay "${flight.FlightNumber}"?`)) return
    try {
      await deleteFlight(flight.FlightID)
      fetchFlights()
    } catch (error) {
      alert(error.message || 'Lỗi xóa chuyến bay')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Chuyến bay</h1>
          <p className="mt-1 text-sm text-ink-500">Thêm, chỉnh sửa và xóa chuyến bay</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Thêm chuyến bay
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải chuyến bay...</p>
          </div>
        </div>
      ) : flights.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-400">Chưa có chuyến bay nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Hãng bay</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Mã chuyến</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Điểm đi</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Điểm đến</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-ink-500">Giá</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-ink-500">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr key={flight.FlightID} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-ink-500">#{flight.FlightID}</td>
                    <td className="px-6 py-4 text-sm font-medium text-ink-900">{flight.AirlineName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">{flight.FlightNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">{flight.DepartureAirport || '—'}</td>
                    <td className="px-6 py-4 text-sm text-ink-600">{flight.ArrivalAirport || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="amount font-semibold text-ink-800">
                        {flight.Price?.toLocaleString?.()}đ
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        flight.Status === 1
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-ink-100 text-ink-500 border border-ink-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${flight.Status === 1 ? 'bg-emerald-500' : 'bg-ink-400'}`} />
                        {flight.Status === 1 ? 'Hiện' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(flight)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(flight)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-ink-600 hover:bg-ink-700 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-ink-200 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">{editing ? 'Chỉnh sửa' : 'Thêm mới'}</p>
                <h2 className="font-display text-xl font-semibold text-ink-900">{editing ? 'Cập nhật chuyến bay' : 'Tạo chuyến bay mới'}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-ink-400 hover:text-ink-800 transition">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Hãng bay</label>
                  <input className="input-field" value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} placeholder="Vietnam Airlines" />
                </div>
                <div>
                  <label className="field-label">Mã chuyến</label>
                  <input className="input-field" value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="VN123" />
                </div>
                <div>
                  <label className="field-label">Điểm đi</label>
                  <input className="input-field" value={form.departure} onChange={(e) => setForm({ ...form, departure: e.target.value })} placeholder="HAN" />
                </div>
                <div>
                  <label className="field-label">Điểm đến</label>
                  <input className="input-field" value={form.arrival} onChange={(e) => setForm({ ...form, arrival: e.target.value })} placeholder="SGN" />
                </div>
                <div>
                  <label className="field-label">Giá (đ)</label>
                  <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1500000" />
                </div>
                <div>
                  <label className="field-label">Số chỗ</label>
                  <input type="number" className="input-field" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} placeholder="180" />
                </div>
                <div>
                  <label className="field-label">Thời gian đi</label>
                  <input type="datetime-local" className="input-field" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Thời gian đến</label>
                  <input type="datetime-local" className="input-field" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Trạng thái</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value={1}>Hiện</option>
                    <option value={0}>Ẩn</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-ink-200 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn-outline">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
