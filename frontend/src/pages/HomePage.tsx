import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import { formatDate, formatRupiah } from '../utils/format';
import type { Event, Category } from '../types';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ev, cat] = await Promise.all([
          apiFetch<{ data: Event[] }>('/events'),
          apiFetch<{ data: Category[] }>('/categories'),
        ]);
        console.log('Fetched Events:', ev);
        setEvents(ev.data);
        setCategories(cat.data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-[#fbf9fa] min-h-screen">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section (Yang kamu sukai) */}
        <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-[#131b2e]">
          <div className="absolute inset-0 opacity-50">
            <img alt="Hero" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=2000" />
          </div>
          <div className="relative z-10 text-center px-8">
            <h1 className="text-[64px] font-bold text-white mb-6 leading-[1.1] tracking-tighter">Find Your Next Experience</h1>
            <p className="text-[18px] text-gray-300 max-w-2xl mx-auto mb-10">Discover premium events, workshops, and exclusive gatherings curated for professionals.</p>
            <button className="px-8 py-4 bg-[#4648d4] text-white font-semibold rounded-xl hover:bg-[#6063ee] transition-colors shadow-lg flex items-center gap-2 mx-auto">
              Browse Events <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Marketplace Section */}
        <section className="max-w-[1280px] mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 space-y-8">
              <div>
                <h3 className="text-[18px] font-bold text-black mb-6">Filter by Category</h3>
                <div className="space-y-4">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#4648d4] focus:ring-[#4648d4]" />
                      <span className="text-[16px] text-gray-600 group-hover:text-black transition-colors">{cat.category_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h3 className="text-[18px] font-bold text-black mb-6">Price Range</h3>
                <input type="range" className="w-full accent-[#4648d4]" />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Rp 0</span>
                  <span>Rp 1.000.000+</span>
                </div>
              </div>
            </aside>

            {/* Event Grid */}
            <div className="lg:col-span-9">
              {loading ? (
                <div className="flex justify-center py-20"><span className="loading loading-spinner text-[#4648d4]"></span></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => {
                    // Logika Harga Terendah
                    const lowestPrice = event.tickets && event.tickets.length > 0 
                      ? Math.min(...event.tickets.map(t => t.price)) 
                      : null;

                    return (
                      <Link key={event.id} to={`/events/${event.id}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-[#e1e0ff]/90 backdrop-blur-sm text-[#07006c] text-[10px] font-bold uppercase rounded-full">
                              {event.category?.category_name}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          {/* Nama Penyelenggara */}
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            By {event.user?.name || 'Organizer'}
                          </p>
                          <h4 className="text-[18px] font-bold text-black mb-4 leading-tight line-clamp-2">
                            {event.title}
                          </h4>
                          <div className="space-y-2 mb-6 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                              <span>{formatDate(event.event_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">location_on</span>
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Starting from</span>
                            <span className="text-[16px] font-black text-black">
                              {lowestPrice ? formatRupiah(lowestPrice) : 'Free'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}