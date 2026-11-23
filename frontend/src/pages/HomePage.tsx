import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import { formatDate, formatRupiah } from '../utils/format';
import type { Event } from '../types';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const ev = await apiFetch<{ data: Event[] }>('/events');
        console.log('Fetched Events:', ev);
        if (ev && ev.data) {
          setEvents(ev.data);
        } else {
          setEvents([]);
        }
      } catch (e) { 
        console.error(e);
        setLoadError(e instanceof Error ? e.message : 'Gagal memuat event.');
      } finally { 
        setLoading(false); 
      }
    }
    fetchData();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#fbf9fa] min-h-screen text-black antialiased selection:bg-black selection:text-white">
      <Navbar />

      <main>
        {/* ================= 1. DISCOVER / HERO SECTION ================= */}
        <section 
          id="discover" 
          className="relative w-full h-[640px] flex items-center justify-center overflow-hidden bg-black pt-20"
        >
          <div className="absolute inset-0 opacity-60">
            <img 
              alt="Premium Colorful Concert Backdrop" 
              className="w-full h-full object-cover scale-105 animate-[pulse_8s_infinite]" 
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2000" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbf9fa] via-black/30 to-black/60" />
          
          <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
            <span className="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-gray-200 mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              The Art of Live Experiences
            </span>
            <h1 className="text-[48px] sm:text-[68px] font-black text-white mb-6 leading-[1.05] tracking-tighter">
              Find Your Next <br />Unforgettable Experience
            </h1>
            <p className="text-[16px] sm:text-[18px] text-gray-300 max-w-xl mx-auto mb-10 font-medium leading-relaxed">
              Discover high-end events, executive masterclasses, and curated exclusive gatherings designed for professionals.
            </p>
            <button 
              onClick={() => scrollToSection('events')}
              className="px-8 py-4 bg-white text-black font-extrabold text-[14px] rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] flex items-center gap-2.5 mx-auto"
            >
              Browse Events 
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </button>
          </div>
        </section>

        {/* ================= 2. EVENTS / MARKETPLACE SECTION ================= */}
        <section id="events" className="max-w-[1280px] mx-auto px-8 py-24 scroll-mt-20">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[32px] font-black tracking-tight mb-2">Featured Events</h2>
              <p className="text-gray-500 font-medium">Explore active events and secure your premium access pass instantly.</p>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <span className="loading loading-spinner loading-lg text-black"></span>
              </div>
            ) : loadError ? (
              <div role="alert" className="text-center py-24 bg-white rounded-3xl border border-red-100 p-8 shadow-sm">
                <h4 className="text-lg font-bold text-red-700 mb-2">Events could not be loaded</h4>
                <p className="text-gray-500 text-sm">{loadError}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">event_busy</span>
                <h4 className="text-lg font-bold text-black mb-1">No Events Found</h4>
                <p className="text-gray-400 text-sm">Please check back later.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {events.slice(0, 4).map((event) => {
                    const lowestPrice = event.tickets && event.tickets.length > 0
                      ? Math.min(...event.tickets.map(t => t.price))
                      : null;

                    return (
                      <Link 
                        key={event.id} 
                        to={`/events/${event.id}`} 
                        className="group bg-white rounded-2xl border border-gray-100/80 overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
                      >
                        <div className="h-48 relative overflow-hidden bg-gray-50">
                          <img 
                            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600" 
                            className="w-full h-full object-cover group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" 
                            alt={event.title} 
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg">
                              {event.category?.category_name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-5 flex-grow flex flex-col">
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                            By {event.user?.name || 'Organizer'}
                          </p>
                          <h4 className="text-[17px] font-black text-black mb-4 leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
                            {event.title}
                          </h4>
                          
                          <div className="space-y-2 mb-6 text-[13px] text-gray-500 font-bold">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-gray-400">calendar_month</span>
                              <span>{formatDate(event.event_date)}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-gray-400">location_on</span>
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Pass Starts From</span>
                            <span className="text-[15px] font-black text-black">
                              {lowestPrice ? formatRupiah(lowestPrice) : 'Free Admission'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {events.length > 4 && (
                  <div className="mt-12 flex justify-center">
                    <Link 
                      to="/events" 
                      className="px-8 py-3.5 bg-black text-white text-[14px] font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2.5"
                    >
                      Browse More <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ================= 3. VENUES SECTION ================= */}
        <section id="venues" className="bg-white border-y border-gray-100 py-24 scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-8">
            <div className="max-w-2xl mb-14">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-2">Exclusive Partnership</span>
              <h2 className="text-[32px] font-black tracking-tight text-black mb-3">Our Handpicked Venues</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                We synchronize only with premium standard spaces, stadium complexes, and smart lounges across major metropolitan hubs to serve ultimate comfort.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Venue 1: Gelora Bung Karno */}
              <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-[#fbf9fa] p-4 transition-all hover:shadow-lg">
                <div className="h-48 overflow-hidden rounded-xl mb-4 bg-gray-200">
                  <img 
                    // Link diperbaiki ke gambar stadion megah yang valid
                    src="https://images.unsplash.com/photo-1510051640316-ecc39186b633?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                    alt="Gelora Bung Karno Main Stadium" 
                  />
                </div>
                <h4 className="text-[16px] font-black text-black mb-1">Gelora Bung Karno Main Stadium</h4>
                <p className="text-sm text-gray-400 font-bold">Central Jakarta, DKI Jakarta</p>
              </div>

              {/* Venue 2: Jakarta International Stadium */}
              <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-[#fbf9fa] p-4 transition-all hover:shadow-lg">
                <div className="h-48 overflow-hidden rounded-xl mb-4 bg-gray-200">
                  <img 
                    // Link diperbaiki ke gambar struktur stadion modern yang valid
                    src="https://images.unsplash.com/photo-1568194157720-8eae79a37be1?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                    alt="Jakarta International Stadium" 
                  />
                </div>
                <h4 className="text-[16px] font-black text-black mb-1">Jakarta International Stadium (JIS)</h4>
                <p className="text-sm text-gray-400 font-bold">North Jakarta, DKI Jakarta</p>
              </div>

              {/* Venue 3: Beach City International Stadium */}
              <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-[#fbf9fa] p-4 transition-all hover:shadow-lg">
                <div className="h-48 overflow-hidden rounded-xl mb-4 bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                    alt="Beach City International Stadium" 
                  />
                </div>
                <h4 className="text-[16px] font-black text-black mb-1">Beach City International Stadium</h4>
                <p className="text-sm text-gray-400 font-bold">Ancol Waterfront, Jakarta</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. ABOUT SECTION / FOOTER ================= */}
        <footer id="about" className="bg-black text-white py-20 px-8 scroll-mt-20">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16 border-b border-white/10">
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-[26px] font-black tracking-tighter text-white">Entrans.</h3>
              <p className="text-gray-400 text-[14px] font-medium leading-relaxed max-w-sm">
                Entrans is a high-performance self-service event ticketing ecosystem engineered for smooth check-ins, fully-automated secure payment processes, and premium crowd experiences.
              </p>
            </div>

            <div className="md:col-span-3 space-y-4 md:pl-8">
              <h5 className="text-xs font-black uppercase tracking-widest text-gray-400">Quick Services</h5>
              <ul className="space-y-2.5 text-sm font-bold text-gray-400">
                <li><Link to="/orders" className="hover:text-white transition-colors">My Transactions</Link></li>
                <li><button onClick={() => scrollToSection('discover')} className="hover:text-white transition-colors text-left">Top Catalog</button></li>
                <li><a href="https://dashboard.midtrans.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Payment Support</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-4">
              <h5 className="text-xs font-black uppercase tracking-widest text-gray-400">Secure Processing</h5>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                All transactions on this platform are fully encrypted and verified natively by Midtrans Sandbox Gateways securely.
              </p>
              <div className="flex gap-4 pt-1 text-gray-500 font-bold text-xs">
                <span>IDR Supported</span>
                <span>•</span>
                <span>Automated Callback</span>
              </div>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-600 gap-4">
            <p>© {new Date().getFullYear()} Entrans Ticketing System Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Use</span>
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}