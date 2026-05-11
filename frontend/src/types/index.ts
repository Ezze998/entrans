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
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  category_id: number;
  category?: Category;
  user?: User; // Orang yang memposting event
  tickets?: Ticket[]; // Daftar tiket untuk mencari harga terendah
}