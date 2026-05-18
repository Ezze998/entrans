// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedPage from './components/ProtectedPage';
import OrganizerLayout from './components/OrganizerLayout'; 

import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import OrganizerEventsPage from './pages/OrganizerEventsPage'; // <-- Import halaman baru Anda disini
import OrganizerEventFormPage from './pages/OrganizerEventFormPage';
import NotFoundPage from './pages/NotFoundPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AboutPage from './pages/About';
import VenuesPage from './pages/VenuesPage';
import ScrollToTop from './components/ScrollToTop';
import OrderHistoryPage from './pages/OrderHistoryPage';

const TempTicketsPage = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm font-bold text-slate-800">
    Halaman Manajemen Tiket (Sedang dalam pengembangan)
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* --- RUTE PUBLIK --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* --- RUTE CUSTOMER (Butuh Login) --- */}
        <Route path="/checkout" element={<ProtectedPage><CheckoutPage /></ProtectedPage>} />
        <Route path="/payment/status" element={<ProtectedPage><PaymentStatusPage /></ProtectedPage>} />
        <Route path="/orders" element={<ProtectedPage><MyOrdersPage /></ProtectedPage>} />

        {/* --- RUTE KHUSUS ORGANIZER --- */}
        <Route 
          path="/organizer" 
          element={
            <ProtectedPage requiredRole="organizer">
              <OrganizerLayout />
            </ProtectedPage>
          }
        >
          {/* path="/organizer" (Hanya Ringkasan Pendapatan & Grafik Utama) */}
          <Route index element={<OrganizerDashboardPage />} />
          
          {/* path="/organizer/events" (PERBAIKAN: Menggunakan komponen khusus daftar tabel) */}
          <Route path="events" element={<OrganizerEventsPage />} />
          
          {/* path="/organizer/events/new" */}
          <Route path="events/new" element={<OrganizerEventFormPage />} />
          
          {/* path="/organizer/events/:id/edit" */}
          <Route path="events/:id/edit" element={<OrganizerEventFormPage />} />
          
          {/* path="/organizer/orders" */}
          <Route path="orders" element={<OrderHistoryPage />} />

          {/* path="/organizer/tickets" */}
          <Route path="tickets" element={<TempTicketsPage />} />
        </Route>
        
        {/* --- 404 NOT FOUND --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}