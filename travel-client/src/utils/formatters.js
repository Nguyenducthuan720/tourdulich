export function formatCurrency(value = 0) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  if (!value) return 'Chua chon ngay'
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}
