import { QRCodeSVG } from 'qrcode.react';
import { formatRupiah, formatDate } from '../utils/format';
import type { Order } from '../types';

interface TicketModalProps {
  order: Order;
  onClose: () => void;
}

export default function TicketModal({ order, onClose }: TicketModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Background overlay untuk klik di luar modal agar tertutup */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Kartu Tiket */}
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 text-white transition-all z-20"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
        
        {/* Gambar Event */}
        <div className="h-40 bg-gray-100 relative">
          <img 
            src={order.event?.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500"} 
            className="w-full h-full object-cover" 
            alt="Event Banner" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Informasi Utama */}
        <div className="p-8 text-center -mt-8 relative z-10 bg-white rounded-t-[2rem]">
          <h2 className="text-xl font-black text-black mb-1 line-clamp-2">
            {order.event?.title || 'Unknown Event'}
          </h2>
          <p className="text-gray-500 text-sm mb-8 flex items-center justify-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {order.event?.location || 'Location Not Set'}
          </p>

          {/* Area QR Code */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm inline-block mb-3">
              <QRCodeSVG value={order.order_number} size={160} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Scan at Entrance</p>
          </div>

          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Order ID</div>
          <div className="text-lg font-black text-black tracking-widest">{order.order_number}</div>
        </div>
        
        {/* Footer Detail */}
        <div className="bg-[#f8f9fa] p-6 border-t border-dashed border-gray-300 flex justify-between text-sm relative">
          {/* Efek sobekan tiket di pinggir */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-black/40 rounded-full"></div>
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-black/40 rounded-full"></div>

          <div>
            <span className="block text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Date Purchased</span>
            <span className="text-black font-bold">{formatDate(order.created_at).split(' ')}</span>
          </div>
          <div className="text-right">
            <span className="block text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-1">Total Paid</span>
            <span className="text-[#4648d4] font-black">{formatRupiah(Number(order.total_amount))}</span>
          </div>
        </div>

      </div>
    </div>
  );
}