import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'

// Pages
import HomePage from '../pages/HomePage'
import TourDetailPage from '../pages/VivuTourDetailPage'
import BookingPage from '../pages/BookingPage'
import FlightBookingPage from '../pages/FlightBookingPage'
import MyBookingsPage from '../pages/MyBookingsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProfilePage from '../pages/ProfilePage'
import AboutPage from '../pages/AboutPage'
import PaymentPage from '../pages/PaymentPage'
import PaymentResult from '../pages/PaymentResult'
import NotFoundPage from '../pages/NotFoundPage'
import { CarsRoute, CommunityRoute, FlightsRoute, HotelsRoute, PlannerRoute } from './VivuLazyPages'

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
      { path: 'flights', element: <FlightsRoute /> },
      { path: 'hotels', element: <HotelsRoute /> },
      { path: 'cars', element: <CarsRoute /> },
      { path: 'planner', element: <PlannerRoute /> },
      { path: 'community', element: <CommunityRoute /> },
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
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'payment',
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/result',
        element: <PaymentResult />,
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
    path: '*',
    element: <NotFoundPage />,
  },
])
