import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatRupiah, formatDate } from '../utils/format';
import { apiFetch } from '../utils/api';
import type { Order } from '../types'; // Pastikan ada tipe Order di types/index.ts

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Midtrans biasanya mengirim order_id lewat URL saat redirect kembali
  const orderId = searchParams.get('order_id');
  const transactionStatus = searchParams.get('transaction_status'); // opsional dari midtrans

  useEffect(() => {
    async function fetchOrderStatus() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        // Ambil data order terbaru dari database kita
        // Asumsi API memanggil endpoint show berdasarkan order_id / id
        const response = await apiFetch<{ data: Order }>(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Gagal mengambil status order", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf9fa]">
        <span className="loading loading-spinner loading-lg text-[#0F172A]"></span>
      </div>
    );
  }

  // Jika tidak ada orderId di URL
  if (!orderId || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf9fa]">
        <h2 className="text-2xl font-black mb-4">Invalid Transaction</h2>
        <Link to="/" className="px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl">Back to Home</Link>
      </div>
    );
  }

  // Menentukan UI berdasarkan status transaksi
  // Status midtrans biasanya: settlement (lunas), pending, cancel, expire, deny
  const status = order.status || transactionStatus || 'pending';
  const isSuccess = status === 'settlement' || status === 'capture';
  const isPending = status === 'pending';

  return (
    <div className="bg-[#fbf9fa] min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 max-w-[600px] mx-auto px-8">
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center">
          
          {/* Ikon Status */}
          <div className="mb-6 flex justify-center">
            {isSuccess ? (
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
              </div>
            ) : isPending ? (
              <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-5xl">hourglass_empty</span>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-5xl">cancel</span>
              </div>
            )}
          </div>

          {/* Teks Status */}
          <h1 className="text-3xl font-black text-black mb-2">
            {isSuccess ? "Payment Successful!" : isPending ? "Waiting for Payment" : "Payment Failed"}
          </h1>
          <p className="text-gray-500 font-medium mb-8">
            {isSuccess 
              ? "Thank you for your purchase. Your ticket has been sent to your email." 
              : isPending 
              ? "Please complete your payment using the instructions provided." 
              : "Unfortunately, your payment could not be processed. Please try again."}
          </p>

          {/* Detail Transaksi */}
          <div className="bg-[#f8f9fa] rounded-2xl p-6 text-left mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Order ID</span>
              <span className="font-bold text-black">{order.order_number || orderId}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Date</span>
              <span className="font-bold text-black">{formatDate(order.created_at || new Date().toISOString())}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Amount Paid</span>
              <span className="text-xl font-black text-[#4648d4]">{formatRupiah(Number(order.total_amount) || 0)}</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col gap-3">
            <Link 
              to="/orders" 
              className="w-full py-4 bg-[#0F172A] text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              View My Tickets
            </Link>
            <Link 
              to="/" 
              className="w-full py-4 bg-white text-gray-500 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Browse More Events
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}