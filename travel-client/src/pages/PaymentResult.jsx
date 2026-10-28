import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../api/client'

export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const status = searchParams.get('status') || 'unknown'
  const txnRef = searchParams.get('txnRef') || ''
  const method = searchParams.get('method') || 'vnpay'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!txnRef) return

      try {
        await apiClient.get(`/payments/status/${txnRef}`)
      } catch (err) {
        console.error('Failed to sync payment status:', err)
      }
    }

    updatePaymentStatus()
  }, [txnRef])

  const isSuccess = status === 'Success' || status === 'success'
  const isPending = status === 'Pending' || status === 'pending'

  async function copyReference() {
    if (!txnRef || !navigator.clipboard) return
    await navigator.clipboard.writeText(txnRef)
    setCopied(true)
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className={`vivu-payment-result card p-8 text-center ${isSuccess ? 'is-success' : ''}`}>
        {isSuccess && (
          <>
            <div className="vivu-payment-check mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12.5 10 17l9-10" /></svg>
            </div>
            <p className="vivu-overline">XÁC THỰC & GIỮ CHỖ THÀNH CÔNG</p>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-sm text-ink-500">Vé điện tử và hóa đơn đã sẵn sàng trong tài khoản của bạn.</p>
            <div className="vivu-ticket-summary">
              <div className="vivu-ticket-brand"><span>V</span><div><strong>VIVU TRAVEL</strong><small>BIÊN NHẬN THANH TOÁN</small></div><span className="vivu-ticket-status">ĐÃ THANH TOÁN</span></div>
              <div className="vivu-ticket-reference"><small>MÃ GIAO DỊCH</small><strong>{txnRef || 'Đã xác nhận'}</strong><span>{method === 'vnpay' ? 'VNPay' : method === 'momo' ? 'MoMo' : 'Chuyển khoản'}</span></div>
              <div className="vivu-ticket-perforation"><span /><i /><span /></div>
              <p>Thông tin đặt chỗ và lịch trình sẽ được lưu trong mục <strong>Đơn hàng của tôi</strong>.</p>
            </div>
            <div className="vivu-payment-actions"><button type="button" className="btn btn-outline" onClick={copyReference}>{copied ? 'Đã sao chép mã' : 'Sao chép mã giao dịch'}</button><button type="button" className="btn btn-outline" onClick={() => window.print()}>In biên nhận</button></div>
            <div className="vivu-trip-checklist"><strong>Tiếp theo</strong><span>✓  Kiểm tra trạng thái đặt chỗ trong đơn hàng</span><span>✓  Xem lại ngày khởi hành và thông tin hành khách</span><span>✓  Cần hỗ trợ? Gọi hotline 1900 6868</span></div>
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary vivu-order-button">Xem đơn đặt hàng</button>
          </>
        )}

        {isPending && (
          <>
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Đang chờ thanh toán</h1>
            <p className="text-sm text-ink-500 mb-1">Mã giao dịch: <span className="font-semibold text-ink-800">{txnRef}</span></p>
            <p className="text-sm text-ink-500 mb-6">Vui lòng hoàn tất thanh toán để được xác nhận đơn hàng.</p>
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">
              Về lịch sử đặt hàng
            </button>
          </>
        )}

        {!isSuccess && !isPending && (
          <>
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-sm text-ink-500 mb-1">Mã giao dịch: <span className="font-semibold text-ink-800">{txnRef || 'N/A'}</span></p>
            <p className="text-sm text-ink-500 mb-6">Giao dịch không thành công hoặc đã bị hủy.</p>
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">
              Về lịch sử đặt hàng
            </button>
          </>
        )}
      </div>
    </div>
  )
}
