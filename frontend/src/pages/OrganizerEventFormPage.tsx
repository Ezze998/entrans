// src/pages/OrganizerEventFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

interface Category {
  id: number;
  category_name: string;
}

export default function OrganizerEventFormPage() {
  const { id } = useParams<{ id: string }>(); 
  const isEditMode = !!id;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    location: '',
    event_date: '',
    image: null as File | null, // Standar tipe data File tunggal atau null
    status: 'published',
    ticket_name: '',
    ticket_price: '',
    ticket_quantity: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categories');
        if (res.ok) {
          const resData = await res.json();
          if (resData && Array.isArray(resData.data)) {
            setCategories(resData.data);
          } else if (Array.isArray(resData)) {
            setCategories(resData);
          }
        }
      } catch (e) {
        console.error("Gagal memuat kategori:", e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && id && id !== 'undefined') {
      const fetchOldEventData = async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/events/${id}`);
          if (res.ok) {
            const resData = await res.json();
            if (resData && resData.success && resData.data) {
              const ev = resData.data;
              const formattedDate = ev.event_date ? ev.event_date.substring(0, 16).replace(' ', 'T') : '';
              setFormData({
                category_id: ev.category_id ? ev.category_id.toString() : '',
                title: ev.title || '',
                description: ev.description || '',
                location: ev.location || '',
                event_date: formattedDate,
                image: null,
                status: ev.status || 'published',
                ticket_name: '',
                ticket_price: '',
                ticket_quantity: ''
              });
            }
          }
        } catch (e) {
          console.error("Gagal memuat data lama:", e);
        }
      };
      fetchOldEventData();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🛠️ PERBAIKAN UTAMA: Mengambil e.target.files agar berupa file gambar asli tunggal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submission = new FormData();
    submission.append('category_id', formData.category_id);
    submission.append('title', formData.title);
    submission.append('description', formData.description);
    submission.append('location', formData.location);
    submission.append('event_date', formData.event_date.replace('T', ' ') + ':00'); 
    submission.append('status', formData.status);
    
    if (formData.image) {
      submission.append('image', formData.image);
    }
    if (isEditMode) {
      submission.append('_method', 'PUT');
    }

    const url = isEditMode 
      ? `http://localhost:8000/api/events/${id}` 
      : 'http://localhost:8000/api/events';

    try {
      const response = await fetch(url, {
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json' 
        },
        body: submission
      });
      
      const resData = await response.json();
      
      if (response.ok || resData.success) {
        const createdEventId = resData.data?.id || resData.id;

        if (!isEditMode && formData.ticket_name && createdEventId) {
          await fetch('http://localhost:8000/api/tickets', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              event_id: createdEventId,
              name: formData.ticket_name,
              price: Number(formData.ticket_price),    
              quantity: Number(formData.ticket_quantity) 
            })
          });
        }
        alert(isEditMode ? "Event Berhasil Diperbarui!" : "Event & Tiket Berhasil Diterbitkan!");
        navigate('/organizer/events');
      } else {
        alert("Gagal memproses data: " + JSON.stringify(resData.errors || resData.message));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kegagalan koneksi sistem backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow border font-sans">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">{isEditMode ? '⚙️ Edit Data Event' : '📝 Daftarkan Event Baru'}</h2>
        <Link to="/organizer/events" className="text-sm bg-gray-100 hover:bg-gray-200 text-slate-700 px-3 py-1.5 rounded font-medium">&larr; Kembali</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Nama / Judul Event</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Kategori Event</label>
          <select name="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">-- Pilih Kategori --</option>
            {Array.isArray(categories) && categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Lokasi / Nama Venue</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Tanggal Pelaksanaan</label>
          <input type="datetime-local" name="event_date" value={formData.event_date} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Poster Gambar Acara</label>
          {/* Tambahan accept="image/*" agar browser otomatis memfilter file gambar saja saat memilih berkas */}
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Deskripsi Lengkap</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} required className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        {!isEditMode ? (
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3">
            <h4 className="font-bold text-sm text-amber-700">🎟️ Pengaturan Tiket Utama Sekaligus</h4>
            <p className="text-xs text-amber-600/80 -mt-1">Sistem akan otomatis mengikat tiket ini ke dalam event baru Anda.</p>
            <input type="text" name="ticket_name" placeholder="Nama Tiket (ex: Regular Pass)" value={formData.ticket_name} onChange={handleInputChange} required className="w-full border p-2 rounded text-sm bg-white" />
            <input type="number" name="ticket_price" placeholder="Harga Tiket Satuan (ex: 150000)" value={formData.ticket_price} onChange={handleInputChange} required className="w-full border p-2 rounded text-sm bg-white" />
            <input type="number" name="ticket_quantity" placeholder="Kuota Tiket Tersedia (ex: 500)" value={formData.ticket_quantity} onChange={handleInputChange} required className="w-full border p-2 rounded text-sm bg-white" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Ubah Status Event</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="published">Published (Tampil Umum)</option>
              <option value="draft">Draft (Sembunyikan)</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg font-bold transition shadow-md">
          {submitting ? 'Sedang Menyimpan...' : isEditMode ? 'Simpan Perubahan Event' : 'Terbitkan Event & Tiket Sekarang'}
        </button>
      </form>
    </div>
  );
}