// src/components/OrganizerLayout.tsx
import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';

export default function OrganizerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data user dari localStorage untuk sapaan di Navbar
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userName = user?.data?.name || user?.name || 'Organizer';

  // Fungsi pengecekan menu aktif untuk styling Sidebar
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-black text-amber-500 tracking-wider">ENTRANS PRO</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <Link 
            to="/organizer" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
              isActive('/organizer') 
                ? 'bg-amber-500 text-slate-900' 
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </Link>
          <Link 
            to="/organizer/events" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              isActive('/organizer/events/new') 
                ? 'bg-amber-500 text-slate-900 font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">event</span>
            Manajemen Event
          </Link>
          <Link 
            to="/organizer/tickets" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              isActive('/organizer/tickets') 
                ? 'bg-amber-500 text-slate-900 font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            Manajemen Tiket
          </Link>
          <Link 
            to="/organizer/orders" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              isActive('/organizer/orders') 
                ? 'bg-amber-500 text-slate-900 font-bold' 
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            Riwayat Penjualan
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* NAVBAR */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex justify-between items-center shrink-0">
          <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
            {isActive('/organizer') ? 'Dashboard Overview' : 'Organizer Panel'}
          </h1>
          
          <div className="flex items-center gap-5 ml-auto">
            <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Halaman Buyer
            </Link>
            
            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-slate-700">Hi, {userName}</span>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <button
              onClick={() => { localStorage.clear(); navigate('/login'); }}
              className="text-sm font-bold text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* SCROLLABLE BODY CONTAINER (Tempat halaman anak akan dirender) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}