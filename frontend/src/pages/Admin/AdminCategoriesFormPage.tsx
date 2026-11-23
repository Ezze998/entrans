import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

export default function AdminCategoriesFormPage() {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const categoryName = name.trim();
        if (!categoryName) { setError('Nama kategori wajib diisi.'); return; }
        setSubmitting(true);
        setError('');
        try {
            await apiFetch('/categories', { method: 'POST', body: JSON.stringify({ category_name: categoryName }) });
            navigate('/admin/categories', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menambahkan kategori.');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mt-10">
            <Link to="/admin/categories" className="text-sm font-bold text-blue-600 hover:underline block mb-6">← Kembali ke Master Kategori</Link>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Daftarkan Kategori Baru</h2>
            <p className="text-xs text-gray-400 mb-6">Pastikan nama kategori bersifat umum dan mudah dimengerti oleh organizer.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div><label htmlFor="category-name" className="block text-xs font-bold uppercase text-slate-500 mb-2">Nama Kategori</label><input id="category-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Music, Workshop, Sports" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-slate-800 font-medium" disabled={submitting} required maxLength={255} /></div>
                {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
                <div className="flex gap-4 pt-2"><Link to="/admin/categories" className="w-1/2 text-center bg-gray-100 hover:bg-gray-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition">Batal</Link><button type="submit" disabled={submitting || !name.trim()} className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition disabled:bg-gray-200 disabled:text-gray-400">{submitting ? 'Memproses...' : 'Simpan Kategori'}</button></div>
            </form>
        </div>
    );
}