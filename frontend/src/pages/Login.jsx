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
      const responseMessage = err.response?.data?.message || err.response?.data?.error;
      setError(typeof responseMessage === 'string' ? responseMessage : responseMessage?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-[85vh] items-center justify-center px-4 ${activeTheme.gradient}`}>
      <div className={`mac-card w-full max-w-md p-8 ${activeTheme.card}`}>
        <div className="flex flex-col items-center mb-6">
          <div className={`mb-2 rounded-full p-3 ${activeTheme.info}`}>
            <Truck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Portal Sign In</h2>
          <p className={`text-sm ${activeTheme.textSecondary} mt-1`}>Access your fleet service assignments</p>
        </div>

        {error && (
          <div className={`mb-4 rounded-xl p-3 text-sm ${activeTheme.danger}`}>
            {typeof error === 'string' ? error : error?.message || 'Login failed'}
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
                className={`mac-input w-full py-2 pl-10 pr-4 text-sm ${activeTheme.input}`}
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
                className={`mac-input w-full py-2 pl-10 pr-4 text-sm ${activeTheme.input}`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mac-button w-full py-3 text-sm font-semibold ${activeTheme.button}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}