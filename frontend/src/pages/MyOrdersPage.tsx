import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TicketModal from '../components/TicketModal'; // Import modal yang baru dibuat
import { apiFetch } from '../utils/api';
import { formatRupiah, formatDate } from '../utils/format';
import type { Order } from '../types';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // State untuk menyimpan order mana yang tiketnya sedang dibuka
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                console.log("Memulai fetch orders...");
                const response = await apiFetch<{ data: any }>('/orders');

                console.log("Data dari API:", response);

                // Cek apakah response.data adalah array
                if (Array.isArray(response.data)) {
                    setOrders(response.data);
                } else if (response.data && typeof response.data === 'object') {
                    // Jika server salah kirim objek tunggal, kita bungkus jadi array
                    setOrders([response.data]);
                } else {
                    setOrders([]);
                }
            } catch (err) {
                console.error("Gagal mengambil data pesanan:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'settlement':
            case 'capture':
                return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Success</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider">Pending</span>;
            case 'cancel':
            case 'expire':
            case 'deny':
                return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">Failed</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">{status}</span>;
        }
    };

    return (
        <div className="bg-[#fbf9fa] min-h-screen">
            <Navbar />
            <main className="pt-28 pb-20 max-w-[1000px] mx-auto px-8">

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-black">My Tickets</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your purchased event tickets and track payment status.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-black"></span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">local_activity</span>
                        <h3 className="text-xl font-bold text-black mb-2">No tickets yet</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't purchased any tickets. Let's find an event!</p>
                        <Link to="/" className="inline-block px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-black transition-all">
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const isPaid = order.status === 'settlement' || order.status === 'capture';
                            const isPending = order.status === 'pending';

                            return (
                                <div key={order.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-all hover:border-gray-300">

                                    {/* Info Pesanan */}
                                    <div className="flex gap-6 w-full md:w-auto">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                            <img
                                                src={order.event?.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200"}
                                                className="w-full h-full object-cover"
                                                alt="event"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-black text-gray-400 uppercase">{order.order_number}</span>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <h3 className="text-lg md:text-xl font-black text-black mb-1 line-clamp-1">
                                                {order.event?.title || 'Unknown Event'}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Harga dan Tombol Aksi */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <div className="text-left md:text-right mb-0 md:mb-4">
                                            <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Total Amount</span>
                                            <span className="text-xl font-black text-black">{formatRupiah(Number(order.total_amount))}</span>
                                        </div>

                                        {/* Logika Tombol berdasarkan Status */}
                                        {isPaid ? (
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-6 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-md"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                                View Ticket
                                            </button>
                                        ) : isPending && order.payment_url ? (
                                            <a
                                                href={order.payment_url}
                                                className="px-6 py-2 bg-[#4648d4] text-white text-sm font-bold rounded-xl hover:bg-[#3b3db5] transition-all shadow-md"
                                            >
                                                Pay Now
                                            </a>
                                        ) : (
                                            <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl">
                                                Unavailable
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

            </main>

            {/* Tampilkan Modal Jika selectedOrder tidak null */}
            {selectedOrder && (
                <TicketModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

        </div>
    );
}