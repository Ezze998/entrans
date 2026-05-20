import { useState, useEffect } from 'react';

// --- Interfaces ---
interface CategoryData {
  id: number;
  name?: string;
  category_name: string;
  created_at?: string;
}

interface AdminSummaryData {
  total_global_orders: number;
  total_global_revenue: number;
  total_published_events: number;
  total_organizers: number;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummaryData>({
    total_global_orders: 0,
    total_global_revenue: 0,
    total_published_events: 0,
    total_organizers: 0,
  });
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [newCategory, setNewCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [summaryRes, categoriesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/summary`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }).catch(() => null),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }).catch(() => null)
        ]);

        if (summaryRes && summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData.data || summaryData);
        }

        if (categoriesRes && categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : categoriesData);
        }
      } catch (error) {
        console.error("Gagal memuat data admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ category_name: newCategory })
      });

      const resData = await response.json();

      if (response.ok || resData.success) {
        alert("Kategori baru berhasil ditambahkan!");
        const addedCategory = resData.data || resData;
        setCategories([...categories, addedCategory]);
        setNewCategory('');
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

  const formatRp = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-medium">Memuat sistem administrasi...</div>;
  }

  return (
    <>
      {/* HEADER DASHBOARD */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">Platform Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Pantau seluruh performa transaksi, event, dan manajemen parameter platform.</p>
      </div>

      {/* PLATFORM SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Total Transaksi Platform</span>
            <span className="text-3xl font-black text-slate-800">
              {summary.total_global_orders || 0} <span className="text-sm font-medium text-gray-500">Sukses</span>
            </span>
          </div>
          <span className="text-xs text-green-600 font-semibold mt-3 bg-green-50 px-2 py-1 rounded w-fit">
            Volume: {formatRp(summary.total_global_revenue || 0)}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Event Aktif</span>
          <span className="text-3xl font-black text-blue-600">
            {summary.total_published_events || 0} <span className="text-sm font-medium text-gray-500">Live</span>
          </span>
          <span className="text-xs text-gray-400 font-medium mt-2">Status: Published global</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mitra Penyelenggara</span>
          <span className="text-3xl font-black text-purple-600">
            {summary.total_organizers || 0} <span className="text-sm font-medium text-gray-500">Organizers</span>
          </span>
          <span className="text-xs text-gray-400 font-medium mt-2">Akun terverifikasi membuat event</span>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: Kategori & Form Tambah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* KOLOM KIRI: Form Tambah Kategori */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Tambah Kategori Baru</h3>
          <p className="text-xs text-gray-400 mb-4">Buat kategori event baru yang langsung bisa dipilih oleh para organizer.</p>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Nama Kategori</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Contoh: Concert, Seminar, Tech"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-slate-800 font-medium"
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newCategory.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-sm transition disabled:bg-gray-200 disabled:text-gray-400"
            >
              {submitting ? 'Menyimpan...' : 'Terbitkan Kategori'}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: Daftar Kategori Aktif */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-slate-800">Master Data Kategori</h3>
            <p className="text-xs text-gray-400 mt-0.5">Daftar kategori yang terdaftar saat ini di sistem database.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Nama Kategori</th>
                  <th className="p-4 text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-gray-100 font-medium text-sm">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400 text-xs">Belum ada kategori yang terdata.</td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.id || index} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6 font-bold text-slate-400">#{cat.id || index + 1}</td>
                      <td className="p-4 text-slate-800 font-bold">{cat.category_name || cat.name || ''}</td>
                      <td className="p-4 text-right pr-6">
                        <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-xs font-bold uppercase tracking-wide">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}