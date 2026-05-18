import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parsing data user dari local storage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  
  // Mengambil info spesifik user
  const userName = user?.data?.name || user?.name || 'User';
  // Penting: Pastikan kita mengambil info role untuk validasi tampilan tombol
  const userRole = user?.data?.role || user?.role || 'customer';

  // Fungsi pintar untuk menangani smooth scroll ke elemen tertentu
  const handleScroll = (id: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto h-20 px-8 flex justify-between items-center">

        {/* Sisi Kiri: Logo & Menu Utama */}
        <div className="flex items-center gap-10">
          <Link to="/" className="text-[24px] font-black tracking-tighter text-black">
            Entrans
          </Link>

          {/* Menu Navigasi */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-bold text-gray-500">
            <Link
              to="/"
              onClick={() => handleScroll('discover')}
              className={`${location.pathname === '/' ? 'text-black' : 'hover:text-black'} transition-colors`}
            >
              Discover
            </Link>
            <Link
              to="/events"
              className={`${location.pathname === '/events' ? 'text-black' : 'hover:text-black'} transition-colors`}
            >
              Events
            </Link>
            <Link
              to="/venues"
              className={`${location.pathname === '/venues' ? 'text-black' : 'hover:text-black'} transition-colors`}
            >
              Venues
            </Link>
            <Link
              to="/about"
              className={`${location.pathname === '/about' ? 'text-black' : 'hover:text-black'} transition-colors`}
            >
              About
            </Link>
          </div>
        </div>

        {/* Sisi Kanan: Autentikasi & Tombol Tiket */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-5">
              
              {/* TOMBOL TIKET SAYA (Tetap tampil untuk semuanya yang sudah login) */}
              <Link
                to="/orders"
                className="flex items-center gap-2 text-[13px] font-extrabold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200/60 transition-all active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-3-12h.008v.008H13.5V6zm0 3h.008v.008H13.5V9zm0 3h.008v.008H13.5v-.008zm0 3h.008v.008H13.5v-.008zm-6 3h12a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-12A2.25 2.25 0 0 0 5.25 6.75v10.5A2.25 2.25 0 0 0 7.5 18ZM7.5 12h.008v.008H7.5V12Zm0 3h.008v.008H7.5V15Z" />
                </svg>
                My Tickets
              </Link>

              {/* Garis Pembatas Tipis */}
              <div className="h-5 w-[1px] bg-gray-200 hidden sm:block"></div>

              {/* Nama User */}
              <span className="text-sm font-black text-black hidden sm:inline">
                Hi, {userName}
              </span>

              {/* TOMBOL KHUSUS ORGANIZER - DIPINDAHKAN SEBELUM LOGOUT */}
              {userRole === 'organizer' && (
                <>
                  <div className="h-5 w-[1px] bg-gray-200 hidden sm:block"></div>
                  <Link
                    to="/organizer"
                    className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    Organizer Panel
                  </Link>
                </>
              )}

              {/* Garis Pembatas Tipis Sebelum Logout */}
              <div className="h-5 w-[1px] bg-gray-200 hidden sm:block"></div>

              {/* Tombol Logout Minimalis */}
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                  window.location.reload();
                }}
                className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden md:block px-5 py-2.5 text-sm font-bold text-black border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Login</Link>
              <Link to="/register" className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">Register</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}