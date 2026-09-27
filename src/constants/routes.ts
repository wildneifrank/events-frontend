export const ROUTES = {
  home: '/',
  events: '/events',
  event: (id: string) => `/events/${id}`,
  login: '/login',
  register: '/register',

  checkout: (eventId: string) => `/checkout/${eventId}`,
  myTickets: '/my-tickets',
  ticket: (id: string) => `/my-tickets/${id}`,
  profile: '/profile',

  admin: '/admin',
  adminEvents: '/admin/events',
  adminEventNew: '/admin/events/new',
  adminEvent: (id: string) => `/admin/events/${id}`,
  adminEventEdit: (id: string) => `/admin/events/${id}/edit`,
  adminTickets: '/admin/tickets',
  adminOrders: '/admin/orders',
} as const
