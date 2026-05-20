import { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';

interface Ticket {
  id: number;
  ticket_type: string;
  price: string | number;
  stock: number;
  event_id: number;
}

interface EventDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  status: string;
  category_id: number;
  image?: string; 
  tickets?: Ticket[]; 
}

export default function OrganizerEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem('token');

  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // 1. Fetch Data Event
        const eventRes = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (eventRes.ok) {
          const resData = await eventRes.json();
          if (resData.success && resData.data) {
            setEventData(resData.data);
            if (resData.data.tickets && Array.isArray(resData.data.tickets)) {
              setTickets(resData.data.tickets);
            }
          }
        }

        // 2. Fetch Data Tiket (Sebagai fallback jika API event tidak mengembalikan data tiket)
        const ticketRes = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (ticketRes.ok) {
          const tResData = await ticketRes.json();
          const allTickets = Array.isArray(tResData.data) ? tResData.data : Array.isArray(tResData) ? tResData : [];
          // Filter hanya tiket yang event_id nya cocok dengan ID halaman ini
          const eventTickets = allTickets.filter((t: Ticket) => t.event_id.toString() === id);
          if (eventTickets.length > 0) {
             setTickets(eventTickets);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data detail event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id, token]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500 mt-10">Memuat detail event...</div>;
  }

  if (!eventData) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Tidak Ditemukan</h2>
        <Link to="/organizer/events" className="text-blue-600 hover:underline mt-4 inline-block">Kembali ke Daftar Event</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans mt-6">
      {/* Header & Aksi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🔍 Detail Event</h2>
          <p className="text-slate-500 text-sm mt-1">Lihat informasi lengkap event dan kelola tiket yang terdaftar.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/organizer/events" 
            className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-4 py-2 rounded-lg font-medium text-sm transition"
          >
            &larr; Kembali
          </Link>
          <Link 
            to={`/organizer/events/${id}/edit`} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm"
          >
            ⚙️ Edit Data Event
          </Link>
        </div>
      </div>

      {/* Kartu Informasi Event */}
      <div className="bg-white rounded-xl shadow border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {eventData.image ? (
              <img src={eventData.image} alt={eventData.title} className="w-full h-auto rounded-lg object-cover shadow-sm" />
            ) : (
              <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-dashed">
                Tidak ada poster
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-3">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${eventData.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {eventData.status.toUpperCase()}
              </span>
              <h3 className="text-3xl font-extrabold text-slate-900">{eventData.title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{eventData.description || 'Tidak ada deskripsi tersedia.'}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">📍 Lokasi</p>
                <p className="font-medium text-slate-800">{eventData.location}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">🗓️ Tanggal Pelaksanaan</p>
                <p className="font-medium text-slate-800">
                  {eventData.event_date ? eventData.event_date.replace('T', ' ').substring(0, 16) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Tiket */}
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-bold text-slate-800">🎟️ Daftar Tiket Event Ini</h3>
          {/* Tombol Tambah Tiket di arahkan ke halaman pembuatan tiket baru */}
          <Link 
            to="/organizer/tickets/new" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm"
          >
            + Tambah Tiket
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 font-bold">Nama Tiket</th>
                <th className="px-6 py-3 font-bold">Harga</th>
                <th className="px-6 py-3 font-bold text-center">Kuota (Stok)</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map(ticket => (
                <tr key={ticket.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{ticket.ticket_type}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    Rp {Number(ticket.price).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{ticket.stock}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400 font-medium">
                    Belum ada tiket yang ditambahkan untuk event ini. Silakan tambah tiket.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}