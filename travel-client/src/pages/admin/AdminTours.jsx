import { useEffect, useState } from 'react'

export default function AdminTours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implement tour fetching
    setLoading(false)
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-800 uppercase tracking-wider">Quản lý Tours</h1>
      </div>

      <div className="bg-white p-8 text-center border border-ink-300">
        <p className="text-sm font-bold text-cream0 uppercase tracking-widest mb-4 border-b border-ink-200 pb-2 inline-block">Tính năng đang phát triển</p>
        <p className="text-ink-600 mb-6 font-medium">
          Chức năng quản lý tours sẽ sớm được hoàn thành
        </p>
        <div className="mt-6 space-y-2">
          <ul className="text-sm text-ink-600 inline-block text-left space-y-2">
            <li className="flex gap-2"><span className="text-ink-400">[TODO]</span> Danh sách tours toàn bộ</li>
            <li className="flex gap-2"><span className="text-ink-400">[TODO]</span> Thêm tour mới</li>
            <li className="flex gap-2"><span className="text-ink-400">[TODO]</span> Chỉnh sửa tour</li>
            <li className="flex gap-2"><span className="text-ink-400">[TODO]</span> Xóa tour</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
