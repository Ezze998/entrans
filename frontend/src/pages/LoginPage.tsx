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

      // Menyesuaikan dengan response backend Laravel kamu
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));

      if (res.data.role === 'admin' || res.data.role === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Login'}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Belum punya akun? <Link to="/register" className="link link-primary">Register di sini</Link>
        </p>
      </div>
    </div>
  );
}