// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedPage from './components/ProtectedPage';
import OrganizerLayout from './components/OrganizerLayout';
import AdminLayout from './components/AdminLayout';

// --- PAGES PUBLIK & CUSTOMER ---
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AboutPage from './pages/About';
import VenuesPage from './pages/VenuesPage';
import NotFoundPage from './pages/NotFoundPage';

// --- PAGES ORGANIZER ---
import OrganizerDashboardPage from './pages/Organizer/OrganizerDashboardPage';
import OrganizerEventsPage from './pages/Organizer/OrganizerEventsPage';
import OrganizerEventFormPage from './pages/Organizer/OrganizerEventFormPage';
import OrganizerEventDetailPage from './pages/Organizer/OrganizerEventDetailPage';
import OrderHistoryPage from './pages/Organizer/OrderHistoryPage';
import OrganizerTicketsPage from './pages/Organizer/OrganizerTicketsPage';
import OrganizerTicketFormPage from './pages/Organizer/OrganizerTicketsFormPage';

// --- PAGES ADMIN ---
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/Admin/AdminCategoriesPage';
import AdminCategoriesFormPage from './pages/Admin/AdminCategoriesFormPage';

import ScrollToTop from './components/ScrollToTop';
import AdminEventsPage from './pages/Admin/AdminEventsPage';
import AdminEventDetailPage from './pages/Admin/AdminEventDetailPage';
import AdminTicketsPage from './pages/Admin/AdminTicketsPage';
import AdminOrganizersPage from './pages/Admin/AdminOrganizersPage';

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
          <Route index element={<OrganizerDashboardPage />} />
          <Route path="/organizer/tickets/new" element={<OrganizerTicketFormPage />} />
          <Route path="events" element={<OrganizerEventsPage />} />
          <Route path="events/new" element={<OrganizerEventFormPage />} />
          <Route path="/organizer/events/:id" element={<OrganizerEventDetailPage />} />
          <Route path="events/:id/edit" element={<OrganizerEventFormPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="/organizer/tickets" element={<OrganizerTicketsPage />} />
          <Route path="tickets" element={<TempTicketsPage />} />
        </Route>

        {/* --- RUTE KHUSUS ADMIN PANEL --- */}
        <Route
          path="/admin"
          element={
            <ProtectedPage requiredRole="admin">
              <AdminLayout />
            </ProtectedPage>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="categories/new" element={<AdminCategoriesFormPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="events/:id" element={<AdminEventDetailPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="organizers" element={<AdminOrganizersPage />} />
        </Route>

        {/* --- 404 NOT FOUND --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}