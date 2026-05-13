import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedPage from './components/ProtectedPage';

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
import MyOrdersPage from './pages/MyOrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        
        {/* Halaman yang butuh login */}
        <Route path="/checkout" element={<ProtectedPage><CheckoutPage /></ProtectedPage>} />
        <Route path="/payment/status" element={<ProtectedPage><PaymentStatusPage /></ProtectedPage>} />
        
        <Route path="/orders" element={<ProtectedPage><MyOrdersPage /></ProtectedPage>} />
        
        {/* Halaman khusus organizer/admin */}
        <Route path="/organizer" element={<ProtectedPage requiredRole="organizer"><OrganizerDashboardPage /></ProtectedPage>} />
        <Route path="/organizer/events/new" element={<ProtectedPage requiredRole="organizer"><OrganizerEventFormPage /></ProtectedPage>} />
        <Route path="/organizer/events/:id/edit" element={<ProtectedPage requiredRole="organizer"><OrganizerEventFormPage /></ProtectedPage>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}