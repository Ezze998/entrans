# Entrans — Frontend Development Roadmap

> **Stack:** React.js + TypeScript · React Router v6 · Fetch API · Tailwind CSS + DaisyUI  
> **Untuk siapa:** Pemula yang sudah paham React dasar  
> **Prinsip:** Sesederhana mungkin — tidak ada library state management, tidak ada library fetching

---

## Gambaran Fase

| Fase | Fokus | Estimasi |
|------|-------|----------|
| 0 | Setup project | 1–2 hari |
| 1 | Autentikasi (Login & Register) | ~1 minggu |
| 2 | Halaman Event (Browse & Detail) | ~1 minggu |
| 3 | Checkout & Pembayaran | ~1.5 minggu |
| 4 | Dashboard Organizer | ~1.5 minggu |
| 5 | Finishing & Deploy | ~3–5 hari |

**Total estimasi:** 6–7 minggu

---

## Fase 0 — Setup Project

### Langkah 1 — Buat project baru

Buka terminal, jalankan perintah ini satu per satu:

```bash
npm create vite@latest entrans -- --template react-ts
cd entrans
npm install
```

### Langkah 2 — Install React Router

```bash
npm install react-router-dom
```

### Langkah 3 — Install Tailwind CSS + DaisyUI

```bash
npm install -D tailwindcss postcss autoprefixer daisyui
npx tailwindcss init -p
```

Buka file `tailwind.config.js` yang baru terbuat, ganti isinya dengan:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
}
```

Buka file `src/index.css`, hapus semua isinya dan ganti dengan:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Langkah 4 — Buat struktur folder

Di dalam folder `src/`, buat folder-folder berikut:

```
src/
├── components/    ← komponen kecil yang dipakai berulang (Navbar, dll.)
├── pages/         ← satu file per halaman
├── types/         ← definisi TypeScript
└── utils/         ← fungsi helper
```

Cara buat folder di terminal:

```bash
mkdir src/components src/pages src/types src/utils
```

### Langkah 5 — Buat file types

Buat file `src/types/index.ts` — ini tempat kita definisikan bentuk data dari backend:

```ts
// src/types/index.ts

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
  event_date: string;
  status: EventStatus;
  category?: Category;
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
}

export interface OrderDetail {
  id: number;
  order_id: number;
  ticket_id: number;
  quantity: number;
  subtotal: number;
  ticket?: Ticket;
}
```

### Langkah 6 — Buat file helper untuk fetch

Daripada nulis `fetch` dari nol setiap saat, kita buat satu fungsi helper.
Buat file `src/utils/api.ts`:

```ts
// src/utils/api.ts

const BASE_URL = 'http://localhost:8000/api'; // ganti sesuai URL backend

// Fungsi ini otomatis menambahkan token dan header JSON ke setiap request
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Jika token expired atau tidak valid, paksa logout
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  const data = await response.json();

  if (!response.ok) {
    // Lempar error supaya bisa di-catch di komponen
    throw new Error(data.message || 'Terjadi kesalahan');
  }

  return data;
}
```

### Langkah 7 — Buat fungsi helper format

Buat file `src/utils/format.ts`:

```ts
// src/utils/format.ts

// Format angka ke format Rupiah
// Contoh: formatRupiah(150000) → "Rp 150.000"
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format tanggal ke format Indonesia
// Contoh: formatDate("2024-08-24T16:00:00") → "24 Agustus 2024, 16:00"
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

### Langkah 8 — Setup routing di App.tsx

Ganti isi `src/App.tsx` dengan ini:

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Halaman-halaman ini akan kita buat satu per satu di fase berikutnya
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import OrganizerEventFormPage from './pages/OrganizerEventFormPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/status" element={<PaymentStatusPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/organizer" element={<OrganizerDashboardPage />} />
        <Route path="/organizer/events/new" element={<OrganizerEventFormPage />} />
        <Route path="/organizer/events/:id/edit" element={<OrganizerEventFormPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Karena halaman-halamannya belum ada, buat dulu file placeholder agar tidak error.
Buat semua file berikut dengan isi yang sama (ganti nama fungsinya saja):

```tsx
// Contoh: src/pages/HomePage.tsx
export default function HomePage() {
  return <div>Home Page</div>;
}
```

Buat file placeholder untuk semua halaman:
- `src/pages/HomePage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/EventDetailPage.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/pages/PaymentStatusPage.tsx`
- `src/pages/OrderHistoryPage.tsx`
- `src/pages/OrganizerDashboardPage.tsx`
- `src/pages/OrganizerEventFormPage.tsx`
- `src/pages/NotFoundPage.tsx`

### Langkah 9 — Jalankan project

```bash
npm run dev
```

Buka browser di `http://localhost:5173` — kalau muncul tanpa error, setup selesai.

### Checklist Fase 0

- [ ] Project berhasil dibuat dengan Vite + React + TypeScript
- [ ] Tailwind CSS + DaisyUI terpasang dan berjalan
- [ ] File `src/types/index.ts` sudah dibuat
- [ ] File `src/utils/api.ts` sudah dibuat
- [ ] File `src/utils/format.ts` sudah dibuat
- [ ] Semua halaman placeholder sudah dibuat
- [ ] `npm run dev` berjalan tanpa error

---

## Fase 1 — Autentikasi (Login & Register)

> Kita mulai dari autentikasi karena hampir semua fitur lain butuh ini.

### Konsep: Menyimpan Login State

Kita simpan data user dan token di `localStorage`. Ini cara paling sederhana.

```
Setelah login berhasil:
  localStorage.setItem('token', '...token dari backend...')
  localStorage.setItem('user', JSON.stringify({ id, name, email, role }))

Saat cek apakah sudah login:
  const token = localStorage.getItem('token')  ← kalau null, belum login

Saat logout:
  localStorage.removeItem('token')
  localStorage.removeItem('user')
```

### Langkah 1 — Buat Navbar

Buat file `src/components/Navbar.tsx`:

```tsx
// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // Ambil data user dari localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <nav className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold">Entrans</Link>
      </div>

      <div className="flex-none gap-2">
        {user ? (
          <>
            <span className="text-sm">Halo, {user.name}</span>

            {/* Tampilkan link organizer jika rolenya organizer */}
            {user.role === 'organizer' && (
              <Link to="/organizer" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
            )}

            <Link to="/orders" className="btn btn-ghost btn-sm">
              Pesanan Saya
            </Link>

            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

### Langkah 2 — Buat Halaman Login

Ganti isi `src/pages/LoginPage.tsx`:

```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import type { User } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();

  // State untuk isi form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // supaya halaman tidak reload
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Simpan token dan data user ke localStorage
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      // Redirect berdasarkan role
      if (res.user.role === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {/* Tampilkan pesan error jika ada */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Login'}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Belum punya akun?{' '}
          <Link to="/register" className="link link-primary">
            Register di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### Langkah 3 — Buat Halaman Register

Ganti isi `src/pages/RegisterPage.tsx`:

```tsx
// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import type { UserRole } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<UserRole>('buyer');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      // Setelah register berhasil, arahkan ke login
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Register</h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Daftar sebagai</label>
            <select
              className="select select-bordered w-full"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="buyer">Pembeli</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Register'}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Sudah punya akun?{' '}
          <Link to="/login" className="link link-primary">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}
```

### Langkah 4 — Proteksi Halaman

Beberapa halaman tidak boleh diakses kalau belum login. Buat komponen
`src/components/ProtectedPage.tsx`:

```tsx
// src/components/ProtectedPage.tsx
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedPage({ children, requiredRole }: Props) {
  const token    = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user     = userJson ? JSON.parse(userJson) : null;

  // Belum login → arahkan ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Sudah login tapi role tidak sesuai → arahkan ke home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

Cara pakainya di `App.tsx` — wrap halaman yang perlu proteksi:

```tsx
// Di App.tsx, ubah route checkout menjadi:
import ProtectedPage from './components/ProtectedPage';

<Route
  path="/checkout"
  element={
    <ProtectedPage>
      <CheckoutPage />
    </ProtectedPage>
  }
/>

// Untuk route organizer:
<Route
  path="/organizer"
  element={
    <ProtectedPage requiredRole="organizer">
      <OrganizerDashboardPage />
    </ProtectedPage>
  }
/>
```

### Checklist Fase 1

- [ ] Navbar tampil dengan benar (login/logout sesuai kondisi)
- [ ] Halaman login bisa login dan redirect sesuai role
- [ ] Halaman register bisa mendaftarkan user baru
- [ ] Token dan data user tersimpan di localStorage setelah login
- [ ] Logout berhasil menghapus token dan redirect ke `/login`
- [ ] `ProtectedPage` mencegah akses tanpa login

---

## Fase 2 — Halaman Event (Browse & Detail)

### Langkah 1 — Buat Halaman Utama (Listing Event)

Ganti isi `src/pages/HomePage.tsx`:

```tsx
// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import { formatRupiah, formatDate } from '../utils/format';
import type { Event, Category } from '../types';

export default function HomePage() {
  const [events, setEvents]         = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // State untuk filter
  const [search, setSearch]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch events dan categories saat halaman pertama dibuka
  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, categoriesRes] = await Promise.all([
          apiFetch<{ data: Event[] }>('/events'),
          apiFetch<{ data: Category[] }>('/categories'),
        ]);
        setEvents(eventsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setError('Gagal memuat data event');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // [] artinya hanya jalan sekali saat komponen pertama muncul

  // Filter event berdasarkan search dan kategori
  const filteredEvents = events.filter((event) => {
    const matchSearch   = event.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === '' || event.category_id === Number(selectedCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-primary text-primary-content py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Find Your Next Experience</h1>
        <p className="text-lg mb-6">Temukan event terbaik di sekitarmu</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter & Search */}
        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="text"
            placeholder="Cari event..."
            className="input input-bordered flex-1 min-w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select select-bordered"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Daftar Event */}
        {loading && (
          <div className="text-center py-20">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20 text-base-content/50">
            Tidak ada event yang ditemukan
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="card-body">
                {event.category && (
                  <span className="badge badge-primary w-fit">
                    {event.category.category_name}
                  </span>
                )}
                <h2 className="card-title">{event.title}</h2>
                <p className="text-sm text-base-content/60">
                  📅 {formatDate(event.event_date)}
                </p>
                <p className="text-sm text-base-content/60">
                  📍 {event.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Langkah 2 — Buat Halaman Detail Event

Ganti isi `src/pages/EventDetailPage.tsx`:

```tsx
// src/pages/EventDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import { formatRupiah, formatDate } from '../utils/format';
import type { Event, Ticket } from '../types';

// Tipe untuk menyimpan jumlah tiket yang dipilih
interface SelectedTicket {
  ticket: Ticket;
  quantity: number;
}

export default function EventDetailPage() {
  // Ambil :id dari URL (contoh: /events/5 → id = "5")
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent]     = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // State menyimpan tiket yang dipilih user
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          apiFetch<{ data: Event }>(`/events/${id}`),
          apiFetch<{ data: Ticket[] }>(`/events/${id}/tickets`),
        ]);
        setEvent(eventRes.data);
        setTickets(ticketsRes.data);
      } catch (err) {
        setError('Event tidak ditemukan');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Update quantity tiket yang dipilih
  function handleQuantityChange(ticket: Ticket, quantity: number) {
    setSelectedTickets((prev) => {
      // Hapus tiket ini dari list dulu
      const filtered = prev.filter((s) => s.ticket.id !== ticket.id);
      // Kalau quantity > 0, tambahkan kembali
      if (quantity > 0) {
        return [...filtered, { ticket, quantity }];
      }
      return filtered;
    });
  }

  // Hitung total harga
  const totalHarga = selectedTickets.reduce(
    (sum, s) => sum + s.ticket.price * s.quantity,
    0
  );

  function handleBeli() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (selectedTickets.length === 0) {
      alert('Pilih minimal 1 tiket');
      return;
    }

    // Simpan pilihan tiket ke sessionStorage, lalu ke halaman checkout
    sessionStorage.setItem('selectedTickets', JSON.stringify(selectedTickets));
    navigate('/checkout');
  }

  if (loading) return (
    <div>
      <Navbar />
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    </div>
  );

  if (error || !event) return (
    <div>
      <Navbar />
      <div className="text-center py-20">
        <p className="text-error">{error}</p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Info Event */}
        <div className="mb-8">
          {event.category && (
            <span className="badge badge-primary mb-2">
              {event.category.category_name}
            </span>
          )}
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <p className="text-base-content/60 mb-2">📅 {formatDate(event.event_date)}</p>
          <p className="text-base-content/60 mb-4">📍 {event.location}</p>
          <p className="whitespace-pre-line">{event.description}</p>
        </div>

        {/* Pilih Tiket */}
        <div className="card bg-base-100 shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Pilih Tiket</h2>

          {tickets.length === 0 && (
            <p className="text-base-content/50">Belum ada tiket tersedia</p>
          )}

          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => {
              const selected = selectedTickets.find((s) => s.ticket.id === ticket.id);
              const quantity = selected?.quantity ?? 0;

              return (
                <div key={ticket.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-semibold">{ticket.ticket_type}</p>
                    <p className="text-primary font-bold">{formatRupiah(ticket.price)}</p>
                    <p className="text-sm text-base-content/50">
                      {ticket.stock > 0 ? `Sisa ${ticket.stock} tiket` : 'Habis'}
                    </p>
                  </div>

                  {/* Selector quantity */}
                  <div className="flex items-center gap-3">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleQuantityChange(ticket, Math.max(0, quantity - 1))}
                      disabled={quantity === 0}
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{quantity}</span>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleQuantityChange(ticket, Math.min(ticket.stock, quantity + 1))}
                      disabled={quantity >= ticket.stock || ticket.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total & Tombol Beli */}
          {selectedTickets.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Total</p>
                <p className="text-2xl font-bold text-primary">{formatRupiah(totalHarga)}</p>
              </div>
              <button onClick={handleBeli} className="btn btn-primary btn-lg">
                Beli Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Checklist Fase 2

- [ ] Halaman home menampilkan daftar event dari backend
- [ ] Filter pencarian dan kategori berfungsi
- [ ] Klik card event masuk ke halaman detail
- [ ] Halaman detail menampilkan info event dan daftar tiket
- [ ] Selector quantity tiket berfungsi (tidak bisa melebihi stok)
- [ ] Tombol "Beli Sekarang" redirect ke `/login` jika belum login
- [ ] Total harga terhitung dengan benar

---

## Fase 3 — Checkout & Pembayaran Midtrans

> Alur: User pilih tiket → Checkout → POST ke backend → Redirect ke `payment_url` Midtrans → Kembali ke halaman status.

### Langkah 1 — Buat Halaman Checkout

Ganti isi `src/pages/CheckoutPage.tsx`:

```tsx
// src/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedPage from '../components/ProtectedPage';
import { apiFetch } from '../utils/api';
import { formatRupiah } from '../utils/format';
import type { Ticket, Order } from '../types';

interface SelectedTicket {
  ticket: Ticket;
  quantity: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Ambil pilihan tiket dari sessionStorage (disimpan di halaman detail)
  useEffect(() => {
    const saved = sessionStorage.getItem('selectedTickets');
    if (!saved) {
      navigate('/'); // kalau tidak ada, kembali ke home
      return;
    }
    setSelectedTickets(JSON.parse(saved));
  }, []);

  const totalHarga = selectedTickets.reduce(
    (sum, s) => sum + s.ticket.price * s.quantity,
    0
  );

  async function handleCheckout() {
    setLoading(true);
    setError('');

    try {
      const items = selectedTickets.map((s) => ({
        ticket_id: s.ticket.id,
        quantity:  s.quantity,
      }));

      const res = await apiFetch<{ data: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });

      // Hapus pilihan tiket dari sessionStorage
      sessionStorage.removeItem('selectedTickets');

      // Redirect ke halaman pembayaran Midtrans
      window.location.href = res.data.payment_url;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Ringkasan Pesanan</h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        {/* Daftar tiket yang dipesan */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            {selectedTickets.map((s) => (
              <div key={s.ticket.id} className="flex justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-semibold">{s.ticket.ticket_type}</p>
                  <p className="text-sm text-base-content/60">
                    {s.quantity} × {formatRupiah(s.ticket.price)}
                  </p>
                </div>
                <p className="font-bold">{formatRupiah(s.ticket.price * s.quantity)}</p>
              </div>
            ))}

            <div className="flex justify-between pt-4 font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(totalHarga)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="btn btn-primary w-full btn-lg"
          disabled={loading}
        >
          {loading
            ? <span className="loading loading-spinner" />
            : 'Lanjut ke Pembayaran'}
        </button>
      </div>
    </ProtectedPage>
  );
}
```

### Langkah 2 — Buat Halaman Status Pembayaran

Setelah user bayar di Midtrans, mereka akan diarahkan kembali ke
`/payment/status?order_number=ENTR-12345`. Halaman ini mengecek status order.

Ganti isi `src/pages/PaymentStatusPage.tsx`:

```tsx
// src/pages/PaymentStatusPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import type { Order, OrderStatus } from '../types';

// Konfigurasi tampilan untuk setiap status
const statusConfig: Record<OrderStatus, { label: string; icon: string; color: string }> = {
  settlement: { label: 'Pembayaran Berhasil!',  icon: '✅', color: 'text-success' },
  pending:    { label: 'Menunggu Pembayaran...', icon: '⏳', color: 'text-warning' },
  expire:     { label: 'Pembayaran Kadaluarsa', icon: '❌', color: 'text-error'   },
  cancel:     { label: 'Pembayaran Dibatalkan', icon: '❌', color: 'text-error'   },
};

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') ?? '';

  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!orderNumber) {
      setError('Nomor order tidak ditemukan');
      setLoading(false);
      return;
    }

    // Cek status order, lakukan polling jika masih pending
    async function checkStatus() {
      try {
        const res = await apiFetch<{ data: Order }>(`/orders/${orderNumber}/status`);
        setOrder(res.data);

        // Jika masih pending, cek lagi 3 detik kemudian
        if (res.data.status === 'pending') {
          setTimeout(checkStatus, 3000);
        }
      } catch (err) {
        setError('Gagal mengecek status pembayaran');
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [orderNumber]);

  if (loading) return (
    <div>
      <Navbar />
      <div className="text-center py-20">
        <span className="loading loading-spinner loading-lg" />
        <p className="mt-4">Mengecek status pembayaran...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div>
      <Navbar />
      <div className="text-center py-20">
        <p className="text-error">{error}</p>
        <Link to="/" className="btn btn-primary mt-4">Kembali ke Home</Link>
      </div>
    </div>
  );

  const config = statusConfig[order.status];

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">{config.icon}</p>
        <h1 className={`text-2xl font-bold mb-2 ${config.color}`}>
          {config.label}
        </h1>
        <p className="text-base-content/60 mb-1">Nomor Order</p>
        <p className="font-mono font-bold text-lg mb-6">{order.order_number}</p>

        <div className="flex gap-4 justify-center">
          <Link to="/orders" className="btn btn-outline">Lihat Pesanan</Link>
          <Link to="/" className="btn btn-primary">Kembali ke Home</Link>
        </div>
      </div>
    </div>
  );
}
```

### Langkah 3 — Buat Halaman Riwayat Order

Ganti isi `src/pages/OrderHistoryPage.tsx`:

```tsx
// src/pages/OrderHistoryPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedPage from '../components/ProtectedPage';
import { apiFetch } from '../utils/api';
import { formatRupiah, formatDate } from '../utils/format';
import type { Order } from '../types';

const statusLabel: Record<string, { label: string; className: string }> = {
  settlement: { label: 'Lunas',     className: 'badge-success' },
  pending:    { label: 'Menunggu',  className: 'badge-warning' },
  expire:     { label: 'Kadaluarsa',className: 'badge-error'   },
  cancel:     { label: 'Batal',     className: 'badge-error'   },
};

export default function OrderHistoryPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await apiFetch<{ data: Order[] }>('/orders/my');
        setOrders(res.data);
      } catch (err) {
        setError('Gagal memuat riwayat pesanan');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <ProtectedPage>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>

        {loading && <div className="text-center py-10"><span className="loading loading-spinner" /></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20 text-base-content/50">
            <p>Belum ada pesanan</p>
            <Link to="/" className="btn btn-primary mt-4">Cari Event</Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = statusLabel[order.status] ?? { label: order.status, className: 'badge-ghost' };
            return (
              <div key={order.id} className="card bg-base-100 shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-base-content/60">{order.order_number}</p>
                    <p className="font-bold text-lg">{formatRupiah(order.total_amount)}</p>
                    <p className="text-sm text-base-content/60">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedPage>
  );
}
```

### Checklist Fase 3

- [ ] Halaman checkout menampilkan ringkasan tiket yang dipilih
- [ ] POST order ke backend berhasil
- [ ] Redirect ke `payment_url` Midtrans berfungsi
- [ ] Halaman status pembayaran membaca `order_number` dari URL
- [ ] Polling status berjalan setiap 3 detik saat status masih `pending`
- [ ] Semua status ditampilkan dengan benar (settlement, pending, expire, cancel)
- [ ] Halaman riwayat order menampilkan semua pesanan user

---

## Fase 4 — Dashboard Organizer

### Langkah 1 — Buat Halaman Dashboard Organizer

Ganti isi `src/pages/OrganizerDashboardPage.tsx`:

```tsx
// src/pages/OrganizerDashboardPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedPage from '../components/ProtectedPage';
import { apiFetch } from '../utils/api';
import { formatDate } from '../utils/format';
import type { Event } from '../types';

export default function OrganizerDashboardPage() {
  const [events, setEvents]   = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await apiFetch<{ data: Event[] }>('/events/my');
        setEvents(res.data);
      } catch (err) {
        setError('Gagal memuat event');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    try {
      await apiFetch(`/events/${id}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert('Gagal menghapus event');
    }
  }

  return (
    <ProtectedPage requiredRole="organizer">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Event Saya</h1>
          <Link to="/organizer/events/new" className="btn btn-primary">
            + Buat Event Baru
          </Link>
        </div>

        {loading && <div className="text-center py-10"><span className="loading loading-spinner" /></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 text-base-content/50">
            Belum ada event. Buat event pertamamu!
          </div>
        )}

        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div key={event.id} className="card bg-base-100 shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`badge mb-1 ${event.status === 'published' ? 'badge-success' : 'badge-ghost'}`}>
                    {event.status}
                  </span>
                  <h2 className="font-bold text-lg">{event.title}</h2>
                  <p className="text-sm text-base-content/60">📅 {formatDate(event.event_date)}</p>
                  <p className="text-sm text-base-content/60">📍 {event.location}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className="btn btn-sm btn-outline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="btn btn-sm btn-error btn-outline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}
```

### Langkah 2 — Buat Form Event (Buat & Edit)

Satu halaman ini dipakai untuk buat event baru dan edit event yang sudah ada.
Ganti isi `src/pages/OrganizerEventFormPage.tsx`:

```tsx
// src/pages/OrganizerEventFormPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedPage from '../components/ProtectedPage';
import { apiFetch } from '../utils/api';
import type { Event, Category, EventStatus } from '../types';

export default function OrganizerEventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id; // true kalau ada :id di URL (mode edit)

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // State form
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation]     = useState('');
  const [eventDate, setEventDate]   = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus]         = useState<EventStatus>('draft');

  useEffect(() => {
    // Fetch daftar kategori
    apiFetch<{ data: Category[] }>('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});

    // Kalau mode edit, fetch data event yang akan diedit
    if (isEditing) {
      apiFetch<{ data: Event }>(`/events/${id}`)
        .then((res) => {
          const e = res.data;
          setTitle(e.title);
          setDescription(e.description);
          setLocation(e.location);
          setEventDate(e.event_date.slice(0, 16)); // format untuk input datetime-local
          setCategoryId(String(e.category_id));
          setStatus(e.status);
        })
        .catch(() => setError('Gagal memuat data event'));
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      location,
      event_date: eventDate,
      category_id: Number(categoryId),
      status,
    };

    try {
      if (isEditing) {
        await apiFetch(`/events/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      navigate('/organizer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage requiredRole="organizer">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Event' : 'Buat Event Baru'}
        </h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Judul Event</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Deskripsi</label>
            <textarea
              className="textarea textarea-bordered w-full h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Lokasi</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Tanggal & Waktu</label>
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Kategori</label>
            <select
              className="select select-bordered w-full"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="select select-bordered w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => navigate('/organizer')}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading
                ? <span className="loading loading-spinner" />
                : isEditing ? 'Simpan Perubahan' : 'Buat Event'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedPage>
  );
}
```

### Checklist Fase 4

- [ ] Dashboard organizer menampilkan daftar event milik organizer
- [ ] Tombol "Buat Event Baru" membuka form kosong
- [ ] Tombol "Edit" membuka form yang sudah terisi data event
- [ ] Form buat event berhasil POST ke backend
- [ ] Form edit event berhasil PUT ke backend
- [ ] Tombol hapus event berfungsi dengan konfirmasi
- [ ] Semua halaman organizer tidak bisa diakses oleh buyer

---

## Fase 5 — Finishing & Deploy

### Langkah 1 — Buat Halaman 404

Ganti isi `src/pages/NotFoundPage.tsx`:

```tsx
// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-8xl font-bold text-base-content/20">404</h1>
      <p className="text-xl mt-4 mb-6">Halaman tidak ditemukan</p>
      <Link to="/" className="btn btn-primary">Kembali ke Home</Link>
    </div>
  );
}
```

### Langkah 2 — Cek sebelum deploy

```bash
# Pastikan tidak ada error TypeScript
npx tsc --noEmit

# Build project
npm run build
```

Kalau ada error TypeScript, perbaiki dulu sebelum lanjut.

### Langkah 3 — Deploy ke Vercel

1. Push kode ke GitHub
2. Buka [vercel.com](https://vercel.com) → login dengan GitHub
3. Klik "New Project" → pilih repo `entrans`
4. Di bagian "Environment Variables", tambahkan:
   - Nama: `VITE_API_BASE_URL`  
   - Value: `https://api.entrans.id` (URL backend production)
5. Klik "Deploy"

Setelah deploy, buat file `vercel.json` di root project agar React Router tidak 404 saat refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Lalu update file `src/utils/api.ts` agar BASE_URL pakai environment variable:

```ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
```

Dan tambahkan type declaration di `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Checklist Fase 5

- [ ] Halaman 404 tampil untuk route yang tidak ada
- [ ] `npx tsc --noEmit` tidak ada error
- [ ] `npm run build` berhasil tanpa error
- [ ] `vercel.json` sudah dibuat
- [ ] `VITE_API_BASE_URL` sudah pakai environment variable
- [ ] Deploy ke Vercel berhasil
- [ ] Coba akses URL production dan refresh halaman — tidak 404

---

## Catatan Penting

### Soal `payment_url` Midtrans

1. Setelah POST `/orders`, backend return `payment_url` → langsung `window.location.href = payment_url`
2. Midtrans akan redirect kembali ke URL yang dikonfigurasi backend, misal `/payment/status?order_number=ENTR-12345`
3. **Jangan percaya query param dari Midtrans** — selalu cek status dari backend dengan `GET /orders/:order_number/status`
4. Kalau user kembali ke halaman checkout tanpa bayar, sessionStorage sudah dihapus saat order dibuat, jadi mereka akan diarahkan ke home

### Urutan Belajar yang Disarankan

Kalau ada bagian yang tidak dimengerti, pelajari konsep ini dulu sebelum lanjut:

| Konsep | Dipakai di |
|--------|-----------|
| `useState` | Semua halaman |
| `useEffect` | Fetch data saat halaman dibuka |
| `useParams` | Ambil `:id` dari URL |
| `useNavigate` | Redirect secara programatik |
| `useSearchParams` | Baca query param (`?order_number=...`) |
| `async/await` | Semua pemanggilan API |
| `localStorage` | Simpan token login |

### Jika Ada Error CORS dari Backend

Ini harus diperbaiki di backend Laravel, bukan di frontend. Minta temanmu yang handle backend untuk:

```bash
php artisan config:publish cors
```

Lalu edit `config/cors.php` dan tambahkan URL frontend di `allowed_origins`.

---

*Roadmap ini dibuat untuk project Entrans — event management marketplace.*  
*Stack: React + TypeScript · Tailwind CSS + DaisyUI · React Router · Fetch API*
