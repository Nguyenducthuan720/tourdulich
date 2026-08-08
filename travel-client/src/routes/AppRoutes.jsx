import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import { useAuth } from '../context/AuthContext'

// Pages
import HomePage from '../pages/HomePage'
import TourDetailPage from '../pages/TourDetailPage'
import BookingPage from '../pages/BookingPage'
import FlightBookingPage from '../pages/FlightBookingPage'
import MyBookingsPage from '../pages/MyBookingsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import AboutPage from '../pages/AboutPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminTours from '../pages/admin/AdminTours'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminBookings from '../pages/admin/AdminBookings'
import AdminReviews from '../pages/admin/AdminReviews'
import NotFoundPage from '../pages/NotFoundPage'

// Protected Route Component
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'tours/:id',
        element: <TourDetailPage />,
      },
      {
        path: 'booking/:id',
        element: (
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'flight-booking',
        element: <ProtectedRoute><FlightBookingPage /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'tours',
        element: <AdminTours />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'bookings',
        element: <AdminBookings />,
      },
      {
        path: 'reviews',
        element: <AdminReviews />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
