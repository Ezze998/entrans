import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // Helper untuk mengecek menu aktif
    const isActive = (path: string, exact = true) => {
        if (exact) {
            return currentPath === path;
        }
        return currentPath.startsWith(path);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">

            {/* SIDEBAR PANEL */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-20 shadow-xl">
                {/* Brand / Logo */}
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <span className="text-xl font-black tracking-wider text-amber-500">ENTRANS</span>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">Admin</span>
                </div>

                {/* Navigation Menus */}
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {/* Dashboard */}
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-sm ${isActive('/admin/dashboard')
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        Dashboard Overview
                    </Link>

                    {/* Kategori */}
                    <Link
                        to="/admin/categories"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-sm ${isActive('/admin/categories') || isActive('/admin/categories/new')
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">category</span>
                        Manajemen Kategori
                    </Link>

                    {/* MENAMBAHKAN: Manajemen Event */}
                    <Link
                        to="/admin/events"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-sm ${isActive('/admin/events', false) // Menggunakan false agar rute /admin/events/:id tetap aktif
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        Manajemen Event
                    </Link>

                    {/* MENAMBAHKAN: Manajemen Tiket */}
                    <Link
                        to="/admin/tickets"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-sm ${isActive('/admin/tickets')
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                        Manajemen Tiket
                    </Link>

                    <Link
                        to="/admin/organizers"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 text-sm ${isActive('/admin/organizers')
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">group</span>
                        Daftar Organizer
                    </Link>
                </nav>

                {/* Footer Sidebar / Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white py-2.5 rounded-xl text-sm font-bold transition duration-200"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 pl-64 flex flex-col min-h-screen">

                {/* TOP BAR / HEADER */}
                <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                    <div className="font-extrabold text-slate-700 text-base">Control Center</div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                        >
                            <span className="material-symbols-outlined text-[14px]">home</span>
                            Halaman Utama
                        </Link>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 font-black text-sm flex items-center justify-center">
                                A
                            </div>
                            <span className="text-sm font-bold text-slate-700">Hi, System Admin</span>
                        </div>
                    </div>
                </header>

                {/* INTERCHANGEABLE CONTENT ROUTE */}
                <main className="flex-1 p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>

        </div>
    );
}