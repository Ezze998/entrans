import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import { formatDate, formatRupiah } from '../utils/format';
import type { Event } from '../types';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await apiFetch<{ data: Event }>(`/events/${id}`);
        setEvent(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchDetail();
  }, [id]);

  const updateQty = (ticketId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + delta)
    }));
  };

  const calculateTotal = () => {
    if (!event?.tickets) return 0;
    return event.tickets.reduce((acc, t) => acc + (t.price * (quantities[t.id] || 0)), 0);
  };

  const handleCheckout = () => {
    const selected = event?.tickets
      ?.filter(t => (quantities[t.id] || 0) > 0)
      .map(t => ({
        ticket_id: t.id,
        ticket_type: t.ticket_type, // Pastikan ini sesuai dengan field di database
        price: t.price,
        qty: quantities[t.id]
      }));

    if (!selected || selected.length === 0) {
      alert("Please select at least one ticket first!");
      return;
    }

    // Mengirim data ke route /checkout melalui state
    navigate('/checkout', {
      state: {
        event,
        selectedTickets: selected,
        total: calculateTotal()
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  if (!event) return <div className="text-center py-20">Event tidak ditemukan.</div>;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <main className="pt-24 pb-20 max-w-[1280px] mx-auto px-8">
        <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-sm border border-gray-100">
          <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200" className="w-full h-full object-cover" alt={event.title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-[#B2D5FF] text-[#001d35] text-[12px] font-bold uppercase rounded-full">
                {event.category?.category_name || 'Uncategorized'}
              </span>
              <span className="text-gray-400 text-sm font-bold ml-2">
                Published by <span className="text-black">{event.user?.name || 'Organizer'}</span>
              </span>
            </div>

            <h1 className="text-5xl font-black text-black mb-8 leading-tight tracking-tighter">
              {event.title}
            </h1>

            <div className="flex flex-col md:flex-row gap-8 text-gray-600 font-bold mb-12">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">location_on</span>
                <span>{event.location}</span>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-2xl font-bold text-black mb-4">About the Event</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-6">Location</h2>
              <div className="w-full aspect-video rounded-3xl overflow-hidden border border-gray-100 mb-4 bg-gray-50">
                <img src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/106.8272,-6.1751,12/800x450?access_token=YOUR_TOKEN" className="w-full h-full object-cover grayscale opacity-70" alt="map" />
              </div>
              <p className="text-gray-500 font-bold text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span> {event.location}
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 bg-[#fbf9fa] rounded-3xl border border-gray-100 p-8 flex flex-col gap-6 shadow-sm">
              <h3 className="text-2xl font-black text-black">Tickets</h3>

              <div className="space-y-4">
                {event.tickets?.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-2xl p-5 bg-white hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-black">{ticket.ticket_type}</h4>
                      <span className="font-black text-lg text-black">{formatRupiah(ticket.price)}</span>
                    </div>

                    {/* TAMPILKAN STOK DI SINI */}
                    <p className="text-[12px] text-gray-500 font-medium mb-4">
                      Sisa Kuota: <span className="text-black font-bold">{ticket.stock} tiket</span>
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#0F172A] font-bold flex items-center gap-1">
                        {ticket.stock > 0 ? (
                          <>
                            <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                            Available
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm text-red-500">cancel</span>
                            Sold Out
                          </>
                        )}
                      </span>

                      <div className="flex items-center border border-gray-100 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateQty(ticket.id, -1)}
                          className="px-3 py-1 font-bold text-gray-500 hover:text-black"
                        >-</button>

                        <span className="px-3 py-1 font-bold text-black">{quantities[ticket.id] || 0}</span>

                        <button
                          onClick={() => updateQty(ticket.id, 1)}
                          // CEGAH PEMBELIAN MELEBIHI STOK
                          disabled={(quantities[ticket.id] || 0) >= ticket.stock}
                          className={`px-3 py-1 font-bold ${(quantities[ticket.id] || 0) >= ticket.stock ? 'text-gray-300' : 'text-gray-500 hover:text-black'}`}
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 mt-2">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-400">Total</span>
                  <span className="text-3xl font-black text-black">{formatRupiah(calculateTotal())}</span>
                </div>
                {/* PERBAIKAN: Menambahkan onClick={handleCheckout} */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-black active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
                >
                  Buy Tickets
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span> Secure transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}