import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Interfaces ---
interface EventData {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  location: string;
  image: string | null;
  event_date: string;
  status: 'draft' | 'published' | 'cancelled';
  created_at: string;
  category?: {
    id: number;
    name?: string;
    category_name?: string; 
  };
}

interface SummaryData {
  total_orders: number;
  total_revenue: number;
  total_cancelled: number;
}

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ total_orders: 0, total_revenue: 0, total_cancelled: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, summaryRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizer/events`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
          }).catch(() => null),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizer/summary`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
          }).catch(() => null)
        ]);

        if (eventsRes && eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (eventsData && Array.isArray(eventsData.data)) {
            setEvents(eventsData.data);
          } else if (eventsData && eventsData.success && Array.isArray(eventsData.data)) {
            setEvents(eventsData.data);
          } else if (Array.isArray(eventsData)) {
            setEvents(eventsData);
          }
        }

        if (summaryRes && summaryRes.ok) {
          const summaryDataRes = await summaryRes.json();
          if (summaryDataRes && summaryDataRes.data) {
            setSummary(summaryDataRes.data);
          } else if (summaryDataRes && summaryDataRes.success) {
            setSummary(summaryDataRes.data);
          } else {
            setSummary(summaryDataRes);
          }
        } else {
          setSummary({ total_orders: 0, total_revenue: 0, total_cancelled: 0 });
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organizer/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      });
      const resData = await response.json();
      if (response.ok || resData.success) {
        alert("Event berhasil dihapus.");
        setEvents(events.filter(event => event.id !== id));
      } else {
        alert("Gagal menghapus: " + JSON.stringify(resData.message));
      }
    } catch (error) {
      console.error("Gagal menghapus event:", error);
    }
  };

  const formatRp = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  return (
    <>
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Transaksi</span>
          <span className="text-3xl font-black text-slate-800">
            {summary.total_orders} <span className="text-sm font-medium text-gray-500">Orders</span>
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Pendapatan</span>
          <span className="text-3xl font-black text-green-600">{formatRp(summary.total_revenue)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tiket Dibatalkan</span>
          <span className="text-3xl font-black text-red-500">{summary.total_cancelled} <span className="text-sm font-medium text-gray-400">Orders</span></span>
        </div>
      </div>

      {/* EVENTS SECTION */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Event Aktif Anda</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola daftar event yang sedang atau akan berlangsung.</p>
        </div>
        <Link
          to="/organizer/events/new"
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Buat Event
        </Link>
      </div>

      {/* TABEL DAFTAR EVENT */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Memuat data dashboard...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-3xl">event_busy</span>
          </div>
          <p className="text-slate-600 font-bold text-lg mb-2">Belum ada event</p>
          <p className="text-gray-400 text-sm mb-6">Anda belum membuat event apa pun.</p>
          <Link to="/organizer/events/new" className="text-blue-600 font-bold hover:underline">Buat event sekarang &rarr;</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-5">Poster</th>
                  <th className="p-5">Detail Event</th>
                  <th className="p-5">Venue</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-5">
                      <img
                        src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=200"}
                        alt={event.title}
                        className="w-20 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-slate-800 text-[15px]">{event.title}</div>
                      <div className="flex gap-2 items-center text-xs text-gray-400 font-bold uppercase mt-1">
                        <span>{event.category?.category_name || event.category?.name || "Uncategorized"}</span>
                        <span>•</span>
                        <span>{new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-600">{event.location}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                        event.status === 'published' ? 'bg-green-100 text-green-700' :
                        event.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {/* ✨ Perbaikan: Ditambahkan whitespace-nowrap agar tulisan tidak terpotong menjadi 2 baris */}
                        <Link
                          to={`/organizer/events/${event.id}`}
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-bold transition whitespace-nowrap"
                        >
                          Lihat Detail
                        </Link>
                        {/* ✨ Perbaikan: Ditambahkan whitespace-nowrap juga untuk tombol Hapus */}
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-bold transition whitespace-nowrap"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}