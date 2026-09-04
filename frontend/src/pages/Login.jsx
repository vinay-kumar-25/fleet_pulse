import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { Truck, Lock, Mail, Loader2 } from 'lucide-react';

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
      <div className={`mac-card w-full max-w-md p-8 animate-[fadeIn_0.4s_ease] ${activeTheme.card}`}>
        <div className="flex flex-col items-center mb-6">
          <div className={`mb-3 rounded-full p-3.5 ${activeTheme.info}`}>
            <Truck className="w-9 h-9 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Pulse </h2>
          <h3 className="text-2xl font-bold text-blue-500 tracking-tight">Sign In</h3>
          <p className={`text-sm ${activeTheme.textSecondary} mt-1`}>Access your fleet service assignments</p>
        </div>

        {error && (
          <div className={`mb-4 rounded-xl p-3 text-sm animate-[fadeIn_0.2s_ease] ${activeTheme.danger}`}>
            {typeof error === 'string' ? error : error?.message || 'Login failed'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-blue-400 transition-colors" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className={`peer mac-input w-full pt-5 pb-2 pl-10 pr-4 text-sm ${activeTheme.input}`}
            />
            <label
              htmlFor="login-email"
              className={`pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm transition-all duration-200
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:font-medium
                peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:-translate-y-0 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-medium
                ${activeTheme.textSecondary}`}
            >
              Email address
            </label>
          </div>

          <div className="relative">
            <Lock className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-blue-400 transition-colors" />
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className={`peer mac-input w-full pt-5 pb-2 pl-10 pr-4 text-sm ${activeTheme.input}`}
            />
            <label
              htmlFor="login-password"
              className={`pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm transition-all duration-200
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:font-medium
                peer-[&:not(:placeholder-shown)]:top-3 peer-[&:not(:placeholder-shown)]:-translate-y-0 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-medium
                ${activeTheme.textSecondary}`}
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mac-button w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTheme.button}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}