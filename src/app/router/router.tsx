import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { RequireAuth } from '@/features/authentication/RequireAuth'

import { RootLayout } from './RootLayout'
import { RouteError } from './RouteError'

/* Every page is code-split; layouts stay in the main chunk so navigation feels instant. */
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const EventsPage = lazy(() => import('@/pages/public/EventsPage'))
const EventDetailsPage = lazy(() => import('@/pages/public/EventDetailsPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

const CheckoutPage = lazy(() => import('@/pages/customer/CheckoutPage'))
const MyTicketsPage = lazy(() => import('@/pages/customer/MyTicketsPage'))
const TicketDetailsPage = lazy(() => import('@/pages/customer/TicketDetailsPage'))
const ProfilePage = lazy(() => import('@/pages/customer/ProfilePage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminEventsPage = lazy(() => import('@/pages/admin/AdminEventsPage'))
const AdminEventFormPage = lazy(() => import('@/pages/admin/AdminEventFormPage'))
const AdminEventDetailsPage = lazy(() => import('@/pages/admin/AdminEventDetailsPage'))
const AdminTicketsPage = lazy(() => import('@/pages/admin/AdminTicketsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'events', element: <EventsPage /> },
          { path: 'events/:id', element: <EventDetailsPage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: (
          <RequireAuth>
            <CustomerLayout withNav={false} />
          </RequireAuth>
        ),
        children: [{ path: 'checkout/:eventId', element: <CheckoutPage /> }],
      },
      {
        element: (
          <RequireAuth>
            <CustomerLayout />
          </RequireAuth>
        ),
        children: [
          { path: 'my-tickets', element: <MyTicketsPage /> },
          { path: 'my-tickets/:id', element: <TicketDetailsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      {
        path: 'admin',
        element: (
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'events', element: <AdminEventsPage /> },
          { path: 'events/new', element: <AdminEventFormPage /> },
          { path: 'events/:id', element: <AdminEventDetailsPage /> },
          { path: 'events/:id/edit', element: <AdminEventFormPage /> },
          { path: 'tickets', element: <AdminTicketsPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
        ],
      },
      {
        element: <PublicLayout />,
        children: [{ path: '*', element: <NotFoundPage /> }],
      },
    ],
  },
])
