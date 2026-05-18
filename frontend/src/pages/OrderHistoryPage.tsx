import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Struktur Data Laporan Penjualan untuk Organizer (Disesuaikan dengan Backend Laravel)
interface OrderDetail {
  id: number;
  order_id: number;
  ticket_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  ticket?: {
    ticket_type: string; // Diubah ke ticket_type sesuai database Laravel
  };
}

interface OrderReport {
  id: number;
  user_id: number;
  event_id: number;
  order_number: string;
  total_amount: number; // Diubah ke total_amount
  status: 'pending' | 'settlement' | 'cancel' | 'expire'; // Disesuaikan dengan status Midtrans
  created_at: string;
  event?: {
    title: string;
  };
  order_details: OrderDetail[];
}

export default function OrderHistoryPage() {
  const [salesReports, setSalesReports] = useState<OrderReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSalesHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizer/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          }
        });
        const resData = await response.json();
        
        if (response.ok && resData.success) {
          setSalesReports(resData.data);
        } else {
          setSalesReports([]); // Kosongkan jika gagal
        }
      } catch (error) {
        console.error("Gagal memuat riwayat order organizer:", error);
        setSalesReports([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchSalesHistory();
  }, [token]);

  // Hitung total ringkasan pendapatan dari tiket berstatus 'settlement' (Lunas)
  const totalRevenue = salesReports
    .filter(order => order.status === 'settlement')
    .reduce((sum, order) => sum + Number(order.total_amount), 0);

  const totalTicketsSold = salesReports
    .filter(order => order.status === 'settlement')
    .reduce((sum, order) => sum + order.order_details.reduce((tSum, det) => tSum + det.quantity, 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR */}
      <nav className="bg-slate-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/organizer" className="text-xl font-black text-amber-500 tracking-wider hover:underline">
              ORGANIZER
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-sm font-medium text-gray-300">Riwayat Penjualan Tiket</span>
          </div>
          <Link to="/organizer" className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition">
            &larr; Kembali ke Dashboard
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Laporan Transaksi Masuk</h2>
          <p className="text-gray-500 text-sm">Pantau status pembayaran tiket yang dipesan oleh buyer secara real-time.</p>
        </div>

        {/* CARD RINGKASAN (STATISTIK) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-400 uppercase">Total Tiket Terjual (Lunas)</span>
            <span className="text-3xl font-black text-slate-800 mt-2">{totalTicketsSold} <span className="text-sm font-normal text-gray-500">Tiket</span></span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-400 uppercase">Total Pendapatan Bersih</span>
            <span className="text-3xl font-black text-green-600 mt-2">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* TABEL DATA ORDERS */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat data transaksi...</div>
        ) : salesReports.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border shadow-sm text-gray-500">
            Belum ada data pemesanan tiket masuk untuk event Anda.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4">Nomor Order</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Rincian Tiket</th>
                    <th className="p-4">Total Bayar</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tanggal Order</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 divide-y divide-gray-100 text-sm">
                  {salesReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-blue-600">{report.order_number}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{report.event?.title || "Event Tidak Diketahui"}</div>
                        <div className="text-xs text-gray-400">ID Pembeli: {report.user_id}</div>
                      </td>
                      <td className="p-4">
                        {report.order_details.map((detail) => (
                          <div key={detail.id} className="font-medium">
                            {detail.ticket?.ticket_type || "Tiket"} x{detail.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        Rp {Number(report.total_amount).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          report.status === 'settlement' ? 'bg-green-100 text-green-800' :
                          report.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(report.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
