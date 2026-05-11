# Entrans — Frontend Development Roadmap

> **Stack:** React.js (Vite) · TypeScript · React Router v6 · TanStack Query · Zustand · Axios · Tailwind CSS + DaisyUI  
> **Backend:** Sudah tersedia, tinggal wiring ke frontend  
> **Payment:** Midtrans via `payment_url` (redirect, bukan Snap popup)

---

## Gambaran Fase

| Fase | Fokus | Estimasi |
|------|-------|----------|
| 0 | Project setup & fondasi | 3–5 hari |
| 1 | Autentikasi & manajemen user | ~1 minggu |
| 2 | Browse & detail event (public) | ~1–1.5 minggu |
| 3 | Checkout & pembayaran Midtrans | ~1.5–2 minggu |
| 4 | Dashboard organizer | ~1.5 minggu |
| 5 | Polish, testing & deployment | ~1 minggu |

**Total estimasi MVP:** 6–8 minggu (dikerjakan konsisten)

---

## Fase 0 — Project Setup & Fondasi

> Kerjakan ini dulu sebelum nulis UI apapun. Fondasi yang buruk akan menyulitkan semua fase berikutnya.

### Inisiasi Project

```bash
# Buat project Vite dengan template React + TypeScript
npm create vite@latest entrans -- --template react-ts
cd entrans

# Install semua dependencies sekaligus
npm install axios react-router-dom @tanstack/react-query zustand react-hook-form zod @hookform/resolvers dayjs

# Dev dependencies
npm install -D tailwindcss postcss autoprefixer daisyui
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test

# Init Tailwind
npx tailwindcss init -p
```

### Struktur Folder

```
src/
├── assets/
├── components/         # Komponen reusable (Button, Modal, Badge, dll.)
│   └── ui/
├── hooks/              # Custom hooks (useAuth, useOrder, dll.)
├── layouts/            # Layout wrappers (PublicLayout, OrganizerLayout)
├── pages/              # Halaman per route
├── services/           # API calls per domain
│   ├── api.ts          # Axios instance & interceptors
│   ├── auth.ts
│   ├── events.ts
│   ├── orders.ts
│   ├── tickets.ts
│   └── categories.ts
├── store/              # Zustand stores
│   └── authStore.ts
├── types/              # Semua TypeScript type & interface
│   └── index.ts
├── utils/              # Helper functions
│   └── format.ts
├── App.tsx
└── main.tsx
```

> **Tips TypeScript untuk pemula:** Semua type dan interface domain taruh di `src/types/index.ts` dulu. Jangan terlalu awal memisah per file — baru pisah jika file sudah panjang.

### Definisi Types (Sesuai Database)

Ini adalah pondasi TypeScript untuk seluruh project. Buat di `src/types/index.ts`:

```ts
// src/types/index.ts

// --- Domain types (mirror dari struktur database) ---

export type UserRole = 'buyer' | 'organizer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: number;
  category_name: string;
}

export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface Event {
  id: number;
  category_id: number;
  user_id: number;
  title: string;
  description: string;
  location: string;
  event_date: string; // ISO datetime string dari backend
  status: EventStatus;
  category?: Category; // relasi, mungkin di-include backend
}

export interface Ticket {
  id: number;
  event_id: number;
  ticket_type: string;
  price: number;
  stock: number;
}

export type OrderStatus = 'pending' | 'settlement' | 'expire' | 'cancel';

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_url: string;
  created_at: string;
  details?: OrderDetail[];
}

export interface OrderDetail {
  id: number;
  order_id: number;
  ticket_id: number;
  quantity: number;
  subtotal: number;
  ticket?: Ticket;
}

export type PaymentStatus = 'settlement' | 'capture' | 'failure';
export type PaymentType = 'credit_card' | 'gopay' | 'bank_transfer' | string;

export interface Payment {
  id: number;
  order_id: number;
  transaction_id: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  paid_at: string;
}

// --- API response wrapper ---

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// --- Request payload types ---

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateOrderPayload {
  items: Array<{
    ticket_id: number;
    quantity: number;
  }>;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  event_date: string;
  category_id: number;
  status: EventStatus;
}

export interface CreateTicketPayload {
  ticket_type: string;
  price: number;
  stock: number;
}
```

### Setup HTTP Client (Axios)

```ts
// src/services/api.ts
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### Routing Setup (React Router v6)

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import OrganizerLayout from './layouts/OrganizerLayout';

// Lazy load halaman organizer (tidak dibutuhkan buyer biasa)
const OrganizerDashboard = lazy(() => import('./pages/organizer/Dashboard'));
const OrganizerEventList = lazy(() => import('./pages/organizer/EventList'));
const EventFormPage      = lazy(() => import('./pages/organizer/EventForm'));
const TicketManagePage   = lazy(() => import('./pages/organizer/TicketManage'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<EventListPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Buyer routes — login required */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/payment/status" element={<PaymentStatusPage />} />
        </Route>

        {/* Organizer routes — role: organizer */}
        <Route element={<ProtectedRoute requiredRole="organizer" />}>
          <Route path="/organizer" element={<OrganizerLayout />}>
            <Route index element={
              <Suspense fallback={<div>Loading...</div>}>
                <OrganizerDashboard />
              </Suspense>
            } />
            <Route path="events" element={<Suspense fallback={null}><OrganizerEventList /></Suspense>} />
            <Route path="events/new" element={<Suspense fallback={null}><EventFormPage /></Suspense>} />
            <Route path="events/:id/edit" element={<Suspense fallback={null}><EventFormPage /></Suspense>} />
            <Route path="events/:id/tickets" element={<Suspense fallback={null}><TicketManagePage /></Suspense>} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### State Management

- **Zustand** → auth state (user, token, role) & state sementara antar halaman
- **TanStack Query** → semua server state (fetch events, orders, tickets). Handle caching, refetch, dan loading state otomatis.

### Konfigurasi Tailwind + DaisyUI

```ts
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light'], // bisa tambah 'dark' jika perlu
  },
};
```

### Checklist Fase 0

- [ ] Inisiasi project dengan `npm create vite@latest -- --template react-ts`
- [ ] Install semua dependencies
- [ ] Konfigurasi Tailwind CSS + DaisyUI
- [ ] Buat `src/types/index.ts` dengan seluruh interface domain
- [ ] Buat Axios instance dengan interceptors (`api.ts`)
- [ ] Definisikan semua routes di `App.tsx`
- [ ] Setup `QueryClientProvider` di `main.tsx`
- [ ] Buat Zustand auth store (`authStore.ts`)
- [ ] Buat file `.env` dan `.env.example`
- [ ] Tambahkan type `ImportMetaEnv` di `vite-env.d.ts`

---

## Fase 1 — Autentikasi & Manajemen User

> Gerbang utama aplikasi. Selesaikan ini sebelum membangun fitur apapun.

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Login | `/login` | Email + password, simpan token & role |
| Register | `/register` | Nama, email, password, pilih role |
| Profil | `/profile` | Tampilkan data user, tombol logout |

### Auth Store (Zustand + TypeScript)

```ts
// src/store/authStore.ts
import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
```

### Protected Route Component

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;

  return <Outlet />;
}
```

### Form Login dengan Validasi (Zod + react-hook-form)

```tsx
// src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email:    z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // panggil service login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" className="input input-bordered" />
      {errors.email && <p className="text-error text-sm">{errors.email.message}</p>}

      <input {...register('password')} type="password" className="input input-bordered" />
      {errors.password && <p className="text-error text-sm">{errors.password.message}</p>}

      <button type="submit" className="btn btn-primary">Login</button>
    </form>
  );
}
```

### Auth Service

```ts
// src/services/auth.ts
import api from './api';
import type { ApiResponse, User, LoginPayload, RegisterPayload } from '../types';

export const login = (payload: LoginPayload) =>
  api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', payload);

export const register = (payload: RegisterPayload) =>
  api.post<ApiResponse<User>>('/auth/register', payload);

export const getProfile = () =>
  api.get<ApiResponse<User>>('/auth/me');
```

### Checklist Fase 1

- [ ] Halaman login dengan validasi Zod
- [ ] Halaman register (termasuk pilih role: buyer / organizer)
- [ ] Simpan token JWT + data user ke Zustand & localStorage
- [ ] Implement `ProtectedRoute` dengan role guard yang typed
- [ ] Halaman profil user
- [ ] Tombol logout (clear state + redirect ke `/`)
- [ ] Redirect otomatis setelah login berdasarkan role (`buyer` → `/`, `organizer` → `/organizer`)

---

## Fase 2 — Browse & Detail Event (Public)

> Core experience untuk pembeli. Halaman ini bisa diakses tanpa login.

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Listing event | `/` | Grid event dengan filter & search |
| Detail event | `/events/:id` | Info lengkap + pilih tiket |

### Fitur Listing Event

- Grid card event dari tabel `EVENTS` (sesuai desain yang ada)
- Filter berdasarkan `CATEGORIES` (checkbox)
- Filter price range (slider)
- Search by `title` (debounced input ~300ms)
- Sort berdasarkan `event_date`
- Tombol "Load More" atau pagination
- Badge status event

### Event Service

```ts
// src/services/events.ts
import api from './api';
import type { ApiResponse, Event, Category, CreateEventPayload } from '../types';

export interface GetEventsParams {
  category_id?: number;
  search?: string;
  sort?: 'upcoming' | 'latest' | 'price_asc' | 'price_desc';
  page?: number;
}

export const getEvents = (params?: GetEventsParams) =>
  api.get<ApiResponse<Event[]>>('/events', { params });

export const getEventById = (id: number) =>
  api.get<ApiResponse<Event>>(`/events/${id}`);

export const getCategories = () =>
  api.get<ApiResponse<Category[]>>('/categories');

export const getMyEvents = () =>
  api.get<ApiResponse<Event[]>>('/events/my');

export const createEvent = (payload: CreateEventPayload) =>
  api.post<ApiResponse<Event>>('/events', payload);

export const updateEvent = (id: number, payload: Partial<CreateEventPayload>) =>
  api.put<ApiResponse<Event>>(`/events/${id}`, payload);
```

### Fetch dengan TanStack Query

```tsx
// src/pages/EventListPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../services/events';
import type { Event } from '../types';

export default function EventListPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(),
    select: (res) => res.data.data, // unwrap ApiResponse<Event[]>
  });

  if (isLoading) return <EventListSkeleton />;
  if (isError)   return <ErrorState />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data?.map((event: Event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### EventCard Component (Typed Props)

```tsx
// src/components/EventCard.tsx
import type { Event } from '../types';
import dayjs from 'dayjs';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <span className="badge badge-primary">{event.category?.category_name}</span>
        <h2 className="card-title">{event.title}</h2>
        <p>{dayjs(event.event_date).format('DD MMM YYYY • HH:mm')}</p>
        <p>{event.location}</p>
      </div>
    </div>
  );
}
```

### Checklist Fase 2

- [ ] Halaman listing event dengan `EventCard` component (typed props)
- [ ] Filter kategori (checkbox) & price range (slider) — gunakan komponen DaisyUI
- [ ] Search input dengan debounce (~300ms)
- [ ] Sort dropdown ("Upcoming", "Latest", dll.)
- [ ] Tombol "Load More" atau pagination
- [ ] Halaman detail event
- [ ] Komponen pilih tiket + quantity selector (validasi `stock > 0`)
- [ ] Format harga ke Rupiah (`Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`)
- [ ] Format tanggal dengan `dayjs`
- [ ] Loading skeleton saat fetch
- [ ] Empty state jika tidak ada event

---

## Fase 3 — Checkout & Pembayaran Midtrans

> Fase paling kritis. Gunakan `payment_url` dari Midtrans — redirect ke halaman pembayaran Midtrans, bukan Snap popup.

### Alur Pembayaran

```
User pilih tiket → Checkout page → POST /orders
  → Backend return { payment_url, order_number }
  → window.location.href = payment_url  (keluar ke Midtrans)
  → User bayar di halaman Midtrans
  → Midtrans redirect ke /payment/status?order_number=ENTR-12345
  → Frontend polling GET /orders/:order_number/status
  → Tampilkan hasil berdasarkan OrderStatus
```

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Checkout | `/checkout` | Ringkasan order sebelum bayar |
| Status pembayaran | `/payment/status` | Hasil setelah redirect dari Midtrans |
| Riwayat order | `/orders` | Semua order milik user |
| Detail order | `/orders/:id` | Detail 1 order |

### Order Service

```ts
// src/services/orders.ts
import api from './api';
import type { ApiResponse, Order, CreateOrderPayload } from '../types';

export const createOrder = (payload: CreateOrderPayload) =>
  api.post<ApiResponse<{ order: Order; payment_url: string }>>('/orders', payload);

export const getOrderStatus = (orderNumber: string) =>
  api.get<ApiResponse<Order>>(`/orders/${orderNumber}/status`);

export const getUserOrders = () =>
  api.get<ApiResponse<Order[]>>('/orders/my');

export const getOrderById = (id: number) =>
  api.get<ApiResponse<Order>>(`/orders/${id}`);
```

### Implementasi Checkout

```tsx
// src/pages/CheckoutPage.tsx
import { useMutation } from '@tanstack/react-query';
import { createOrder } from '../services/orders';
import type { CreateOrderPayload } from '../types';

export default function CheckoutPage() {
  const mutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (res) => {
      const { payment_url } = res.data.data;
      // Redirect keluar ke halaman Midtrans
      window.location.href = payment_url;
    },
    onError: () => {
      // tampilkan toast error
    },
  });

  const handleCheckout = () => {
    mutation.mutate({ items: selectedTickets });
  };

  return (
    <div>
      {/* Ringkasan order */}
      <button
        className="btn btn-primary"
        onClick={handleCheckout}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Memproses...' : 'Bayar Sekarang'}
      </button>
    </div>
  );
}
```

### Halaman Status Pembayaran (dengan Polling)

```tsx
// src/pages/PaymentStatusPage.tsx
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderStatus } from '../services/orders';
import type { OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  settlement: { label: 'Pembayaran berhasil!',    className: 'text-success' },
  pending:    { label: 'Menunggu pembayaran...',   className: 'text-warning' },
  expire:     { label: 'Pembayaran kadaluarsa.',   className: 'text-error'   },
  cancel:     { label: 'Pembayaran dibatalkan.',   className: 'text-error'   },
};

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') ?? '';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-status', orderNumber],
    queryFn: () => getOrderStatus(orderNumber).then((r) => r.data.data),
    enabled: !!orderNumber,
    refetchInterval: (query) => {
      // Polling setiap 3 detik selama masih pending
      return query.state.data?.status === 'pending' ? 3000 : false;
    },
  });

  if (isLoading || !order) return <div className="loading loading-spinner" />;

  const config = statusConfig[order.status];

  return (
    <div className="text-center">
      <p className={`text-xl font-semibold ${config.className}`}>{config.label}</p>
      <p>Nomor Order: <strong>{order.order_number}</strong></p>
    </div>
  );
}
```

### Checklist Fase 3

- [ ] Halaman checkout — tampilkan ringkasan tiket & total harga
- [ ] POST order ke backend dengan `useMutation` (typed payload)
- [ ] Redirect user ke `payment_url` (`window.location.href`)
- [ ] Halaman `/payment/status` — baca `order_number` dari `useSearchParams()`
- [ ] Polling status order dengan `refetchInterval`
- [ ] `statusConfig` record yang typed dengan `Record<OrderStatus, ...>`
- [ ] UI untuk tiap status: settlement, pending, expire, cancel
- [ ] Halaman riwayat order (`/orders`)
- [ ] Halaman detail order (`/orders/:id`)
- [ ] Handle error (stok habis, order gagal dibuat)

---

## Fase 4 — Dashboard Organizer (Role-based)

> Hanya bisa diakses user dengan `role = 'organizer'`. Gunakan `ProtectedRoute` dari Fase 1.

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Dashboard utama | `/organizer` | Ringkasan revenue & statistik |
| List event saya | `/organizer/events` | Semua event milik organizer |
| Buat event baru | `/organizer/events/new` | Form create event |
| Edit event | `/organizer/events/:id/edit` | Form update event |
| Kelola tiket | `/organizer/events/:id/tickets` | CRUD tiket per event |

### Form Event dengan TypeScript + Zod

```ts
// src/pages/organizer/EventForm.tsx
import { z } from 'zod';
import type { CreateEventPayload } from '../../types';

const eventSchema = z.object({
  title:       z.string().min(5, 'Judul minimal 5 karakter'),
  description: z.string().min(20, 'Deskripsi terlalu pendek'),
  location:    z.string().min(3, 'Lokasi wajib diisi'),
  event_date:  z.string().min(1, 'Tanggal wajib diisi'),
  category_id: z.number({ invalid_type_error: 'Pilih kategori' }).positive(),
  status:      z.enum(['draft', 'published', 'cancelled']),
}) satisfies z.ZodType<CreateEventPayload>;
// `satisfies` memastikan schema cocok persis dengan tipe CreateEventPayload

type EventFormData = z.infer<typeof eventSchema>;
```

### Ticket Service

```ts
// src/services/tickets.ts
import api from './api';
import type { ApiResponse, Ticket, CreateTicketPayload } from '../types';

export const getTicketsByEvent = (eventId: number) =>
  api.get<ApiResponse<Ticket[]>>(`/events/${eventId}/tickets`);

export const createTicket = (eventId: number, payload: CreateTicketPayload) =>
  api.post<ApiResponse<Ticket>>(`/events/${eventId}/tickets`, payload);

export const updateTicket = (id: number, payload: Partial<CreateTicketPayload>) =>
  api.put<ApiResponse<Ticket>>(`/tickets/${id}`, payload);

export const deleteTicket = (id: number) =>
  api.delete(`/tickets/${id}`);
```

### Dashboard Analytics

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  event_title: string;
  revenue: number;
}

// Recharts sudah punya TypeScript types bawaan
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={revenueData as RevenueData[]}>
    <XAxis dataKey="event_title" />
    <YAxis />
    <Tooltip formatter={(value: number) => formatRupiah(value)} />
    <Bar dataKey="revenue" fill="#570df8" />
  </BarChart>
</ResponsiveContainer>
```

### Checklist Fase 4

- [ ] Layout khusus organizer (`OrganizerLayout` dengan sidebar — DaisyUI `drawer`)
- [ ] Halaman dashboard dengan statistik & chart (Recharts)
- [ ] List event organizer (`getMyEvents`)
- [ ] Form buat event — gunakan `satisfies z.ZodType<CreateEventPayload>` untuk type safety
- [ ] Form edit event (prefill data dari `getEventById`)
- [ ] Aksi publish / draft / cancel event
- [ ] Halaman manajemen tiket per event (CRUD)
- [ ] Validasi tiket: tidak bisa hapus jika sudah ada order

---

## Fase 5 — Polish, Testing & Deployment

> Lakukan ini sebelum diperlihatkan ke orang lain atau diluncurkan.

### Responsiveness & UX

- Mobile-first check semua halaman utama
- Pastikan halaman `/payment/status` tidak broken di mobile (user sering bayar dari HP)
- Semantic HTML & `aria-label` untuk aksesibilitas dasar
- Consistent loading state: skeleton loader (`DaisyUI skeleton`), bukan spinner kosong

### Error Boundary (TypeScript)

```tsx
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props  { children: ReactNode; }
interface State  { hasError: boolean;   }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <p>Terjadi kesalahan.</p>
          <button
            className="btn btn-sm mt-4"
            onClick={() => this.setState({ hasError: false })}
          >
            Coba lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Konfigurasi Vitest

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query:  ['@tanstack/react-query'],
          charts: ['recharts'],
        },
      },
    },
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

Prioritas test:
1. `ProtectedRoute` — pastikan redirect bekerja benar berdasarkan token & role
2. Checkout flow — dari pilih tiket sampai redirect ke `payment_url`
3. Status polling — simulasi perubahan `OrderStatus`
4. Form validasi — event form & register form dengan Zod

### Environment Variables + TypeScript

```env
# .env
VITE_API_BASE_URL=http://localhost:8000/api

# .env.production
VITE_API_BASE_URL=https://api.entrans.id
```

Tambahkan type declaration agar `import.meta.env` dikenali TypeScript:

```ts
// src/vite-env.d.ts (biasanya sudah ada, tinggal tambahkan bagian ini)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Deployment

- **Hosting:** Vercel atau Netlify (keduanya gratis untuk MVP)
- **Redirect rule:** Wajib ditambahkan agar React Router tidak 404 saat refresh

```
# Netlify: public/_redirects
/*  /index.html  200
```

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Checklist Fase 5

- [ ] Cek responsiveness semua halaman di mobile
- [ ] Tambahkan skeleton loader di semua halaman yang fetch data
- [ ] Buat `ErrorBoundary` component & halaman 404
- [ ] Empty state untuk list kosong
- [ ] Pastikan `vite-env.d.ts` sudah ada dengan type `ImportMetaEnv`
- [ ] Pastikan tidak ada `any` yang tersisa (jalankan `tsc --noEmit`)
- [ ] Unit test: `ProtectedRoute`, checkout flow
- [ ] E2E test: alur beli tiket end-to-end dengan Playwright
- [ ] Konfigurasi `manualChunks` di `vite.config.ts`
- [ ] Setup environment variables untuk production
- [ ] Deploy ke Vercel/Netlify
- [ ] Cek redirect rule agar React Router berfungsi di production

---

## Catatan Penting

### Soal `payment_url` Midtrans

Tidak seperti Snap (popup), `payment_url` berarti user akan **keluar dari aplikasi** dan dibawa ke halaman Midtrans. Beberapa hal yang perlu diperhatikan:

1. **Jangan POST order dua kali** — simpan `order_number` di state sebelum redirect agar tidak terbuat order duplikat jika user kembali ke halaman checkout.
2. **Konfigurasi redirect URL di backend** — Midtrans perlu tahu ke mana redirect setelah bayar. Pastikan backend set `finish_redirect_url` ke `/payment/status?order_number={order_number}`.
3. **Status sumber kebenaran ada di backend** — jangan percaya query param dari Midtrans redirect saja. Selalu `GET /orders/:order_number/status` dari backend untuk menampilkan status final.
4. **Handle tombol "kembali" browser** — user mungkin kembali dari halaman Midtrans tanpa bayar. Cek status order dulu sebelum izinkan checkout ulang.

### Tips TypeScript untuk Pemula

| Situasi | Saran |
|---------|-------|
| Tidak tahu type sesuatu | Hover di VS Code — TypeScript akan tunjukkan type-nya |
| Tergoda pakai `any` | Pakai `unknown` lalu narrowing, atau tanyakan dulu |
| Type error tapi kode "harusnya benar" | Jangan gunakan `as` atau `!` dulu — cari tahu kenapa error |
| Type API response tidak cocok | Periksa apakah backend benar-benar return field tersebut |
| Generic membingungkan | Baca dari dalam ke luar: `ApiResponse<User>` = "ApiResponse yang isinya User" |

> Jalankan `tsc --noEmit` secara berkala untuk cek type error tanpa perlu build.

### Role vs Layout

Gunakan dua layout terpisah daripada satu layout dengan conditional rendering:

```
PublicLayout    → Navbar publik, footer
OrganizerLayout → Sidebar navigasi organizer (DaisyUI drawer)
```

### Struktur Services

```
src/services/
├── api.ts          # Axios instance — jangan tambahkan logic lain di sini
├── auth.ts         # login, register, getProfile
├── events.ts       # getEvents, getEventById, createEvent, updateEvent, getMyEvents
├── tickets.ts      # getTicketsByEvent, createTicket, updateTicket, deleteTicket
├── orders.ts       # createOrder, getOrderStatus, getUserOrders, getOrderById
└── categories.ts   # getCategories
```

### TypeScript Strict Mode

Project Vite + React TypeScript template sudah aktifkan strict mode di `tsconfig.json`. **Jangan dimatikan** — memang lebih banyak error di awal, tapi ini yang membuat TypeScript berguna untuk mencegah bug di production.

---

*Roadmap ini dibuat untuk project Entrans — event management marketplace.*  
*Stack: React + TypeScript · Tailwind CSS + DaisyUI · TanStack Query · Zustand · Axios*
