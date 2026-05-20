import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatRupiah } from '../utils/format';
import { apiFetch } from '../utils/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { event, selectedTickets, total } = location.state || {};

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  if (!event || !selectedTickets) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-black text-white font-bold rounded-xl">
          Back to Home
        </button>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sesuaikan payload dengan validasi backend Laravel
      const payload = {
        event_id: event.id,
        items: selectedTickets.map((t: any) => ({
          ticket_id: t.ticket_id,
          quantity: t.qty 
        }))
      };

      // 2. Kirim order ke backend
      const response = await apiFetch<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // 3. Redirect ke Midtrans Snap/Payment Page (Cek di dalam response.data)
      if (response.success && response.data && response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        throw new Error("Gagal mendapatkan URL Pembayaran dari server.");
      }
    } catch (err: any) {
      alert(err.message || "Gagal memproses pesanan. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 max-w-[1100px] mx-auto px-8">
        
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-black">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black text-black">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Form Data Diri */}
          <div className="lg:col-span-7">
            <form onSubmit={handlePayment} className="space-y-8">
              
              <div>
                <h2 className="text-xl font-bold text-black mb-6">Contact Information</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-4 bg-[#f8f9fa] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-black font-medium"
                      placeholder="e.g. John Doe"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full p-4 bg-[#f8f9fa] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-black font-medium"
                      placeholder="e.g. john@example.com"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full p-4 bg-[#f8f9fa] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all text-black font-medium"
                      placeholder="e.g. 08123456789"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Pay ditaruh di bawah form, sesuai dengan flow standar */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-[#0F172A] text-white text-lg font-bold rounded-2xl hover:bg-black transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-xl shadow-gray-100 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>Pay {formatRupiah(total)}</>
                  )}
                </button>
                <p className="text-center text-[12px] text-gray-400 font-medium mt-4 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span> Payments are processed securely via Midtrans.
                </p>
              </div>

            </form>
          </div>

          {/* Ringkasan Pesanan (Stitch AI Style) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-28 bg-[#f8f9fa] p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-black mb-6">Order Summary</h2>
              
              <div className="flex gap-5 mb-8 pb-8 border-b border-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300" 
                  className="w-24 h-24 rounded-2xl object-cover shadow-sm" 
                  alt="Event Banner" 
                />
                <div className="flex flex-col justify-center">
                  <h4 className="font-black text-black text-lg mb-1 leading-tight">{event.title}</h4>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                {selectedTickets.map((t: any) => (
                  <div key={t.ticket_id} className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-black font-bold">{t.ticket_type || t.name}</span>
                      <span className="text-gray-500 text-sm font-medium">{t.qty}x Ticket</span>
                    </div>
                    <span className="font-bold text-black">{formatRupiah(t.price * t.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-400">Total</span>
                  <span className="text-3xl font-black text-black">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}