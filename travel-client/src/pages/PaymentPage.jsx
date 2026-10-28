import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../api/client'
import './PaymentPage.css'

const paymentSteps = ['Chọn dịch vụ', 'Thông tin khách', 'Thanh toán', 'Vé điện tử']

function PaymentProgress() {
  return (
    <nav className="payment-progress" aria-label="Tiến trình đặt chỗ">
      {paymentSteps.map((step, index) => (
        <div className={`payment-progress-step ${index < 2 ? 'is-complete' : index === 2 ? 'is-current' : ''}`} key={step}>
          <span>{index < 2 ? '✓' : index + 1}</span>
          <div><small>Bước {index + 1}</small><strong>{step}</strong></div>
        </div>
      ))}
    </nav>
  )
}

function PaymentShell({ children }) {
  return (
    <main className="payment-page">
      <div className="payment-security-note"><span aria-hidden="true">✓</span> Thanh toán bảo mật · Hỗ trợ 24/7</div>
      <PaymentProgress />
      {children}
    </main>
  )
}

function PaymentDetail({ label, value, emphasized = false }) {
  return <div className={`payment-detail ${emphasized ? 'is-emphasized' : ''}`}><span>{label}</span><strong>{value}</strong></div>
}

function PaymentStatusIcon({ type }) {
  return <span className={`payment-status-icon payment-status-icon-${type}`} aria-hidden="true">{type === 'loading' ? <i /> : type === 'error' ? '!' : '✓'}</span>
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookingId = searchParams.get('bookingId')
  const amount = searchParams.get('amount')
  const method = searchParams.get('method') || 'vnpay'
  const hasPaymentDetails = Boolean(bookingId && amount)
  const [processing, setProcessing] = useState(hasPaymentDetails)
  const [error, setError] = useState(hasPaymentDetails ? null : 'Thiếu thông tin thanh toán')
  const [demo, setDemo] = useState(null)
  const [bank, setBank] = useState(null)
  const [simulating, setSimulating] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || !bookingId || !amount) return
    startedRef.current = true

    async function initiatePayment() {
      try {
        const response = await apiClient.post('/payments/create', {
          bookingId: Number(bookingId),
          amount: Number(amount),
          method,
          orderInfo: `Thanh toan don hang ${bookingId}`,
        })
        const data = response.data

        if (data.success && data.method === 'bank_transfer') {
          setBank({
            txnRef: data.txnRef,
            qrUrl: data.bank?.qrUrl || null,
            accountNo: data.bank?.accountNo || null,
            accountName: data.bank?.accountName || null,
            bankId: data.bank?.bankId || null,
            message: data.message,
          })
          setProcessing(false)
          return
        }

        if (data.success && data.configured === false) {
          setDemo({
            txnRef: data.txnRef,
            method: data.method,
            message: data.message,
            qrUrl: data.demo?.qrUrl || null,
            payload: data.demo?.payload || null,
          })
          setProcessing(false)
          return
        }

        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl
          return
        }

        setError(data.message || 'Không thể tạo yêu cầu thanh toán')
        setProcessing(false)
      } catch (requestError) {
        setError(requestError.message || 'Lỗi kết nối thanh toán')
        setProcessing(false)
      }
    }

    initiatePayment()
  }, [bookingId, amount, method])

  async function handleSimulate(result) {
    if (!demo?.txnRef || simulating) return
    try {
      setSimulating(true)
      await apiClient.post(`/payments/simulate/${demo.txnRef}`, { result })
      const status = result === 'success' ? 'Success' : 'Failed'
      navigate(`/payment/result?txnRef=${demo.txnRef}&status=${status}&method=${demo.method}`)
    } catch (requestError) {
      setError(requestError.message || 'Lỗi mô phỏng thanh toán')
      setSimulating(false)
    }
  }

  if (processing) {
    return <PaymentShell><section className="payment-state-card payment-loading-card"><PaymentStatusIcon type="loading" /><h1>Đang kết nối cổng thanh toán</h1><p>Đang chuẩn bị thông tin giao dịch an toàn. Vui lòng giữ trang này mở.</p></section></PaymentShell>
  }

  if (bank) {
    return (
      <PaymentShell>
        <section className="payment-content">
          <header className="payment-page-heading"><div><span className="payment-eyebrow">HOÀN TẤT GIAO DỊCH</span><h1>Chuyển khoản ngân hàng</h1><p>Quét mã QR hoặc dùng thông tin bên cạnh để thanh toán.</p></div><span className="payment-method-badge">VietQR</span></header>
          <div className="payment-main-grid">
            <section className="payment-panel payment-qr-panel"><div className="payment-panel-heading"><div><span className="payment-step-number">1</span><div><h2>Quét mã thanh toán</h2><p>Dùng ứng dụng ngân hàng để quét QR</p></div></div></div>
              {bank.qrUrl ? <img className="payment-qr-image" src={bank.qrUrl} alt="Mã QR chuyển khoản" /> : <div className="payment-qr-unavailable"><span aria-hidden="true">▦</span><strong>Chưa có mã QR</strong><p>Vui lòng dùng thông tin tài khoản bên cạnh hoặc liên hệ hỗ trợ.</p></div>}
              <p className="payment-qr-caption">Mã QR được tạo riêng cho giao dịch này.</p>
            </section>
            <section className="payment-panel payment-info-panel"><div className="payment-panel-heading"><div><span className="payment-step-number">2</span><div><h2>Thông tin chuyển khoản</h2><p>Nhập chính xác nội dung giao dịch</p></div></div></div>
              <div className="payment-amount-block"><span>Số tiền cần thanh toán</span><strong>{Number(amount).toLocaleString('vi-VN')} ₫</strong></div>
              <div className="payment-details-list">
                {bank.bankId && <PaymentDetail label="Ngân hàng" value={bank.bankId} />}
                {bank.accountNo && <PaymentDetail label="Số tài khoản" value={bank.accountNo} emphasized />}
                {bank.accountName && <PaymentDetail label="Chủ tài khoản" value={bank.accountName} />}
                <PaymentDetail label="Nội dung chuyển khoản" value={`Thanh toan ${bank.txnRef}`} emphasized />
                <PaymentDetail label="Mã giao dịch" value={bank.txnRef} />
              </div>
              <p className="payment-inline-note">{bank.message}</p>
              <button type="button" onClick={() => navigate('/my-bookings')} className="payment-primary-button">Tôi đã chuyển khoản <span aria-hidden="true">→</span></button>
              <button type="button" onClick={() => navigate('/my-bookings')} className="payment-secondary-button">Thanh toán sau</button>
            </section>
          </div>
          <p className="payment-help-line">Cần hỗ trợ? Gọi <a href="tel:19006868">1900 6868</a>, chúng tôi luôn sẵn sàng giúp bạn.</p>
        </section>
      </PaymentShell>
    )
  }

  if (demo) {
    const isMomo = demo.method === 'momo'
    const providerName = isMomo ? 'MoMo' : 'VNPay'
    return (
      <PaymentShell>
        <section className="payment-content">
          <header className="payment-page-heading"><div><span className="payment-eyebrow">CỔNG THANH TOÁN</span><h1>Thanh toán với {providerName}</h1><p>Đây là giao dịch demo. Không phát sinh thanh toán thật.</p></div><span className="payment-demo-badge">CHẾ ĐỘ DEMO</span></header>
          <div className="payment-main-grid">
            <section className="payment-panel payment-qr-panel"><div className="payment-panel-heading"><div><span className="payment-step-number">1</span><div><h2>Quét mã QR</h2><p>Mở ứng dụng {providerName} để tiếp tục</p></div></div></div>
              {demo.qrUrl ? <img src={demo.qrUrl} alt={`Mã QR ${providerName}`} className="payment-qr-image" /> : <div className="payment-qr-unavailable"><span aria-hidden="true">▦</span><strong>Không tạo được mã QR</strong><p>Quay lại đơn hàng hoặc thử lại sau.</p></div>}
              <p className="payment-qr-caption">Giao dịch sẽ được cập nhật sau khi xác nhận.</p>
            </section>
            <section className="payment-panel payment-info-panel"><div className="payment-panel-heading"><div><span className="payment-step-number">2</span><div><h2>Chi tiết giao dịch</h2><p>Kiểm tra số tiền và mã giao dịch</p></div></div></div>
              <div className="payment-amount-block"><span>Tổng thanh toán</span><strong>{Number(amount).toLocaleString('vi-VN')} ₫</strong></div>
              <div className="payment-details-list"><PaymentDetail label="Nhà cung cấp" value={providerName} /><PaymentDetail label="Mã giao dịch" value={demo.txnRef} emphasized /><PaymentDetail label="Trạng thái" value="Đang chờ thanh toán" /></div>
              <p className="payment-inline-note payment-demo-note">{demo.message}</p>
              <button type="button" onClick={() => handleSimulate('success')} disabled={simulating} className="payment-primary-button">{simulating ? 'Đang cập nhật…' : 'Xác nhận đã thanh toán'} <span aria-hidden="true">→</span></button>
              <div className="payment-action-links"><button type="button" onClick={() => handleSimulate('failed')} disabled={simulating}>Hủy giao dịch</button><button type="button" onClick={() => navigate('/my-bookings')} disabled={simulating}>Thanh toán sau</button></div>
            </section>
          </div>
        </section>
      </PaymentShell>
    )
  }

  return (
    <PaymentShell>
      <section className="payment-state-card payment-error-card"><PaymentStatusIcon type="error" /><span className="payment-eyebrow">CHƯA THỂ TIẾP TỤC</span><h1>Lỗi thanh toán</h1><p>{error || 'Không thể tạo yêu cầu thanh toán.'}</p><button type="button" onClick={() => navigate('/my-bookings')} className="payment-primary-button">Về đơn hàng của tôi <span aria-hidden="true">→</span></button></section>
    </PaymentShell>
  )
}