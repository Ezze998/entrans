import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface OrganizerItem {
    id: number;
    name: string;
    email: string;
    status?: 'active' | 'suspended'; 
    created_at?: string;
}

export default function AdminOrganizersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [organizers, setOrganizers] = useState<OrganizerItem[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const querySearch = searchParams.get('search');
        if (querySearch) {
            setSearchTerm(querySearch);
        }
    }, [searchParams]);

    const fetchOrganizers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/organizers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (res.ok) {
                const resData = await res.json();
                const dataArray = resData.data || resData;
                if (Array.isArray(dataArray)) {
                    setOrganizers(dataArray);
                }
            }
        } catch (error) {
            console.error("Gagal memuat daftar akun organizer:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizers();
    }, [token]);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        if (val) {
            setSearchParams({ search: val });
        } else {
            searchParams.delete('search');
            setSearchParams(searchParams);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        const confirmMsg = currentStatus === 'suspended' 
            ? "Apakah Anda yakin ingin mengaktifkan kembali akun organizer ini?" 
            : "Apakah Anda yakin ingin menangguhkan (suspend) akun organizer ini? Mereka tidak akan bisa membuat event baru.";
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/organizers/${id}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                setOrganizers(prev => prev.map(org => 
                    org.id === id ? { ...org, status: nextStatus as 'active' | 'suspended' } : org
                ));
            } else {
                alert("Gagal memperbarui status akun organizer.");
            }
        } catch (error) {
            console.error("Terjadi kesalahan sistem saat mengubah status:", error);
        }
    };

    const filteredOrganizers = organizers.filter(org =>
        org.id.toString() === searchTerm ||
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6 text-center text-slate-500 mt-10 font-sans flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Memuat basis data organizer...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow border font-sans">
            {/* Header Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">👥 Direktori Akun Organizer</h2>
                    <p className="text-gray-500 text-xs mt-1">Daftar entitas penyelenggara event yang terdaftar dalam sistem ENTRANS</p>
                </div>

                {/* Input Pencarian */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Cari ID, nama, atau email..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none w-full md:w-64"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 text-xs rounded-lg font-bold transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Tabel Direktori */}
            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-bold">ID</th>
                            <th className="px-6 py-3 font-bold">Nama Lengkap / Instansi</th>
                            <th className="px-6 py-3 font-bold">Alamat Email</th>
                            <th className="px-6 py-3 font-bold">Status</th>
                            <th className="px-6 py-3 font-bold">Bergabung Pada</th>
                            <th className="px-6 py-3 font-bold text-center">Aksi Kontrol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrganizers.length > 0 ? filteredOrganizers.map(org => {
                            const currentStatus = org.status || 'active'; 
                            return (
                                <tr key={org.id} className="bg-white border-b hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{org.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{org.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{org.email}</td>
                                    
                                    {/* Kolom Badge Status */}
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            currentStatus === 'suspended' 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {currentStatus === 'suspended' ? 'DITANGGUHKAN' : 'AKTIF'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {org.created_at ? org.created_at.substring(0, 10) : '-'}
                                    </td>

                                    {/* Kolom Tombol Aksi Kendali Admin */}
                                    <td className="px-6 py-4 text-center space-x-3 whitespace-nowrap">
                                        <button 
                                            onClick={() => navigate(`/admin/events?search=${org.id}`)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors"
                                            title="Lihat semua event yang dibuat oleh organizer ini"
                                        >
                                            Lihat Event
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(org.id, currentStatus)}
                                            className={`text-xs font-bold transition-colors ${
                                                currentStatus === 'suspended' 
                                                    ? 'text-emerald-600 hover:text-emerald-800' 
                                                    : 'text-red-500 hover:text-red-700'
                                            }`}
                                        >
                                            {currentStatus === 'suspended' ? 'Aktifkan Akun' : 'Suspend'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-400 font-medium">
                                    Organizer tidak ditemukan atau tidak ada dalam sistem.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}