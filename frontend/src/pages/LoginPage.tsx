import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../utils/api'; 
import type { User } from '../types'; 

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch<{ data: User; access_token: string }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));

      if (res.data.role === 'admin') {
        navigate('/admin');
      } else if (res.data.role === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/'); 
      }
      
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Kolom Kiri: Branding (Hidden di Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-black text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Ornamen Dekorasi Background */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter">Entrans</Link>
        </div>
        
        <div className="relative z-10 mb-20">
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            Welcome back.<br />
            <span className="text-gray-400">Let's discover your next experience.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-md">
            Masuk ke akun Anda untuk menemukan, memesan, dan mengelola tiket acara favorit Anda dengan mudah.
          </p>
        </div>
      </div>

      {/* Kolom Kanan: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign In</h2>
            <p className="text-gray-500 mt-2 text-sm">Silakan masukkan detail akun Anda.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none"
                placeholder="hello@entrans.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end text-sm">
              <Link to="#" className="text-gray-500 hover:text-black font-medium transition-colors">Lupa password?</Link>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 mt-2 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              disabled={loading}
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Sign In'}
            </button>
          </form>

          <p className="text-sm mt-8 text-center text-gray-500 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="text-black font-bold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}