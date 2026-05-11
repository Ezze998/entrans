// src/layouts/OrganizerLayout.tsx
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function OrganizerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/organizer' },
    { label: 'My Events', path: '/organizer/events' },
    { label: 'Create Event', path: '/organizer/events/new' },
  ];

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />

      {/* MAIN CONTENT */}
      <div className="drawer-content flex flex-col">
        {/* Top Navbar */}
        <div className="navbar bg-base-100 shadow-md px-4">
          <div className="flex-none lg:hidden">
            <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
              ☰
            </label>
          </div>

          <div className="flex-1">
            <Link to="/" className="text-lg font-bold">
              Entrans Organizer
            </Link>
          </div>

          <div className="flex-none gap-2">
            <span className="hidden md:block font-medium">
              {user?.name}
            </span>
            <button onClick={handleLogout} className="btn btn-sm btn-error">
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-base-200">
          <Outlet />
        </main>
      </div>

      {/* SIDEBAR */}
      <div className="drawer-side">
        <label htmlFor="drawer-toggle" className="drawer-overlay"></label>

        <aside className="w-64 min-h-full bg-base-100 p-4">
          <h2 className="text-xl font-bold mb-6">Organizer Panel</h2>

          <ul className="menu space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/organizer'}
                  className={({ isActive }) =>
                    isActive ? 'active font-semibold' : ''
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}

            <div className="divider" />

            <li>
              <Link to="/">← Back to Public</Link>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}