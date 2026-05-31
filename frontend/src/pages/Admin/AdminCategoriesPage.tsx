import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CategoryData {
    id: number;
    name: string;
    category_name?: string;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
                    headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
                });
                if (response.ok) {
                    const resData = await response.json();
                    setCategories(Array.isArray(resData.data) ? resData.data : resData);
                }
            } catch (error) {
                console.error("Gagal memuat master data kategori:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Hapus kategori ini? Tindakan ini dapat memicu error jika ada data event yang menggunakannya.")) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' }
            });
            if (response.ok) {
                alert("Kategori berhasil dibersihkan dari sistem.");
                setCategories(categories.filter(cat => cat.id !== id));
            } else {
                alert("Gagal menghapus kategori platform.");
            }
        } catch (error) {
            console.error("Error hapus:", error);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Master Data Kategori</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Kelola kluster pengelompokan event secara terpusat di sistem database.</p>
                </div>
                <Link
                    to="/admin/categories/new"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm text-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Tambah Kategori
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400 font-medium">Memuat master data...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider font-black">
                                <tr>
                                    <th className="p-5 pl-8 w-24">ID</th>
                                    <th className="p-5">Nama Kategori Resmi Platform</th>
                                    <th className="p-5 text-right pr-8">Aksi Penanganan</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-gray-100 text-sm font-medium">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-16 text-gray-400">Belum ada rincian data kategori.</td>
                                    </tr>
                                ) : (
                                    categories.map((cat, idx) => (
                                        <tr key={cat.id || idx} className="hover:bg-slate-50/50 transition">
                                            <td className="p-5 pl-8 font-extrabold text-slate-400">#{cat.id}</td>
                                            <td className="p-5 text-slate-900 font-bold text-[15px]">
                                                {cat.category_name || cat.name}
                                            </td>
                                            <td className="p-5 text-right pr-8">
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-bold transition"
                                                >
                                                    Hapus Permanen
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}