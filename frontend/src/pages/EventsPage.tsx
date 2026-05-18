import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch } from '../utils/api';
import { formatDate, formatRupiah } from '../utils/format';
import type { Event, Category } from '../types';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // State untuk filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceFilter, setPriceFilter] = useState<string>('all'); // State baru untuk filter harga

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch data events dan categories secara paralel
                const [eventsResponse, categoriesResponse] = await Promise.all([
                    apiFetch<{ data: Event[] }>('/events'),
                    apiFetch<{ data: Category[] }>('/categories')
                ]);

                if (eventsResponse && eventsResponse.data) {
                    setEvents(eventsResponse.data);
                }
                if (categoriesResponse && categoriesResponse.data) {
                    setCategories(categoriesResponse.data);
                }
            } catch (e) {
                console.error('Error fetching data in EventsPage:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Logika penyaringan (Filtering Logic)
    const filteredEvents = events.filter((event) => {
        // 1. Filter Kategori
        const matchesCategory =
            selectedCategory === 'all' ||
            event.category_id === Number(selectedCategory);

        // 2. Filter Search
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());

        // 3. Filter Harga (Mencari harga tiket terendah terlebih dahulu)
        const lowestPrice = event.tickets && event.tickets.length > 0
            ? Math.min(...event.tickets.map(t => t.price))
            : null;

        let matchesPrice = true;
        if (priceFilter === 'free') {
            matchesPrice = lowestPrice === null || lowestPrice === 0;
        } else if (priceFilter === 'under-200k') {
            matchesPrice = lowestPrice !== null && lowestPrice > 0 && lowestPrice < 200000;
        } else if (priceFilter === '200k-500k') {
            matchesPrice = lowestPrice !== null && lowestPrice >= 200000 && lowestPrice <= 500000;
        } else if (priceFilter === 'above-500k') {
            matchesPrice = lowestPrice !== null && lowestPrice > 500000;
        }

        return matchesCategory && matchesSearch && matchesPrice;
    });

    return (
        <div className="bg-[#fbf9fa] min-h-screen text-black antialiased selection:bg-black selection:text-white">
            <Navbar />

            <main className="pt-24 min-h-[calc(100vh-80px)]">
                {/* ================= HEADER SECTION ================= */}
                <section className="bg-black text-white py-16 px-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200"
                            className="w-full h-full object-cover blur-sm"
                            alt="Background pattern"
                        />
                    </div>
                    <div className="relative z-10 max-w-[1280px] mx-auto text-center sm:text-left">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">
                            Explore Our Catalog
                        </span>
                        <h1 className="text-[36px] sm:text-[48px] font-black tracking-tighter leading-none mb-4">
                            All Available Events
                        </h1>
                        <p className="text-gray-400 max-w-xl text-sm sm:text-base font-medium">
                            Find and filter through curated premium events, executive masterclasses, and concert tours.
                        </p>
                    </div>
                </section>

                {/* ================= CONTROLS SECTION (Search, Price & Categories) ================= */}
                <section className="max-w-[1280px] mx-auto px-8 pt-12">
                    <div className="flex flex-col gap-6 pb-8 border-b border-gray-200/60">
                        
                        {/* Container Search & Price Dropdown */}
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                            
                            {/* Search Input */}
                            <div className="relative flex-grow max-w-md bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-black transition-colors">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by event title or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-sm font-medium text-black placeholder-gray-400 focus:outline-none"
                                />
                            </div>

                            {/* Price Filter Dropdown */}
                            <div className="relative w-full sm:w-60 bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-black transition-colors">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none">
                                    payments
                                </span>
                                <select
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3.5 bg-transparent rounded-xl text-sm font-semibold text-black focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free Admission</option>
                                    <option value="under-200k">Under Rp 200.000</option>
                                    <option value="200k-500k">Rp 200.000 - Rp 500.000</option>
                                    <option value="above-500k">Above Rp 500.000</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none">
                                    arrow_drop_down
                                </span>
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2.5 items-center">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedCategory === 'all'
                                        ? 'bg-black text-white border-black shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                All Categories
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(String(category.id))}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedCategory === String(category.id)
                                            ? 'bg-black text-white border-black shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {category.category_name}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================= GRID LIST EVENTS SECTION ================= */}
                <section className="max-w-[1280px] mx-auto px-8 py-12">
                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <span className="loading loading-spinner loading-lg text-black"></span>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm max-w-xl mx-auto">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
                                manage_search
                            </span>
                            <h4 className="text-lg font-bold text-black mb-1">No Matches Found</h4>
                            <p className="text-gray-400 text-sm">
                                Try adjusting your keywords, price tier, or changing the category filter.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredEvents.map((event) => {
                                const lowestPrice = event.tickets && event.tickets.length > 0
                                    ? Math.min(...event.tickets.map(t => t.price))
                                    : null;

                                // Menggunakan fallback image jika data image dari backend kosong
                                const eventImage = (event as any).image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600";

                                return (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="group bg-white rounded-2xl border border-gray-100/80 overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
                                    >
                                        {/* Gambar Event */}
                                        <div className="h-48 relative overflow-hidden bg-gray-50">
                                            <img
                                                src={eventImage}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                                alt={event.title}
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg">
                                                    {event.category?.category_name || 'Event'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Informasi Konten Card */}
                                        <div className="p-5 flex-grow flex flex-col">
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                                                By {event.user?.name || 'Organizer'}
                                            </p>
                                            <h4 className="text-[17px] font-black text-black mb-4 leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
                                                {event.title}
                                            </h4>

                                            <div className="space-y-2 mb-6 text-[13px] text-gray-500 font-bold">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="material-symbols-outlined text-[18px] text-gray-400">
                                                        calendar_month
                                                    </span>
                                                    <span>{formatDate(event.event_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="material-symbols-outlined text-[18px] text-gray-400">
                                                        location_on
                                                    </span>
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                                                    Pass Starts From
                                                </span>
                                                <span className="text-[15px] font-black text-black">
                                                    {lowestPrice ? formatRupiah(lowestPrice) : 'Free Admission'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
							})}
                        </div>
                    )}
                </section>
            </main>

            {/* Mini Footer khusus halaman filter */}
            <footer className="bg-black text-gray-500 text-center py-8 text-xs font-bold border-t border-white/5">
                <p>© {new Date().getFullYear()} Entrans Ticketing System Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}