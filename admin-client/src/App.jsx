import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import AdminErrorBoundary from './components/AdminErrorBoundary'
import { useAuth } from './context/AuthContext'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Tours = lazy(() => import('./pages/Tours'))
const Users = lazy(() => import('./pages/Users'))
const Bookings = lazy(() => import('./pages/Bookings'))
const Reviews = lazy(() => import('./pages/Reviews'))
const AIInsights = lazy(() => import('./pages/AIInsights'))
const Categories = lazy(() => import('./pages/Categories'))
const Destinations = lazy(() => import('./pages/Destinations'))
const Flights = lazy(() => import('./pages/Flights'))
const Settings = lazy(() => import('./pages/Settings'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ProtectedRoute({ children, requiredRole = 'admin' }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="card p-8 text-center max-w-md">
          <p className="text-lg font-semibold text-ink-900 mb-2">Không có quyền truy cập</p>
          <p className="text-sm text-ink-500 mb-6">Tài khoản của bạn không có quyền admin.</p>
          <button onClick={() => (window.location.href = '/')} className="btn btn-primary">
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return children
}

function Shell() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800"></div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <AdminErrorBoundary>
        <AdminLayout />
      </AdminErrorBoundary>
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requiredRole="admin">
        <Shell />
      </ProtectedRoute>
    ),
    errorElement: <AdminErrorBoundary><NotFound /></AdminErrorBoundary>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'tours', element: <Tours /> },
      { path: 'categories', element: <Categories /> },
      { path: 'destinations', element: <Destinations /> },
      { path: 'flights', element: <Flights /> },
      { path: 'bookings', element: <Bookings /> },
      { path: 'users', element: <Users /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'ai-insights', element: <AIInsights /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
