import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../api/adminService'

const StatCard = ({ label, value }) => (
  <div className="bg-white p-6 border border-slate-300">
    <div className="flex flex-col">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-3xl font-bold mt-2 text-slate-800">{value?.toLocaleString?.() || value}</p>
    </div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-slate-200 border-t-slate-800"></div>
          <p className="text-slate-600 font-medium uppercase tracking-widest text-sm">Đang tải thống kê...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          label="Khách hàng"
          value={stats?.totalCustomers || 0}
        />
        <StatCard
          label="Tours"
          value={stats?.totalTours || 0}
        />
        <StatCard
          label="Đặt hàng"
          value={stats?.totalBookings || 0}
        />
        <StatCard
          label="Doanh thu"
          value={`${(stats?.totalRevenue || 0)?.toLocaleString?.()}đ`}
        />
        <StatCard
          label="Đánh giá"
          value={stats?.totalReviews || 0}
        />
      </div>

      {/* Welcome Section */}
      <div className="bg-slate-50 border border-slate-300 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider mb-2">Chào mừng đến Admin Dashboard</h2>
          <p className="text-slate-600 mb-6 font-medium">Hệ thống quản lý Travel Booking</p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8 text-left">
            <div className="bg-white border border-slate-300 p-4">
              <p className="text-sm font-bold text-slate-800 uppercase">Xem Thống Kê</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">Tổng quan hệ thống với các chỉ số quan trọng về doanh thu và hoạt động.</p>
            </div>
            <div className="bg-white border border-slate-300 p-4">
              <p className="text-sm font-bold text-slate-800 uppercase">Quản lý User</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">Giám sát tài khoản khách hàng, phân quyền và quản lý nhân sự.</p>
            </div>
            <div className="bg-white border border-slate-300 p-4">
              <p className="text-sm font-bold text-slate-800 uppercase">Quản lý Đánh giá</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">Kiểm duyệt các phản hồi từ khách hàng, đảm bảo chất lượng dịch vụ.</p>
            </div>
            <div className="bg-white border border-slate-300 p-4">
              <p className="text-sm font-bold text-slate-800 uppercase">Quản lý Đặt hàng</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">Theo dõi trạng thái thanh toán, xác nhận đơn hàng và xử lý yêu cầu.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 border border-slate-300">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Các chỉ số chính</h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-slate-600 text-sm font-medium">Khách hàng hoạt động</span>
              <span className="font-bold text-slate-900">{stats?.totalCustomers || 0}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600 text-sm font-medium">Tổng tours</span>
              <span className="font-bold text-slate-900">{stats?.totalTours || 0}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600 text-sm font-medium">Đơn hàng hoàn thành</span>
              <span className="font-bold text-slate-900">{stats?.totalBookings || 0}</span>
            </li>
            <li className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-800 font-bold uppercase text-xs">Doanh thu tháng này</span>
              <span className="font-bold text-slate-900">{(stats?.totalRevenue || 0)?.toLocaleString?.()}đ</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 border border-slate-300">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Thông báo hệ thống</h3>
          <ul className="space-y-3 text-sm">
            <li className="p-3 bg-slate-50 border border-slate-200 text-slate-700 font-medium flex gap-2">
              <span className="text-slate-400">[INFO]</span> Hệ thống đang chạy bình thường
            </li>
            <li className="p-3 bg-slate-50 border border-slate-200 text-slate-700 font-medium flex gap-2">
              <span className="text-slate-400">[OK]</span> Database kết nối thành công
            </li>
            <li className="p-3 bg-slate-100 border border-slate-300 text-slate-800 font-bold flex gap-2">
              <span className="text-slate-500">[ALERT]</span> Có {stats?.totalReviews || 0} đánh giá mới
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
