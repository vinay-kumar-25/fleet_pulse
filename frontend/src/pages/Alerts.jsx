import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function Alerts() {
  const { activeTheme, refreshAlerts } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertsData = async () => {
    try {
      const res = await axiosClient.get('/dashboard/alerts');
      setAlerts(res.data.alerts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        const res = await axiosClient.get('/dashboard/alerts');
        if (isMounted) setAlerts(res.data.alerts || []);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void runFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismiss = async (id) => {
    try {
      await axiosClient.patch(`/dashboard/alerts/${id}/dismiss`);
      await fetchAlertsData();
      refreshAlerts();
    } catch (error) {
      console.error(error);
      alert('Failed to dismiss alert');
    }
  };

  if (loading) return <div className="p-8 text-center text-sm">Checking overdue service queues...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overdue Maintenance Alerts</h1>
          <p className={`text-sm ${activeTheme.textSecondary}`}>Vehicles past grace period requiring immediate scheduling</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className={`p-8 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg} text-center space-y-2`}>
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold">No Active Overdue Alerts</h3>
          <p className={`text-sm ${activeTheme.textSecondary}`}>All fleet vehicles are within service grace periods.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((item) => (
            <div key={item._id} className={`p-5 rounded-lg border border-red-500/30 ${activeTheme.cardBg} flex justify-between items-start`}>
              <div className="space-y-1">
                <div className="text-base font-bold">{item.vehicle_id?.registration_number}</div>
                <div className={`text-xs ${activeTheme.textSecondary}`}>{item.vehicle_id?.make_model}</div>
                <div className="text-sm font-medium mt-2">{item.description || 'Routine Interval Service'}</div>
              </div>

              <button
                onClick={() => handleDismiss(item._id)}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Dismiss Alert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}