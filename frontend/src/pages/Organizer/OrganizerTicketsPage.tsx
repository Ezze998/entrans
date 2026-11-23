import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

export default function OrganizerTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token');

    const fetchTickets = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizer/tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
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
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus tiket ini?')) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                alert('Tiket berhasil dihapus!');
                fetchTickets();
            } else {
                const errorData = await res.json();
                alert('Gagal menghapus tiket: ' + JSON.stringify(errorData.message || ''));
            }
        } catch (error) {
            console.error('Error deleting ticket:', error);
            alert('Terjadi kesalahan koneksi.');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">🎟️ Daftar Manajemen Tiket</h2>
                    <p className="text-sm text-slate-500 mt-1">Kelola semua jenis tiket untuk event Anda di sini.</p>
                </div>
                <Link
                    to="/organizer/tickets/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    + Buat Tiket Baru
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Memuat data tiket...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        Belum ada tiket yang dibuat. Silakan buat tiket baru.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-slate-600">
                            <tr>
                                <th className="p-4 font-semibold">TIPE TIKET</th>
                                <th className="p-4 font-semibold">NAMA EVENT</th>
                                <th className="p-4 font-semibold">HARGA (IDR)</th>
                                <th className="p-4 font-semibold">KUOTA (STOCK)</th>
                                <th className="p-4 font-semibold text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700">
                            {tickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{ticket.ticket_type}</td>
                                    <td className="p-4">{ticket.event?.title || `ID Event: ${ticket.event_id}`}</td>
                                    <td className="p-4">Rp {Number(ticket.price).toLocaleString('id-ID')}</td>
                                    <td className="p-4">{ticket.stock}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDelete(ticket.id)}
                                            className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}