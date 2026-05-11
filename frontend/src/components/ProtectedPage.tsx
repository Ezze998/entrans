import { Navigate } from 'react-router-dom';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole | 'admin';
}

export default function ProtectedPage({ children, requiredRole }: Props) {
  const token    = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user     = userJson ? JSON.parse(userJson) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika butuh role khusus (misal organizer), cegah user biasa masuk
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}