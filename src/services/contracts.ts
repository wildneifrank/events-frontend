import type {
  AuthSession,
  DashboardStats,
  Event,
  EventInput,
  EventQuery,
  LoginPayload,
  Order,
  OrderQuery,
  Paginated,
  Purchase,
  PurchaseResult,
  RegisterPayload,
  Ticket,
  TicketScope,
  TicketStatus,
  User,
} from '@/types'

export interface EventsService {
  getEvents(query?: EventQuery): Promise<Paginated<Event>>
  getEventById(id: string): Promise<Event>
  getEventCities(): Promise<string[]>
  createEvent(input: EventInput): Promise<Event>
  updateEvent(id: string, input: EventInput): Promise<Event>
  deleteEvent(id: string): Promise<void>
}

export interface AdminTicketQuery {
  search?: string
  status?: TicketStatus | 'all'
  eventId?: string
  page?: number
  pageSize?: number
}

export interface TicketsService {
  getTickets(scope?: TicketScope): Promise<Ticket[]>
  getTicketById(id: string): Promise<Ticket>
  getAllTickets(query?: AdminTicketQuery): Promise<Paginated<Ticket>>
}

export interface OrdersService {
  getOrders(query?: OrderQuery): Promise<Paginated<Order>>
  getOrderById(id: string): Promise<Order>
  createPurchase(purchase: Purchase): Promise<PurchaseResult>
}

export interface DashboardService {
  getDashboardStats(): Promise<DashboardStats>
}

export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>
  register(payload: RegisterPayload): Promise<AuthSession>
  getCurrentUser(): Promise<User>
  updateProfile(changes: Partial<Pick<User, 'name' | 'phone' | 'city'>>): Promise<User>
  logout(): Promise<void>
}
