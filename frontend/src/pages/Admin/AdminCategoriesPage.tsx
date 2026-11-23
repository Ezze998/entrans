import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';

interface CategoryData { id: number; category_name: string; slug: string; }

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiFetch<{ success: boolean; data: CategoryData[] }>('/categories');
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat kategori.');
        } finally { setLoading(false); }
    };

    useEffect(() => { void loadCategories(); }, []);

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Hapus kategori ini? Kategori yang masih digunakan event mungkin tidak dapat dihapus.')) return;
        try {
            await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            setCategories(current => current.filter(category => category.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal menghapus kategori.');
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div><h2 className="text-2xl font-black text-slate-800">Master Data Kategori</h2><p className="text-gray-400 text-sm mt-0.5">Kelola kategori event Entrans.</p></div>
                <Link to="/admin/categories/new" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm text-sm"><span className="material-symbols-outlined text-[18px]">add</span>Tambah Kategori</Link>
            </div>
            {loading ? <div className="text-center py-20 text-gray-400 font-medium">Memuat kategori...</div>
            : error ? <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700"><p className="font-bold mb-1">Kategori gagal dimuat</p><p>{error}</p><button onClick={() => void loadCategories()} className="mt-3 underline font-bold">Coba lagi</button></div>
            : <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider font-black"><tr><th className="p-5 pl-8 w-24">ID</th><th className="p-5">Nama Kategori</th><th className="p-5 text-right pr-8">Aksi</th></tr></thead>
                <tbody className="text-slate-700 divide-y divide-gray-100 text-sm font-medium">
                    {categories.length === 0 ? <tr><td colSpan={3} className="text-center py-16 text-gray-400">Belum ada kategori. Gunakan tombol Tambah Kategori.</td></tr>
                    : categories.map(category => <tr key={category.id} className="hover:bg-slate-50/50 transition"><td className="p-5 pl-8 font-extrabold text-slate-400">#{category.id}</td><td className="p-5 text-slate-900 font-bold text-[15px]">{category.category_name}</td><td className="p-5 text-right pr-8"><button onClick={() => void handleDeleteCategory(category.id)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition">Hapus Permanen</button></td></tr>)}
                </tbody>
            </table></div></div>}
        </>
    );
}