import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

interface Category {
  id: number;
  category_name: string;
}

export default function OrganizerEventFormPage() {
  const { id } = useParams<{ id: string }>();
  
  const isEditMode = id !== undefined && id !== 'create' && id !== 'new' && id !== 'undefined' && id !== '';

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoryError, setCategoryError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    location: '',
    event_date: '',
    image: null as File | null,
    status: 'published'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoryError('');
      try {
        const response = await apiFetch<{ success: boolean; data: Category[] }>('/categories');
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setCategoryError(error instanceof Error ? error.message : 'Gagal memuat kategori.');
      } finally {
        setCategoriesLoading(false);
      }
    };
    void fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchOldEventData = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            }
          });
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
                status: ev.status || 'published'
              });
            }
          }
        } catch (e) {
          console.error("Gagal memuat data lama:", e);
        }
      };
      fetchOldEventData();
    }
  }, [id, isEditMode, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      ? `${import.meta.env.VITE_API_BASE_URL}/api/events/${id}` 
      : `${import.meta.env.VITE_API_BASE_URL}/api/events`;

    try {
      const response = await fetch(url, {
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: submission
      });
      
      const resData = await response.json();
      
      if (response.ok || resData.success) {
        alert(isEditMode ? "Event Berhasil Diperbarui!" : "Event Berhasil Diterbitkan!");
        navigate('/organizer/events');
      } else {
        alert("Gagal memproses data event: " + JSON.stringify(resData.errors || resData.message));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kegagalan koneksi sistem backend atau masalah otorisasi token.");
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
          <select name="category_id" value={formData.category_id} onChange={handleInputChange} required disabled={categoriesLoading || categories.length === 0} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100">
            <option value="">{categoriesLoading ? 'Memuat kategori...' : categories.length === 0 ? 'Kategori belum tersedia' : '-- Pilih Kategori --'}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.category_name}</option>
            ))}
          </select>
          {categoryError && <p role="alert" className="mt-2 text-sm text-red-600">{categoryError}</p>}
          {!categoriesLoading && !categoryError && categories.length === 0 && <p className="mt-2 text-sm text-amber-600">Belum ada kategori. Hubungi admin untuk menambahkan kategori.</p>}
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
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Deskripsi Lengkap</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} required className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-slate-700">Ubah Status Event</label>
          <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="published">Published (Tampil Umum)</option>
            <option value="draft">Draft (Sembunyikan)</option>
          </select>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg font-bold transition shadow-md">
          {submitting ? 'Sedang Menyimpan...' : isEditMode ? 'Simpan Perubahan Event' : 'Terbitkan Event Sekarang'}
        </button>
      </form>
    </div>
  );
}