import { useEffect, useState } from 'react'
import { getFlights, createFlightBooking } from '../api/bookingService'
import { useAuth } from '../context/AuthContext'

function Seat({ seat, taken, selected, onSelect }) {
  return <button type="button" disabled={taken} onClick={() => onSelect(seat)} aria-label={`Ghế ${seat}${taken ? ' đã đặt' : ''}`} className={`h-9 rounded-md text-[11px] font-bold transition ${taken ? 'cursor-not-allowed bg-slate-700 text-slate-300' : selected ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-200' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:-translate-y-0.5 hover:bg-emerald-200'}`}>{seat}</button>
}

export default function FlightBookingPage() {
  const { user } = useAuth()
  const [flights, setFlights] = useState([])
  const [flightId, setFlightId] = useState('')
  const [fareType, setFareType] = useState('Economy')
  const [idCard, setIdCard] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { getFlights().then(setFlights).catch(() => setError('Không thể tải danh sách chuyến bay')) }, [])
  const selected = flights.find(f => f.FlightID === Number(flightId))
  const occupiedSeats = new Set((selected?.OccupiedSeats || '').split(',').filter(Boolean))
  const fares = [
    { id: 'Economy', name: 'Phổ thông', desc: 'Tiết kiệm, phù hợp cho chuyến đi ngắn', factor: 1, perks: ['7kg hành lý xách tay', 'Suất ăn tiêu chuẩn'] },
    { id: 'Premium Economy', name: 'Phổ thông đặc biệt', desc: 'Thoải mái hơn với không gian ghế rộng', factor: 1.35, perks: ['10kg hành lý xách tay', 'Ưu tiên chọn ghế', 'Suất ăn nâng cấp'] },
    { id: 'Business', name: 'Thương gia', desc: 'Trải nghiệm cao cấp, ưu tiên mọi hành trình', factor: 2.2, perks: ['12kg xách tay + 32kg ký gửi', 'Ưu tiên check-in', 'Phòng chờ thương gia'] }
  ]
  const selectedFare = fares.find(f => f.id === fareType) || fares[0]
  const ticketPrice = selected ? Math.round(Number(selected.Price) * selectedFare.factor) : 0

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    if (!seatNumber) { setError('Vui lòng chọn một ghế còn trống'); setLoading(false); return }
    try { setResult(await createFlightBooking({ flightId: Number(flightId), passengerName: user?.name, idCard, seatNumber, ticketType: fareType })) }
    catch (e) { setError(e.message || 'Đặt vé thất bại') }
    finally { setLoading(false) }
  }

  if (result) {
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`TOURLUONG|VE-MAY-BAY|${result.bookingId}`)}`
    return <main className="min-h-screen bg-slate-50 py-10"><div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className="mb-3 text-5xl"></div><h1 className="text-2xl font-bold text-slate-900">Thanh toán thành công</h1>
      <p className="mt-2 text-slate-600">Mã đặt vé: <b className="font-mono text-emerald-700">{result.bookingId}</b></p>
      <img className="mx-auto my-6 rounded-lg border p-2" src={qr} alt="Mã QR vé máy bay" />
      <p className="text-sm text-slate-500">Đưa mã QR này cho nhân viên khi làm thủ tục.</p>
    </div></main>
  }

  return <main className="min-h-screen bg-slate-50 py-10"><div className="mx-auto max-w-4xl px-4">
    <h1 className="text-3xl font-bold text-slate-900">Đặt vé máy bay</h1><p className="mt-2 text-slate-600">đặt vé máy bay ngay</p>
    <form onSubmit={submit} className="mt-8 grid gap-8 rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 md:grid-cols-2">
      {selected && <section className="space-y-4 md:col-span-2"><h2 className="text-xl font-bold">Chọn loại vé</h2><p className="text-sm text-slate-500">Chuyến bay {selected.AirlineName} {selected.FlightNumber} · {selected.DepartureAirport} → {selected.ArrivalAirport} · {new Date(selected.DepartureTime).toLocaleDateString('vi-VN')} · {new Date(selected.DepartureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selected.ArrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p><div className="grid gap-4 md:grid-cols-3">{fares.map(fare => <label key={fare.id} className={`cursor-pointer rounded-2xl border-2 p-5 transition hover:-translate-y-1 hover:shadow-lg ${fareType === fare.id ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-slate-200'}`}><input type="radio" name="fare" checked={fareType === fare.id} onChange={() => setFareType(fare.id)} className="sr-only" /><h3 className="font-bold">{fare.name}</h3><p className="mt-1 text-xs text-slate-500">{fare.desc}</p><p className="mt-4 text-xl font-bold text-sky-700">{Math.round(Number(selected.Price) * fare.factor).toLocaleString()} VNĐ</p><ul className="mt-3 space-y-1 text-xs text-slate-600">{fare.perks.map(perk => <li key={perk}>✓ {perk}</li>)}</ul></label>)}</div></section>}
      <section className="space-y-4 md:col-span-2"><h2 className="font-bold">Chọn chuyến bay</h2><div className="grid gap-3">
        {flights.map(f => <label key={f.FlightID} className={`cursor-pointer rounded-xl border-2 p-4 ${flightId == f.FlightID ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
          <input required type="radio" name="flight" value={f.FlightID} checked={flightId == f.FlightID} onChange={e => setFlightId(e.target.value)} className="mr-3" />
          <b>{f.AirlineName} · {f.FlightNumber}</b><span className="ml-3 text-slate-600">{f.DepartureAirport} → {f.ArrivalAirport}</span><strong className="float-right text-sky-700">{Number(f.Price).toLocaleString()} VNĐ</strong>
        </label>)}
      </div></section>
      <section className="space-y-5 md:col-span-2"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Chọn chỗ ngồi</h2><p className="text-sm text-slate-500">Sơ đồ ghế máy bay · khoang phổ thông</p></div><div className="flex gap-3 text-xs"><span><i className="mr-1 inline-block h-3 w-3 rounded bg-emerald-100" />Trống</span><span><i className="mr-1 inline-block h-3 w-3 rounded bg-slate-700" />Đã đặt</span></div></div>
        <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 px-4 pb-7 pt-5 shadow-inner sm:px-8">
          <div className="mx-auto mb-7 h-16 w-32 rounded-t-[5rem] border-2 border-b-0 border-slate-300 bg-white text-center pt-6 text-[10px] font-bold tracking-widest text-slate-400">COCKPIT</div>
          <div className="mb-3 grid grid-cols-[24px_repeat(3,1fr)_22px_repeat(3,1fr)] gap-2 text-center text-[10px] font-bold text-slate-400"><span />{['A','B','C'].map(x => <span key={x}>{x}</span>)}<span />{['D','E','F'].map(x => <span key={x}>{x}</span>)}</div>
          <div className="space-y-2">{Array.from({ length: 5 }, (_, row) => <div key={row} className="grid grid-cols-[24px_repeat(3,1fr)_22px_repeat(3,1fr)] items-center gap-2"><span className="text-center text-xs font-bold text-slate-400">{row + 1}</span>{['A','B','C'].map(letter => { const seat = `${row + 1}${letter}`; const taken = occupiedSeats.has(seat); return <Seat key={seat} seat={seat} taken={taken} selected={seatNumber === seat} onSelect={setSeatNumber} /> })}<span className="h-8 border-l-2 border-dashed border-slate-300" />{['D','E','F'].map(letter => { const seat = `${row + 1}${letter}`; const taken = occupiedSeats.has(seat); return <Seat key={seat} seat={seat} taken={taken} selected={seatNumber === seat} onSelect={setSeatNumber} /> })}</div>)}</div>
          <div className="mt-7 rounded-xl bg-white p-3 text-center text-sm text-slate-500 shadow-sm">Ghế đang chọn: <b className="text-sky-600">{seatNumber || 'Chưa chọn'}</b></div>
        </div>
      </section>
      <section className="space-y-4 md:col-span-2"><h2 className="font-bold">Thông tin hành khách</h2><p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Họ tên và email được lấy từ tài khoản: <b>{user?.name}</b> ({user?.email})</p>
        <input required value={idCard} onChange={e => setIdCard(e.target.value)} placeholder="CCCD / Hộ chiếu" className="w-full rounded-lg border border-slate-300 px-4 py-3" />
      </section>
      {error && <p className="text-red-600 md:col-span-2">{error}</p>}<button disabled={loading || !selected} className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-50 md:col-span-2">{loading ? 'Đang xử lý...' : `Thanh toán ${selected ? ticketPrice.toLocaleString() + ' VNĐ' : ''}`}</button>
    </form>
  </div></main>
}
