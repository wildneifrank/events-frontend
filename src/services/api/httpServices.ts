import type {
  AuthSession,
  DashboardStats,
  Event,
  Order,
  Paginated,
  PurchaseResult,
  Ticket,
  User,
} from '@/types'

import type {
  AuthService,
  DashboardService,
  EventsService,
  OrdersService,
  TicketsService,
} from '../contracts'

import { apiClient } from './apiClient'

/**
 * HTTP implementations of the service contracts, targeting the Express API.
 * Enabled with VITE_USE_MOCKS=false. Endpoint paths are the expected REST shape;
 * adjust them here — and only here — if the backend diverges.
 */
export const eventsHttpService: EventsService = {
  getEvents: (query = {}) => apiClient.get<Paginated<Event>>('/events', { query: { ...query } }),
  getEventById: (id) => apiClient.get<Event>(`/events/${id}`),
  getEventCities: () => apiClient.get<string[]>('/events/cities'),
  createEvent: (input) => apiClient.post<Event>('/events', input),
  updateEvent: (id, input) => apiClient.put<Event>(`/events/${id}`, input),
  deleteEvent: (id) => apiClient.delete(`/events/${id}`),
}

export const ticketsHttpService: TicketsService = {
  getTickets: (scope) => apiClient.get<Ticket[]>('/me/tickets', { query: { scope } }),
  getTicketById: (id) => apiClient.get<Ticket>(`/me/tickets/${id}`),
  getAllTickets: (query = {}) =>
    apiClient.get<Paginated<Ticket>>('/tickets', { query: { ...query } }),
}

export const ordersHttpService: OrdersService = {
  getOrders: (query = {}) => apiClient.get<Paginated<Order>>('/orders', { query: { ...query } }),
  getOrderById: (id) => apiClient.get<Order>(`/orders/${id}`),
  createPurchase: (purchase) => apiClient.post<PurchaseResult>('/orders', purchase),
}

export const dashboardHttpService: DashboardService = {
  getDashboardStats: () => apiClient.get<DashboardStats>('/admin/dashboard'),
}

export const authHttpService: AuthService = {
  login: (payload) => apiClient.post<AuthSession>('/auth/login', payload),
  register: (payload) => apiClient.post<AuthSession>('/auth/register', payload),
  getCurrentUser: () => apiClient.get<User>('/auth/me'),
  updateProfile: (changes) => apiClient.patch<User>('/auth/me', changes),
  logout: () => apiClient.post<void>('/auth/logout'),
}
