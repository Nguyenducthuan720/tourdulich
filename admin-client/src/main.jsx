import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import AdminErrorBoundary from './components/AdminErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AdminErrorBoundary>
        <App />
      </AdminErrorBoundary>
    </AuthProvider>
  </StrictMode>,
)

window.addEventListener('error', (event) => {
  console.error('[admin-client][window.error]', event.message, event.filename, event.lineno, event.colno, event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[admin-client][unhandledrejection]', event.reason)
})
