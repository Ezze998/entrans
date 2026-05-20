import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminCategoriesFormPage() {
    const [name, setName] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ category_name: name })
            });

            const resData = await response.json();

            if (response.ok || resData.success) {
                alert("Kategori baru berhasil ditambahkan!");
                navigate('/admin/categories');
            } else {
                alert("Gagal menambahkan kategori: " + (resData.message || JSON.stringify(resData.errors || resData)));
            }
        } catch (error) {
            console.error("Error menambah kategori:", error);
            alert("Terjadi kesalahan sistem saat menambah kategori.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mt-10">
            <Link to="/admin/categories" className="text-sm font-bold text-blue-600 hover:underline block mb-6">
                ← Kembali ke Master Kategori
            </Link>

            <h2 className="text-2xl font-black text-slate-800 mb-2">Daftarkan Kategori Baru</h2>
            <p className="text-xs text-gray-400 mb-6">Pastikan nama kategori bersifat umum dan mudah dimengerti oleh organizer.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Nama Kategori</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Music, Workshop, Sports"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-slate-800 font-medium"
                        disabled={submitting}
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <Link
                        to="/admin/categories"
                        className="w-1/2 text-center bg-gray-100 hover:bg-gray-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting || !name.trim()}
                        className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        {submitting ? 'Memproses...' : 'Simpan Kategori'}
                    </button>
                </div>
            </form>
        </div>
    );
}