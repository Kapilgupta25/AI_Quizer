import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import GoogleButton from '../components/auth/GoogleButton';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const details = err.response?.data?.details;
      if (details?.length) {
        toast.error(details[0].message);
      } else {
        toast.error(err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-pop">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Create account</h1>
          <p className="text-white/50 text-sm">Join AIQuizer — it's free</p>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <GoogleButton />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-mono">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-display">Your name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-display">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-display">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min 8 chars, upper+lower+number"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}