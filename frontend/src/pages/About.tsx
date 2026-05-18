import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
    <div className="bg-[#fbf9fa] min-h-screen text-black antialiased selection:bg-black selection:text-white">
      <Navbar />

      <main className="pt-24 min-h-[calc(100vh-80px)]">
        {/* ================= HERO HEADER ================= */}
        <section className="bg-black text-white py-20 px-8 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-[800px] mx-auto">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
              Behind The Gateway
            </span>
            <h1 className="text-[40px] sm:text-[56px] font-black tracking-tighter leading-none mb-6">
              Redefining Event Access.
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base font-medium leading-relaxed">
              Entrans adalah infrastruktur manajemen penjualan tiket premium terpadu yang menghubungkan promotor global dengan jutaan pencari pengalaman eksklusif.
            </p>
          </div>
        </section>

        {/* ================= OUR CORE STORY ================= */}
        <section className="max-w-[900px] mx-auto px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 md:sticky md:top-28">
                The Narrative
              </h2>
            </div>
            <div className="md:col-span-2 space-y-6 text-base text-gray-700 font-medium leading-relaxed">
              <p>
                Didirikan dengan spirit memangkas birokrasi pembelian tiket konvensional yang rumit, <strong className="text-black font-black">Entrans</strong> lahir sebagai sistem mutakhir yang menawarkan keandalan transaksi tingkat tinggi.
              </p>
              <p>
                Kami percaya bahwa sebuah pergelaran berharga dimulai sejak detik pertama pengguna memilih baris kursi mereka. Oleh sebab itu, integrasi gerbang pembayaran otomatis, keamanan anti-bot, serta penerbitan e-ticket instan menjadi pondasi utama komitmen layanan kami.
              </p>
            </div>
          </div>

          <hr className="my-16 border-gray-200" />

          {/* ================= CORE PILLARS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 md:sticky md:top-28">
                Our Ecosystem Pillars
              </h2>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex justify-center items-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <h4 className="text-md font-black text-black pt-2">Guaranteed Security</h4>
                <p className="text-gray-500 text-xs font-semibold leading-relaxed">
                  Perlindungan enkripsi end-to-end yang menjamin keaslian setiap lembar tiket dari tindakan pemalsuan calo eksternal.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex justify-center items-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <h4 className="text-md font-black text-black pt-2">Instant Settlement</h4>
                <p className="text-gray-500 text-xs font-semibold leading-relaxed">
                  Didukung integrasi payment gateway Midtrans untuk konfirmasi status pembayaran instan dalam hitungan milidetik.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex justify-center items-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                </div>
                <h4 className="text-md font-black text-black pt-2">Organizer Dashboard</h4>
                <p className="text-gray-500 text-xs font-semibold leading-relaxed">
                  Akses instrumen kendali komprehensif bagi promotor untuk mengelola jenis kelas tiket, stok, hingga peninjauan analitik omzet.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex justify-center items-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                </div>
                <h4 className="text-md font-black text-black pt-2">Seamless Pass</h4>
                <p className="text-gray-500 text-xs font-semibold leading-relaxed">
                  Sistem check-in yang efisien di lokasi saat hari pelaksanaan berkat integrasi kode unik pemindaian digital yang mutakhir.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-gray-500 text-center py-8 text-xs font-bold border-t border-white/5">
        <p>© {new Date().getFullYear()} Entrans Ticketing System Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}