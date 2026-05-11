// src/layouts/PublicLayout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function PublicLayout() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <Link to="/" className="text-xl font-bold">
            Entrans
          </Link>
        </div>

        <div className="flex-none gap-2">
          {!token ? (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost">
                {user?.name ?? 'User'}
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                {user?.role === 'organizer' && (
                  <li>
                    <Link to="/organizer">Dashboard Organizer</Link>
                  </li>
                )}

                <li>
                  <Link to="/orders">My Orders</Link>
                </li>

                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <aside>
          <p>© {new Date().getFullYear()} Entrans — All rights reserved</p>
        </aside>
      </footer>
    </div>
  );
}