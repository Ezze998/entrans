export type UserRole = 'admin' | 'organizer' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: number;
  category_name: string;
  slug: string;
}

export interface Ticket {
  id: number;
  event_id: number;
  ticket_type: string; 
  price: number;
  stock: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  category_id: number;
  category?: Category;
  user?: User; 
  tickets?: Ticket[]; 
}

export type OrderStatus = 'pending' | 'settlement' | 'expire' | 'cancel' | 'capture';

export interface Order {
  id: number;
  user_id: number;
  event_id: number;
  order_number: string;
  total_amount: string | number;
  status: OrderStatus;
  payment_url: string;
  created_at: string;
  event?: {
    id: number;
    title: string;
    image: string;
    location: string;
    event_date: string;
  };
  order_details?: any[];
}