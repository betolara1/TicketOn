export type UserRole = 'ORGANIZER' | 'CUSTOMER' | 'STAFF';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'FINISHED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED';
export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED';

// USUARIO
export interface User{
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

// AUTENTICAÇÃO
export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// TICKETMASTER
export interface TicketmasterEventItem {
    external_id: string;
    title: string;
    category?: string;
    banner_url?: string;
    suggested_venue?: string;
    suggested_city?: string;
}

// EVENTO CRIADO PELO ORGANIZADOR
export interface Event {
  id: number;
  organizer_id: number;
  title: string;
  description?: string;
  banner_url?: string;
  category?: string;
  venue_name: string;
  venue_city: string;
  event_date: string;
  total_capacity: number;
  available_capacity: number;
  ticket_price: number;
  external_tm_id?: string;
  status: EventStatus;
  created_at: string;
  organizer?: User;
}

// INGRESSO
export interface Ticket {
  id: number;
  order_id: number;
  event_id: number;
  ticket_code: string;
  share_link: string; 
  status: TicketStatus;
  validated_at?: string;
  created_at: string;
  event?: Event;
}

// PEDIDO DE COMPRA
export interface Order {
  id: number;
  customer_id: number;
  event_id: number;
  quantity: number;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  tickets: Ticket[];
  event?: Event;
}