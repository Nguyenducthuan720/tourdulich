import { Component } from 'react'

export default class AdminErrorBoundary extends Component {
  state = { error: null, info: null }

  componentDidCatch(error, info) {
    this.setState({ error, info })
    console.error('[admin-client][boundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="card p-8 text-center max-w-lg">
            <p className="text-lg font-semibold text-ink-900 mb-2">Giao diện admin gặp lỗi</p>
            <p className="text-sm text-ink-500 mb-4">Đã có lỗi xảy ra khi tải trang quản trị.</p>
            <pre className="max-h-64 overflow-auto rounded-xl bg-ink-900 p-4 text-left text-xs text-red-200">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.info?.componentStack}
            </pre>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Tải lại
              </button>
              <button onClick={() => (window.location.href = '/')} className="btn btn-outline">
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
