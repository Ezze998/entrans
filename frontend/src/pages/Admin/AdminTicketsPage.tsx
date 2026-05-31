import { useState, useEffect } from 'react';

interface Ticket {
    id: number;
    event_id: number;
    ticket_type: string;
    price: number;
    stock: number;
    event?: {
        title: string;
    };
}

// Interface untuk mengatur state Custom Modal
interface ModalState {
    isOpen: boolean;
    type: 'confirm' | 'status_info';
    title: string;
    message: string;
    ticketId: number | null;
    isSuccess?: boolean;
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token');

    // State untuk mengontrol komponen modal kustom
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        ticketId: null,
    });

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            const data = await res.json();

            if (res.ok && data.data) {
                setTickets(data.data);
            } else if (Array.isArray(data)) {
                setTickets(data);
            }
        } catch (error) {
            console.error('Gagal mengambil data tiket:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [token]);

    // 1. Fungsi untuk memicu munculnya Modal Konfirmasi (Ganti window.confirm)
    const openDeleteConfirmation = (id: number, typeName: string, eventTitle: string) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title: '⚠️ Konfirmasi Moderasi Tiket',
            message: `Apakah Anda yakin ingin menghapus tiket tipe "${typeName}" pada event "${eventTitle}"? Tindakan ini akan menghapus tiket secara permanen dari sistem dashboard platform.`,
            ticketId: id
        });
    };

    // 2. Fungsi Eksekusi utama penghapusan ke API Backend
    const executeDelete = async () => {
        if (!modal.ticketId) return;

        const targetId = modal.ticketId;

        // Tutup modal konfirmasi terlebih dahulu
        setModal(prev => ({ ...prev, isOpen: false }));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/${targetId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                }
            });

            if (res.ok) {
                // Berhasil dihapus, perbarui data di tabel lokal
                setTickets(prevTickets => prevTickets.filter(t => t.id !== targetId));

                // Tampilkan Modal Sukses (Ganti alert)
                setModal({
                    isOpen: true,
                    type: 'status_info',
                    title: 'Berhasil',
                    message: 'Tiket berhasil dihapus oleh Admin dari sistem moderasi!',
                    ticketId: null,
                    isSuccess: true
                });
            } else {
                const errorData = await res.json();

                // Tampilkan Modal Gagal jika ada batasan database/hak akses
                setModal({
                    isOpen: true,
                    type: 'status_info',
                    title: 'Gagal Menghapus',
                    message: `Gagal menghapus tiket: ${errorData.message || 'Terjadi kesalahan hak otorisasi atau restriksi data.'}`,
                    ticketId: null,
                    isSuccess: false
                });
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            setModal({
                isOpen: true,
                type: 'status_info',
                title: 'Gangguan Koneksi',
                message: 'Terjadi kegagalan koneksi sistem saat mencoba menghubungi server backend.',
                ticketId: null,
                isSuccess: false
            });
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans relative">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">🎟️ Pengawasan Seluruh Tiket</h2>
                    <p className="text-sm text-slate-500 mt-1">Pantau harga dan kelola (hapus) tiket yang melanggar ketentuan platform.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Memuat data tiket...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        Belum ada tiket yang terdaftar di sistem.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-slate-600">
                            <tr>
                                <th className="p-4 font-semibold">TIPE TIKET</th>
                                <th className="p-4 font-semibold">NAMA EVENT</th>
                                <th className="p-4 font-semibold">HARGA (IDR)</th>
                                <th className="p-4 font-semibold">KUOTA (STOCK)</th>
                                <th className="p-4 font-semibold text-center">AKSI MODERASI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700">
                            {tickets.map(ticket => {
                                const eventTitle = ticket.event?.title || `ID Event: ${ticket.event_id}`;
                                return (
                                    <tr key={ticket.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">{ticket.ticket_type}</td>
                                        <td className="p-4">{eventTitle}</td>
                                        <td className="p-4">Rp {Number(ticket.price).toLocaleString('id-ID')}</td>
                                        <td className="p-4">{ticket.stock}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openDeleteConfirmation(ticket.id, ticket.ticket_type, eventTitle)}
                                                className="text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-md border border-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ========================================================= */}
            {/* COMPONENT MODAL CUSTOM TAILWIND (PENGGANTI POPUP BROWSER) */}
            {/* ========================================================= */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden transform scale-100 transition-all">

                        {/* Header Modal */}
                        <div className={`p-4 border-b font-bold text-base ${modal.type === 'status_info'
                                ? (modal.isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')
                                : 'bg-amber-50 text-amber-800'
                            }`}>
                            {modal.title}
                        </div>

                        {/* Body Isi Pesan */}
                        <div className="p-5 text-sm text-slate-600 leading-relaxed">
                            {modal.message}
                        </div>

                        {/* Footer Tombol Aksi */}
                        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                            {modal.type === 'confirm' ? (
                                <>
                                    <button
                                        onClick={() => setModal(p => ({ ...p, isOpen: false }))}
                                        className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border rounded-lg hover:bg-slate-100 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={executeDelete}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow transition-all font-bold"
                                    >
                                        Ya, Tetap Hapus
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setModal(p => ({ ...p, isOpen: false }))}
                                    className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow transition-all ${modal.isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    Tutup
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}