// src/pages/OrganizerEventsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface EventItem {
  id: number;
  title: string;
  location: string;
  event_date: string;
  status: string;
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const token = localStorage.getItem('token');

  // Fungsi untuk memuat ulang daftar event dari API
  const fetchEvents = async () => {
    try {
      // 💥 PERUBAHAN DISINI: diarahkan ke endpoint khusus organizer
      const res = await fetch('http://localhost:8000/api/organizer/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
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
  }, []);

  // Fungsi Handler untuk menghapus Event berdasarkan ID
  const handleDelete = async (id: number, title: string) => {
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus event "${title}"? Tindakan ini tidak dapat dibatalkan.`);

    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const resData = await res.json();

      if (res.ok || resData.success) {
        alert("Event berhasil dihapus!");
        // Perbarui state lokal agar baris data langsung hilang dari tabel tanpa harus reload halaman penuh
        setEvents(prevEvents => prevEvents.filter(ev => ev.id !== id));
      } else {
        alert("Gagal menghapus data: " + (resData.message || JSON.stringify(resData.errors)));
      }
    } catch (error) {
      console.error("Error saat menghapus event:", error);
      alert("Terjadi kegagalan koneksi sistem backend saat mencoba menghapus data.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📅 Daftar Manajemen Event</h2>
          <p className="text-gray-500 text-xs mt-1">Kelola semua event yang telah Anda daftarkan di platform</p>
        </div>
        <Link to="/organizer/events/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
          + Buat Event Baru
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-bold">Nama Event</th>
              <th className="px-6 py-3 font-bold">Lokasi</th>
              <th className="px-6 py-3 font-bold">Tanggal</th>
              <th className="px-6 py-3 font-bold">Status</th>
              <th className="px-6 py-3 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? events.map(ev => (
              <tr key={ev.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">{ev.title}</td>
                <td className="px-6 py-4 text-slate-600">{ev.location}</td>
                <td className="px-6 py-4 text-slate-600">
                  {ev.event_date ? ev.event_date.substring(0, 16).replace('T', ' ') : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${ev.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {ev.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <Link to={`/organizer/events/${ev.id}/edit`} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                      Edit Data
                    </Link>
                    <button
                      onClick={() => handleDelete(ev.id, ev.title)}
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
                  Belum ada data event yang tersedia. Silakan buat event baru!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}