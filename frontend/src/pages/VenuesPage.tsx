import { useState } from 'react';
import Navbar from '../components/Navbar';

interface Venue {
  id: number;
  name: string;
  type: string;
  capacity: string;
  location: string;
  image: string;
  description: string;
  facilities: string[];
}

const PREMIUM_VENUES: Venue[] = [
  {
    id: 1,
    name: "Stadion Utama Gelora Bung Karno",
    type: "Mega Stadium",
    capacity: "78.000 Guests",
    location: "Senayan, Jakarta Pusat",
    // Link diperbaiki ke gambar stadion olahraga/arena megah yang valid
    image: "https://images.unsplash.com/photo-1510051640316-ecc39186b633?auto=format&fit=crop&q=80&w=800",
    description: "Stadion olahraga legendaris dan multifungsi berskala internasional di jantung ibu kota. Menjadi saksi sejarah pergelaran konser musik global terbesar, ajang olahraga internasional, hingga acara kebudayaan masif.",
    facilities: ["Royal Box / VVIP Lounge", "Giant LED Screens", "Full Arena Sound System", "Massive Parking Area"]
  },
  {
    id: 2,
    name: "Jakarta International Stadium (JIS)",
    type: "Modern Arena / Stadium",
    capacity: "82.000 Guests",
    location: "Tanjung Priok, Jakarta Utara",
    // Link diperbaiki ke gambar struktur stadion/arsitektur atap modern yang valid
    image: "https://images.unsplash.com/photo-1568194157720-8eae79a37be1?auto=format&fit=crop&q=80&w=800",
    description: "Stadion berstandar FIFA dengan teknologi atap buka-tutup (retractable roof) terbesar di Asia Tenggara. Menyediakan sistem pencahayaan modern dan kualitas akustik terbaik untuk konser musik arena.",
    facilities: ["Retractable Roof", "Sky View Deck", "FIFA Standard Pitch", "Corporate Boxes"]
  },
  {
    id: 3,
    name: "Stadion Gelora Bung Tomo",
    type: "Sports Stadium",
    capacity: "46.000 Guests",
    location: "Benowo, Surabaya",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=800",
    description: "Pusat arena olahraga dan hiburan terbesar di Jawa Timur. Dilengkapi dengan fasilitas modern pasca renovasi internasional, menjadikannya lokasi ideal untuk festival luar ruangan berskala besar di wilayah timur Jawa.",
    facilities: ["International Standard Track", "Broadcast Room", "VIP Tribune", "Wide Access Road"]
  },
  {
    id: 4,
    name: "Grand Ballroom Alpha",
    type: "Luxury Ballroom",
    capacity: "1.500 - 3.000 Guests",
    location: "Sudirman Central Business District, Jakarta",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
    description: "Ballroom termegah dengan arsitektur modern langit-langit tinggi, sistem akustik kelas dunia, dan pencahayaan dinamis otomatis yang cocok untuk gala dinner dan konser intim.",
    facilities: ["Chrystal Chandeliers", "VIP Holding Room", "10K Lumens Projector", "Valet Parking"]
  },
  {
    id: 5,
    name: "Metropolis Convention Center",
    type: "Exhibition & Convention Hall",
    capacity: "5.000 - 10.000 Guests",
    location: "BSD City, Tangerang",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    description: "Pusat konvensi skala internasional multi-fungsi tanpa pilar. Sangat ideal untuk pameran teknologi akbar, konser arena, dan konferensi tingkat tinggi dunia.",
    facilities: ["Loading Dock Access", "Centralized AC", "High-speed Wi-Fi 6", "Press Room"]
  },
  {
    id: 6,
    name: "The Zenith Amphitheater",
    type: "Outdoor Stadium",
    capacity: "8.000 Guests",
    location: "Uluwatu, Bali",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=800",
    description: "Amfiteater terbuka ikonik di atas tebing yang menghadap langsung ke Samudra Hindia. Menyajikan pengalaman visual magis untuk festival musik dan pertunjukan teatrikal.",
    facilities: ["Ocean View Backstage", "Sunset Silhouette Stage", "Artistic Lighting", "F&B Lounge"]
  },
  {
    id: 7,
    name: "Apex Executive Auditorium",
    type: "Auditorium / Theater",
    capacity: "350 Guests",
    location: "Mega Kuningan, Jakarta",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800",
    description: "Ruang teater eksklusif dengan kursi ergonomis premium bergaya teater tiering. Dirancang khusus untuk seminar korporat nasional, peluncuran produk produk mewah, dan eksibisi privat.",
    facilities: ["4K LED Megascreen", "Premium Leather Seats", "Interpretation Booth", "Studio Sound"]
  }
];

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = PREMIUM_VENUES.filter(venue => 
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#fbf9fa] min-h-screen text-black antialiased selection:bg-black selection:text-white">
      <Navbar />

      <main className="pt-24 min-h-[calc(100vh-80px)]">
        {/* ================= HERO HEADER ================= */}
        <section className="bg-black text-white py-16 px-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <img 
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover"
              alt="Venue background" 
            />
          </div>
          <div className="relative z-10 max-w-[1280px] mx-auto">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">
              Partnership & Spaces
            </span>
            <h1 className="text-[36px] sm:text-[48px] font-black tracking-tighter leading-none mb-4">
              World-Class Venues
            </h1>
            <p className="text-gray-400 max-w-xl text-sm sm:text-base font-medium">
              Eksplorasi jajaran lokasi premium mitra resmi Entrans yang siap menyukseskan pergelaran acara berskala masif maupun eksklusif.
            </p>
          </div>
        </section>

        {/* ================= CONTROLS SECTION ================= */}
        <section className="max-w-[1280px] mx-auto px-8 pt-12">
          <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-black transition-colors">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 select-none">
              location_searching
            </span>
            <input 
              type="text"
              placeholder="Cari berdasarkan nama gedung atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-sm font-medium text-black placeholder-gray-400 focus:outline-none"
            />
          </div>
        </section>

        {/* ================= VENUES LIST SECTION ================= */}
        <section className="max-w-[1280px] mx-auto px-8 py-12">
          {filteredVenues.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-xl mx-auto p-8">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">map</span>
              <h4 className="text-lg font-bold text-black mb-1">Venue Tidak Ditemukan</h4>
              <p className="text-gray-400 text-sm">Coba masukkan kata kunci pencarian lokasi lainnya.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredVenues.map((venue, index) => (
                <div 
                  key={venue.id}
                  className={`bg-white rounded-3xl border border-gray-100/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col lg:flex-row gap-8 items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Foto Venue */}
                  <div className="w-full lg:w-1/2 h-[260px] sm:h-[340px] rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    <img 
                      src={venue.image} 
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" 
                      alt={venue.name} 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">
                        {venue.type}
                      </span>
                    </div>
                  </div>

                  {/* Detil Info Venue */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">
                      {venue.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-black">location_on</span>
                        <span>{venue.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-black">groups</span>
                        <span>Max {venue.capacity}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed font-medium mb-6">
                      {venue.description}
                    </p>

                    {/* Fasilitas Unggulan */}
                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-2.5">
                        Key Features & Amenities
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {venue.facilities.map((facility, fIdx) => (
                          <span 
                            key={fIdx}
                            className="bg-[#f5f5f7] border border-gray-200/50 text-black px-3 py-1.5 rounded-xl text-[11px] font-bold"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-black text-gray-500 text-center py-8 text-xs font-bold border-t border-white/5">
        <p>© {new Date().getFullYear()} Entrans Ticketing System Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}