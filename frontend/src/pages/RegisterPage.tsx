import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../utils/api';
import type { UserRole } from '../types';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<UserRole>('customer' as any); 
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Register</h1>

        {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input type="text" className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" className="input input-bordered w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div>
            <label className="label">Daftar sebagai</label>
            <select className="select select-bordered w-full" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="customer">Pembeli</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Register'}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Sudah punya akun? <Link to="/login" className="link link-primary">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}