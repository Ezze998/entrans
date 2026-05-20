import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface EventData {
  id: number;
  title: string;
}

export default function OrganizerTicketFormPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [events, setEvents] = useState<EventData[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    event_id: '',
    ticket_type: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizer/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        
        if (res.ok && data.data) {
          setEvents(data.data);
        } else if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (error) {
        console.error('Gagal mengambil data event:', error);
      }
    };
    fetchEvents();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submissionData = new FormData();
    submissionData.append('event_id', formData.event_id);
    submissionData.append('ticket_type', formData.ticket_type);
    submissionData.append('price', formData.price);
    submissionData.append('stock', formData.stock);

    try { 
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: submissionData
      });

      const resData = await response.json();

      if (response.ok || resData.success) {
        alert("Tiket Berhasil Diterbitkan!");
        navigate('/organizer/tickets');
      } else {
        alert("Gagal membuat tiket: " + JSON.stringify(resData.errors || resData.message));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kegagalan koneksi sistem backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow border font-sans mt-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">🎟️ Tambah Tiket Baru</h2>
        <Link to="/organizer/tickets" className="text-sm bg-gray-100 hover:bg-gray-200 text-slate-700 px-3 py-1.5 rounded font-medium">
          &larr; Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Pilih Event <span className="text-red-500">*</span></label>
          <select 
            name="event_id" 
            value={formData.event_id} 
            onChange={handleInputChange} 
            required 
            className="w-full border p-2.5 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
          >
            <option value="">-- Pilih Event Anda --</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Tiket ini akan ditambahkan ke dalam event yang dipilih.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Nama/Tipe Tiket <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="ticket_type" 
            placeholder="Contoh: VIP, Regular, Early Bird" 
            value={formData.ticket_type} 
            onChange={handleInputChange} 
            required 
            className="w-full border p-2.5 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Harga (IDR) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              name="price" 
              placeholder="Contoh: 150000" 
              value={formData.price} 
              onChange={handleInputChange} 
              required 
              min="0"
              className="w-full border p-2.5 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Kuota/Stok <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              name="stock" 
              placeholder="Contoh: 100" 
              value={formData.stock} 
              onChange={handleInputChange} 
              required 
              min="1"
              className="w-full border p-2.5 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition shadow-md mt-4"
        >
          {submitting ? 'Menyimpan Tiket...' : 'Simpan Tiket Sekarang'}
        </button>
      </form>
    </div>
  );
}