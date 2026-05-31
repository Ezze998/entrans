import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface EventItem {
    id: number;
    title: string;
    location: string;
    event_date: string;
    status: string;
}

// State untuk konfigurasi custom modal
interface ModalState {
    isOpen: boolean;
    type: 'confirm' | 'force_warning' | 'status_info';
    title: string;
    message: string;
    eventId: number | null;
    eventTitle: string;
    isSuccess?: boolean;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const token = localStorage.getItem('token');

    // State untuk mengontrol kemunculan modal kustom
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        eventId: null,
        eventTitle: '',
    });

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (res.ok) {
                const resData = await res.json();
                if (resData && Array.isArray(resData.data)) {
                    setEvents(resData.data);
                } else if (Array.isArray(resData)) {
                    setEvents(resData);
                }
            }
        } catch (e) {
            console.error("Gagal mengambil daftar event:", e);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [token]);

    // Triger awal ketika tombol "Hapus" di tabel diklik
    const openDeleteConfirmation = (id: number, title: string) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title: 'Konfirmasi Penghapusan',
            message: `Apakah Anda yakin ingin menghapus event "${title}"? Tindakan awal ini akan memeriksa dependensi data sistem keuangan terlebih dahulu.`,
            eventId: id,
            eventTitle: title
        });
    };

    // Fungsi inti eksekusi penghapusan (Mendukung Penghapusan Normal & Paksa)
    const executeDelete = async (isForceDelete = false) => {
        if (!modal.eventId) return;

        // Ambil ID sebelum modal ditutup sementara untuk transisi state
        const targetId = modal.eventId;
        const targetTitle = modal.eventTitle;

        // Tutup modal aktif saat ini
        setModal(prev => ({ ...prev, isOpen: false }));

        try {
            // Jika isForceDelete sejati, tambahkan query string ?force=true ke endpoint backend
            const url = `${import.meta.env.VITE_API_BASE_URL}/api/events/${targetId}${isForceDelete ? '?force=true' : ''}`;

            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                }
            });

            const resData = await res.json();

            if (res.ok || resData.success) {
                // Berhasil Dihapus
                setEvents(prevEvents => prevEvents.filter(ev => ev.id !== targetId));
                setModal({
                    isOpen: true,
                    type: 'status_info',
                    title: 'Berhasil',
                    message: isForceDelete
                        ? `Event "${targetTitle}" beserta riwayat transaksi pembelinya berhasil dihapus paksa.`
                        : `Event "${targetTitle}" berhasil dihapus dari sistem.`,
                    eventId: null,
                    eventTitle: '',
                    isSuccess: true
                });
            } else if (res.status === 400 && resData.has_transactions) {
                // REAKSI INTERSEPT: Terdeteksi transaksi terjual dari backend
                setTimeout(() => {
                    setModal({
                        isOpen: true,
                        type: 'force_warning',
                        title: '⚠️ Peringatan: Transaksi Aktif Terdeteksi',
                        message: `Event "${targetTitle}" tidak bisa dihapus secara reguler karena sudah ada user yang membeli tiket. Menghapus paksa tindakan ini akan memusnahkan data finansial & logistik tiket terikat secara permanen! Apakah Anda tetap ingin melaksanakannya?`,
                        eventId: targetId,
                        eventTitle: targetTitle
                    });
                }, 200);
            } else {
                // Kegagalan Validasi Lainnya (Misal Hak Akses Berubah)
                setModal({
                    isOpen: true,
                    type: 'status_info',
                    title: 'Gagal Menghapus',
                    message: resData.message || 'Terjadi kesalahan hak otorisasi sistem.',
                    eventId: null,
                    eventTitle: '',
                    isSuccess: false
                });
            }
        } catch (error) {
            console.error("Error saat menghapus event:", error);
            setModal({
                isOpen: true,
                type: 'status_info',
                title: 'Gangguan Koneksi',
                message: 'Gagal menghubungi server mikro backend. Periksa jaringan Anda.',
                eventId: null,
                eventTitle: '',
                isSuccess: false
            });
        }
    };

    const filteredEvents = events.filter(ev =>
        ev.status === 'published' && (
            ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-6 bg-white rounded-xl shadow border font-sans relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">📅 Pengawasan Seluruh Event</h2>
                    <p className="text-gray-500 text-xs mt-1">Pantau dan moderasi semua event aktif (Published) yang terdaftar oleh Organizer</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Cari event atau lokasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-bold">Nama Event</th>
                            <th className="px-6 py-3 font-bold">Lokasi</th>
                            <th className="px-6 py-3 font-bold">Tanggal</th>
                            <th className="px-6 py-3 font-bold">Status</th>
                            <th className="px-6 py-3 font-bold text-center">Aksi Moderasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.length > 0 ? filteredEvents.map(ev => (
                            <tr key={ev.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900">{ev.title}</td>
                                <td className="px-6 py-4 text-slate-600">{ev.location}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {ev.event_date ? ev.event_date.substring(0, 16).replace('T', ' ') : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800">
                                        {ev.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-4">
                                        <Link to={`/admin/events/${ev.id}`} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                                            Lihat Detail
                                        </Link>
                                        <button
                                            onClick={() => openDeleteConfirmation(ev.id, ev.title)}
                                            className="text-red-600 hover:text-red-800 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                                    {searchTerm ? 'Event tidak ditemukan berdasarkan pencarian Anda.' : 'Belum ada data event terbit (published) di dalam sistem.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ========================================================= */}
            {/* COMPONENT MODAL CUSTOM TAILWIND (REPLACING NATIVE ALERTS) */}
            {/* ========================================================= */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden transform transition-all scale-100">

                        {/* Header Modal */}
                        <div className={`p-4 border-b font-bold text-base flex items-center gap-2 ${modal.type === 'force_warning' ? 'bg-red-50 text-red-700' :
                                modal.type === 'status_info' ? (modal.isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700') :
                                    'bg-slate-50 text-slate-800'
                            }`}>
                            {modal.title}
                        </div>

                        {/* Body Isi Pesan */}
                        <div className="p-5 text-sm text-slate-600 leading-relaxed">
                            {modal.message}
                        </div>

                        {/* Footer Navigasi Kontrol Aksi Tombol */}
                        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                            {modal.type === 'confirm' && (
                                <>
                                    <button
                                        onClick={() => setModal(p => ({ ...p, isOpen: false }))}
                                        className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border rounded-lg hover:bg-slate-100 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => executeDelete(false)}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 shadow transition-all"
                                    >
                                        Lanjutkan Hapus
                                    </button>
                                </>
                            )}

                            {modal.type === 'force_warning' && (
                                <>
                                    <button
                                        onClick={() => setModal(p => ({ ...p, isOpen: false }))}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border rounded-lg hover:bg-slate-100 transition-all"
                                    >
                                        Batalkan, Jangan Hapus
                                    </button>
                                    <button
                                        onClick={() => executeDelete(true)} // Parameter true memicu ?force=true
                                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md hover:shadow-red-200 transition-all font-bold"
                                    >
                                        Ya, Saya Mau Hapus Paksa!
                                    </button>
                                </>
                            )}

                            {modal.type === 'status_info' && (
                                <button
                                    onClick={() => setModal(p => ({ ...p, isOpen: false }))}
                                    className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow transition-all ${modal.isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
                                        }`}
                                >
                                    Selesai
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}