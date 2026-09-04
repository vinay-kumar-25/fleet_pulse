import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { ShieldAlert, Truck, CheckCircle2, Clock, Loader2 } from 'lucide-react';

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
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <p className={`text-sm ${activeTheme.textSecondary}`}>Loading telemetry data…</p>
      </div>
    );
  }

  const cards = [
    { label: 'Vehicles Due', val: metrics?.headline?.totalDue || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Currently In Service', val: metrics?.headline?.totalInService || 0, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed This Week', val: metrics?.headline?.completedThisWeek || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Overdue Alerts', val: metrics?.headline?.totalOverdue || 0, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' }
  ];

  // Formats ISO Week strings (e.g., "2026-W35" -> "W35")
  const formatWeekLabel = (label) => {
    if (!label) return '';
    return label.includes('-W') ? `W${label.split('-W')[1]}` : label;
  };

  const trendData = metrics?.completionTrend || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-[fadeIn_0.4s_ease]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fleet Dashboard</h1>
        <p className={`text-sm mt-0.5 ${activeTheme.textSecondary}`}>Operational telemetry and maintenance cycles</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`mac-card flex items-center justify-between p-5 transition-all duration-300 hover:-translate-y-0.5 ${activeTheme.card} ${activeTheme.cardHover}`}
            >
              <div>
                <p className={`text-xs uppercase tracking-wider font-semibold ${activeTheme.textSecondary}`}>{c.label}</p>
                <p className="text-3xl font-extrabold mt-1 tabular-nums">{c.val}</p>
              </div>
              <span className={`flex items-center justify-center w-12 h-12 rounded-2xl ${c.bg}`}>
                <Icon className={`w-6 h-6 ${c.color}`} />
              </span>
            </div>
          );
        })}
      </div>

      {/* 8-Week Trend Chart */}
      <div className={`mac-card p-6 ${activeTheme.card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Completed Services (8-Week Trend)</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry
          </span>
        </div>

        <div className="h-72 w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="_id"
                tickFormatter={formatWeekLabel}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                }}
                labelFormatter={(label) => `Week: ${label}`}
                formatter={(value) => [`${value} Services`, 'Completed']}
              />
              <Bar
                dataKey="count"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {trendData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 0 ? '#10b981' : '#27272a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status & Workload Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`mac-card p-6 ${activeTheme.card}`}>
          <h2 className="text-lg font-bold mb-4">Records by Status</h2>
          <div className="space-y-1">
            {(metrics?.statusBreakdown || []).map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between text-sm px-3 py-2.5 rounded-xl transition-colors duration-200 ${activeTheme.cardHover}`}
              >
                <span className="capitalize">{item._id.replace('_', ' ')}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTheme.badge ?? 'bg-zinc-800 text-zinc-200'}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={`mac-card p-6 ${activeTheme.card}`}>
          <h2 className="text-lg font-bold mb-4">Technician Workload</h2>
          <div className="space-y-1">
            {(metrics?.technicianBreakdown || []).map((item) => (
              <div
                key={item.technician_id}
                className={`flex items-center justify-between text-sm px-3 py-2.5 rounded-xl transition-colors duration-200 ${activeTheme.cardHover}`}
              >
                <span className="truncate">{item.email}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeTheme.badge ?? 'bg-zinc-800 text-zinc-200'}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}