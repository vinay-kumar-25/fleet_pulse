import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
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
        console.error('Failed to load dashboard telemetry:', err);
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
    { label: 'Overdue Alerts', val: metrics?.headline?.totalOverdue || 0, icon: ShieldAlert, color: 'text-red-500' }
  ];

  // Formats ISO Week strings (e.g., "2026-W35" -> "W35")
  const formatWeekLabel = (label) => {
    if (!label) return '';
    return label.includes('-W') ? `W${label.split('-W')[1]}` : label;
  };

  const trendData = metrics?.completionTrend || [];

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
            <div key={i} className={`mac-card flex items-center justify-between p-5 ${activeTheme.card} ${activeTheme.cardHover}`}>
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
      <div className={`mac-card p-6 ${activeTheme.card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Completed Services (8-Week Trend)</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
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
                  borderRadius: '8px', 
                  color: '#fff',
                  fontSize: '12px' 
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
          <div className="space-y-2">
            {(metrics?.statusBreakdown || []).map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="capitalize">{item._id.replace('_', ' ')}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className={`mac-card p-6 ${activeTheme.card}`}>
          <h2 className="text-lg font-bold mb-4">Technician Workload</h2>
          <div className="space-y-2">
            {(metrics?.technicianBreakdown || []).map((item) => (
              <div key={item.technician_id} className="flex justify-between text-sm">
                <span>{item.email}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}