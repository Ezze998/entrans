# Entrans — Frontend Development Roadmap

> **Stack:** React.js (Vite) · React Router v6 · TanStack Query · Zustand · Axios · Tailwind CSS  
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

### Struktur Folder

```
src/
├── assets/
├── components/       # Komponen reusable (Button, Modal, Badge, dll.)
│   └── ui/
├── hooks/            # Custom hooks (useAuth, useOrder, dll.)
├── layouts/          # Layout wrappers (PublicLayout, OrganizerLayout)
├── pages/            # Halaman per route
├── services/         # API calls per domain (auth.js, events.js, orders.js)
│   └── api.js        # Axios instance & interceptors
├── store/            # Zustand stores (authStore, cartStore)
├── utils/            # Helper functions (formatCurrency, formatDate, dll.)
└── main.jsx
```

### Setup HTTP Client (Axios)

Buat satu Axios instance sebagai single source untuk semua request:

```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach token otomatis ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 global (token expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
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

```jsx
// src/main.jsx atau src/App.jsx
<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<EventListPage />} />
      <Route path="events/:id" element={<EventDetailPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
    </Route>

    {/* Buyer routes (login required) */}
    <Route element={<ProtectedRoute />}>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/payment/status" element={<PaymentStatusPage />} />
    </Route>

    {/* Organizer routes (role: organizer) */}
    <Route element={<ProtectedRoute requiredRole="organizer" />}>
      <Route path="/organizer" element={<OrganizerLayout />}>
        <Route index element={<OrganizerDashboard />} />
        <Route path="events" element={<OrganizerEventList />} />
        <Route path="events/new" element={<EventFormPage />} />
        <Route path="events/:id/edit" element={<EventFormPage />} />
        <Route path="events/:id/tickets" element={<TicketManagePage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

### State Management

- **Zustand** → auth state (user, token, role) & cart/order sementara
- **TanStack Query** → semua server state (fetch events, orders, tickets). Handle caching, refetch, dan loading state otomatis.

### Checklist Fase 0

- [ ] Inisiasi project dengan Vite + React
- [ ] Install dependencies utama (axios, react-router-dom, @tanstack/react-query, zustand, react-hook-form, zod)
- [ ] Setup Tailwind CSS + UI library (Shadcn/ui atau pilihan lain)
- [ ] Buat Axios instance dengan interceptors
- [ ] Definisikan semua routes
- [ ] Setup TanStack Query Provider di root
- [ ] Buat Zustand auth store
- [ ] Setup `.env` file (`VITE_API_BASE_URL`)

---

## Fase 1 — Autentikasi & Manajemen User

> Gerbang utama aplikasi. Selesaikan ini sebelum membangun fitur apapun.

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Login | `/login` | Email + password, simpan token & role |
| Register | `/register` | Nama, email, password, pilih role |
| Profil | `/profile` | Tampilkan data user, tombol logout |

### Auth Store (Zustand)

```js
// src/store/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  
  login: (userData, token) => {
    localStorage.setItem('token', token);
    set({ user: userData, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
```

### Protected Route Component

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ requiredRole }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;

  return <Outlet />;
}
```

### Sumber Data

```
USERS { id, name, email, role }
```

### Checklist Fase 1

- [ ] Halaman login dengan validasi (react-hook-form + Zod)
- [ ] Halaman register
- [ ] Simpan token JWT + data user ke Zustand & localStorage
- [ ] Implement `ProtectedRoute` dengan role guard
- [ ] Halaman profil user
- [ ] Tombol logout (clear state + redirect)
- [ ] Redirect otomatis setelah login berdasarkan role

---

## Fase 2 — Browse & Detail Event (Public)

> Core experience untuk pembeli. Halaman ini bisa diakses tanpa login.

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Listing event | `/` | Grid event dengan filter & search |
| Detail event | `/events/:id` | Info lengkap + pilih tiket |

### Fitur Listing Event

- Grid/list card event dari tabel `EVENTS`
- Filter berdasarkan `CATEGORIES` (dropdown atau pill filter)
- Search by `title` (debounced input)
- Sort berdasarkan `event_date`
- Pagination atau infinite scroll
- Badge status event (upcoming, ongoing, completed)

### Fitur Detail Event

- Tampilkan: `title`, `description`, `location`, `event_date`, `status`
- Tampilkan nama kategori dari `CATEGORIES`
- List semua `TICKETS` untuk event tersebut:
  - `ticket_type` (nama tiket)
  - `price` (format rupiah)
  - `stock` (tampilkan "Habis" jika 0)
- Selector quantity per ticket type
- Tombol "Beli Sekarang" → redirect ke `/checkout` (jika sudah login) atau `/login`

### Contoh API Service

```js
// src/services/events.js
import api from './api';

export const getEvents = (params) => api.get('/events', { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const getCategories = () => api.get('/categories');
```

### Checklist Fase 2

- [ ] Halaman listing event dengan card component
- [ ] Filter kategori & search (debounced)
- [ ] Pagination atau infinite scroll
- [ ] Halaman detail event
- [ ] Komponen pilih tiket + quantity selector (validasi stok)
- [ ] Format harga ke Rupiah (`Intl.NumberFormat`)
- [ ] Format tanggal event (`dayjs` atau `date-fns`)
- [ ] Loading skeleton saat fetch data
- [ ] Empty state jika tidak ada event

---

## Fase 3 — Checkout & Pembayaran Midtrans

> Fase paling kritis. Gunakan `payment_url` dari Midtrans — redirect ke halaman pembayaran Midtrans, bukan Snap popup.

### Alur Pembayaran

```
User pilih tiket → Checkout page → POST /orders → Backend return { payment_url, order_number }
→ Redirect ke payment_url (halaman Midtrans) → User bayar → Midtrans redirect balik ke /payment/status
→ Frontend cek status order → Tampilkan hasil
```

### Halaman yang Dibangun

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Checkout | `/checkout` | Ringkasan order sebelum bayar |
| Status pembayaran | `/payment/status?order_number=ENTR-12345` | Hasil pembayaran |
| Riwayat order | `/orders` | Semua order milik user |
| Detail order | `/orders/:id` | Detail 1 order |

### Implementasi Checkout

```js
// src/services/orders.js
import api from './api';

export const createOrder = (payload) => api.post('/orders', payload);
// payload: { items: [{ ticket_id, quantity }] }

export const getOrderStatus = (orderNumber) => 
  api.get(`/orders/${orderNumber}/status`);

export const getUserOrders = () => api.get('/orders/my');
```

```jsx
// src/pages/CheckoutPage.jsx (ringkasan)
const handleCheckout = async () => {
  try {
    const res = await createOrder({ items: selectedTickets });
    const { payment_url } = res.data;
    
    // Redirect ke halaman pembayaran Midtrans
    window.location.href = payment_url;
  } catch (err) {
    toast.error('Gagal membuat order. Coba lagi.');
  }
};
```

### Halaman Status Pembayaran

Setelah bayar, Midtrans redirect ke URL yang dikonfigurasi di backend (contoh: `/payment/status?order_number=ENTR-12345`). Frontend lalu cek status order:

```jsx
// src/pages/PaymentStatusPage.jsx
const { data: order, isLoading } = useQuery({
  queryKey: ['order-status', orderNumber],
  queryFn: () => getOrderStatus(orderNumber),
  refetchInterval: (data) => {
    // Polling setiap 3 detik selama status masih pending
    return data?.status === 'pending' ? 3000 : false;
  },
});

// Tampilkan UI berdasarkan order.status:
// 'settlement' → Pembayaran berhasil ✅
// 'pending'    → Menunggu pembayaran ⏳  
// 'expire'     → Pembayaran kadaluarsa ❌
// 'cancel'     → Dibatalkan ❌
```

### Sumber Data

```
ORDERS        { id, order_number, total_amount, status, payment_url, created_at }
ORDER_DETAILS { order_id, ticket_id, quantity, subtotal }
PAYMENTS      { transaction_id, payment_type, status, paid_at }
```

### Checklist Fase 3

- [ ] Halaman checkout — tampilkan ringkasan tiket & total harga
- [ ] POST order ke backend, ambil `payment_url`
- [ ] Redirect user ke `payment_url` (Midtrans)
- [ ] Halaman `/payment/status` — baca `order_number` dari query param
- [ ] Polling status order sampai tidak `pending`
- [ ] UI untuk tiap status: success, pending, expired, cancelled
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

### Form Event (Buat & Edit)

Field dari tabel `EVENTS`:

```jsx
// Validasi dengan Zod
const eventSchema = z.object({
  title:       z.string().min(5, 'Judul minimal 5 karakter'),
  description: z.string().min(20, 'Deskripsi terlalu pendek'),
  location:    z.string().min(3),
  event_date:  z.string().datetime(),
  category_id: z.number().positive(),
  status:      z.enum(['draft', 'published', 'cancelled']),
});
```

### Kelola Tiket

Operasi per event dari tabel `TICKETS`:
- Tambah ticket type baru (`ticket_type`, `price`, `stock`)
- Edit price & stock tiket yang sudah ada
- Hapus tiket (jika belum ada order)
- Tampilkan sisa stok real-time

### Dashboard Analytics

Data yang ditampilkan:
- Total revenue dari `PAYMENTS` (status `settlement`)
- Jumlah order per event
- Distribusi status pembayaran (chart donut/bar)
- Event terlaris (berdasarkan tiket terjual)

Gunakan **Recharts** untuk visualisasi:

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
```

### Checklist Fase 4

- [ ] Layout khusus organizer (`OrganizerLayout` dengan sidebar)
- [ ] Halaman dashboard dengan statistik & chart
- [ ] List event organizer (filter by `user_id` dari token)
- [ ] Form buat event (validasi Zod + react-hook-form)
- [ ] Form edit event
- [ ] Aksi publish / draft / cancel event
- [ ] Halaman manajemen tiket per event (CRUD)
- [ ] Validasi tiket: tidak bisa hapus jika sudah ada order

---

## Fase 5 — Polish, Testing & Deployment

> Lakukan ini sebelum diperlihatkan ke orang lain atau diluncurkan.

### Responsiveness & UX

- Mobile-first check semua halaman utama
- Pastikan halaman `/payment/status` tidak broken di mobile (user sering bayar dari HP)
- Semantic HTML & aria-label untuk aksesibilitas dasar
- Consistent loading state: gunakan skeleton loader, bukan spinner kosong

### Error States

- **Global error boundary** — tangkap error rendering yang tidak terduga
- **404 page** — untuk route yang tidak ada
- **Empty states** — jika list event/order kosong, tampilkan pesan yang jelas
- **Network error** — tampilkan pesan retry jika fetch gagal

### Testing

```bash
# Unit & integration test
npm install -D vitest @testing-library/react @testing-library/jest-dom

# E2E test
npm install -D @playwright/test
```

Prioritas test:
1. `ProtectedRoute` — pastikan redirect bekerja benar
2. Checkout flow — dari pilih tiket sampai redirect ke Midtrans
3. Status polling — simulasi perubahan status order
4. Form validasi — event form & register form

### Build Optimization

```js
// vite.config.js — code splitting per route
import { defineConfig } from 'vite';

export default defineConfig({
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

Lazy load halaman organizer (tidak dibutuhkan pembeli biasa):

```jsx
const OrganizerDashboard = lazy(() => import('./pages/organizer/Dashboard'));
```

### Environment Variables

```env
# .env.production
VITE_API_BASE_URL=https://api.entrans.id
VITE_MIDTRANS_ENV=production
```

### Deployment

- **Hosting:** Vercel atau Netlify (keduanya gratis untuk MVP)
- **Redirect rule:** Tambahkan `_redirects` (Netlify) atau `vercel.json` agar React Router tidak 404 saat refresh

```
# Netlify _redirects
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
- [ ] Buat halaman 404 & error boundary
- [ ] Empty state untuk list kosong
- [ ] Unit test: ProtectedRoute, checkout flow
- [ ] E2E test: alur beli tiket end-to-end
- [ ] Code splitting & lazy loading halaman organizer
- [ ] Setup environment variables untuk production
- [ ] Deploy ke Vercel/Netlify
- [ ] Cek redirect rule agar React Router berfungsi di production

---

## Catatan Penting

### Soal `payment_url` Midtrans

Tidak seperti Snap (popup), `payment_url` berarti user akan **keluar dari aplikasi** dan dibawa ke halaman Midtrans. Beberapa hal yang perlu diperhatikan:

1. **Jangan lakukan POST order dua kali** — simpan `order_number` di session/state sebelum redirect agar tidak terbuat order duplikat jika user kembali ke halaman checkout.
2. **Konfigurasi redirect URL di backend** — Midtrans perlu tahu ke mana redirect setelah bayar. Pastikan backend set `finish_redirect_url` ke `/payment/status?order_number={order_number}`.
3. **Status sumber kebenaran ada di backend** — jangan percaya query param dari Midtrans redirect saja. Selalu `GET /orders/:order_number/status` dari backend untuk menampilkan status final.
4. **Handle tombol "kembali" browser** — user mungkin kembali dari halaman Midtrans tanpa bayar. Halaman checkout harus handle state ini dengan graceful (cek status order dulu sebelum izinkan checkout ulang).

### Role vs Layout

Gunakan dua layout terpisah daripada satu layout dengan conditional rendering:

```
PublicLayout    → Navbar publik, footer
OrganizerLayout → Sidebar navigasi organizer
```

Ini lebih bersih dan mudah dikembangkan.

### Konsistensi Penamaan API Service

Buat satu file service per domain, bukan satu file besar:

```
src/services/
├── api.js        # Axios instance
├── auth.js       # login, register, getProfile
├── events.js     # getEvents, getEventById, createEvent, updateEvent
├── tickets.js    # getTickets, createTicket, updateTicket, deleteTicket
├── orders.js     # createOrder, getOrderStatus, getUserOrders
└── categories.js # getCategories
```

---

*Roadmap ini dibuat untuk project Entrans — event management marketplace.*  
*Diperbarui: sesuaikan dengan perkembangan backend API.*
