import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldAlert, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function Dashboard() {
  const { activeTheme } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosClient.get('/dashboard/metrics');
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="p-8 text-center text-sm">Loading telemetry data...</div>;

  const cards = [
    { label: 'Vehicles Due', val: metrics?.headline?.totalDue || 0, icon: Clock, color: 'text-amber-500' },
    { label: 'Currently In Service', val: metrics?.headline?.totalInService || 0, icon: Truck, color: 'text-blue-500' },
    { label: 'Completed This Week', val: metrics?.headline?.completedThisWeek || 0, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Overdue Alerts', val: metrics?.headline?.totalDue || 0, icon: ShieldAlert, color: 'text-red-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fleet Dashboard</h1>
        <p className={`text-sm ${activeTheme.textSecondary}`}>Operational telemetry and maintenance cycles</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-5 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg} flex items-center justify-between`}>
              <div>
                <p className={`text-xs uppercase tracking-wider font-semibold ${activeTheme.textSecondary}`}>{c.label}</p>
                <p className="text-3xl font-extrabold mt-1">{c.val}</p>
              </div>
              <Icon className={`w-8 h-8 ${c.color}`} />
            </div>
          );
        })}
      </div>

      {/* 8-Week Trend Chart */}
      <div className={`p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
        <h2 className="text-lg font-bold mb-4">Completed Services (8-Week Trend)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics?.completionTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="_id" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}