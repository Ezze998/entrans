import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto h-20 px-8 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-[24px] font-bold tracking-tighter text-black">
            Entrans
          </Link>
          
          {/* Menu Links: font-bold & text-black agar lebih terbaca */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-bold text-black">
            <Link to="/" className="border-b-2 border-black pb-1">Discover</Link>
            <Link to="#" className="hover:opacity-70 transition-opacity">Events</Link>
            <Link to="#" className="hover:opacity-70 transition-opacity">Venues</Link>
            <Link to="#" className="hover:opacity-70 transition-opacity">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-6">
               {/* Nama User: dipertebal (font-extrabold) & ukuran sedikit naik */}
               <span className="text-base font-extrabold text-black">Hi, {user.name}</span>
               
               {/* Logout: dihapus btn-sm agar lebih besar dan teks bold */}
               <button 
                onClick={() => { localStorage.clear(); navigate('/login'); }} 
                className="btn btn-ghost text-error font-bold text-base"
               >
                 Logout
               </button>
             </div>
          ) : (
            <>
              <Link to="/login" className="hidden md:block px-4 py-2 text-sm font-bold text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-black text-white text-sm font-bold rounded-lg hover:opacity-80 transition-opacity">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}