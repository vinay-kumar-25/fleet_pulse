import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { Truck, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, activeTheme } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      login(res.data);
      if (res.data.role === 'fleet_manager') {
        navigate('/dashboard');
      } else {
        navigate('/my-assignments');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4">
      <div className={`w-full max-w-md p-8 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg} shadow-2xl`}>
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-full mb-2">
            <Truck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Portal Sign In</h2>
          <p className={`text-sm ${activeTheme.textSecondary} mt-1`}>Access your fleet service assignments</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${activeTheme.textSecondary}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-md border outline-none ${activeTheme.inputBg}`}
                placeholder="manager@fleet.com"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${activeTheme.textSecondary}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-md border outline-none ${activeTheme.inputBg}`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md font-semibold text-sm transition-all ${activeTheme.accent}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}