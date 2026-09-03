import { useState, useEffect } from 'react';
import { useApp } from '../context/appContext';
import axiosClient from '../api/axiosClient';
import { Download, ChevronDown, ChevronRight, X, ShieldCheck } from 'lucide-react';

export default function VehicleServiceHistoryModal({ vehicle, onClose }) {
  const { activeTheme } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!vehicle?._id) return undefined;

    let isMounted = true;
    const loadHistory = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/service-records?vehicle_id=${vehicle._id}&sort_by=completed_at&order=desc`);
        if (isMounted) setHistory(res.data.data || res.data || []);
      } catch (error) {
        console.error('Failed to load vehicle history:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadHistory();
    return () => {
      isMounted = false;
    };
  }, [vehicle]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // CSV Export Handler
  const exportToCSV = () => {
    if (!history.length) return;

    const headers = ['Record ID', 'Vehicle', 'Status', 'Scheduled Date', 'Completed Date', 'Completed Odometer', 'Description'];
    const rows = history.map((rec) => [
      `"${rec._id}"`,
      `"${vehicle.registration_number} (${vehicle.make} ${vehicle.model})"`,
      `"${rec.status}"`,
      `"${rec.scheduled_date ? new Date(rec.scheduled_date).toLocaleDateString() : 'N/A'}"`,
      `"${rec.completed_at ? new Date(rec.completed_at).toLocaleDateString() : 'N/A'}"`,
      `"${rec.completed_odometer || 'N/A'}"`,
      `"${(rec.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${vehicle.registration_number}_Service_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xl">
      <div className={`mac-card w-full max-w-3xl max-h-[85vh] flex flex-col ${activeTheme.card}`}>
        
        {/* Modal Header */}
        <div className={`p-5 border-b ${activeTheme.border} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Service History</h2>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono ${activeTheme.success}`}>
                <ShieldCheck className="w-3 h-3" /> Immutable Ledger
              </span>
            </div>
            <p className={`text-sm ${activeTheme.textSecondary} mt-0.5`}>
              {vehicle.registration_number} — {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={loading || history.length === 0}
              className={`mac-button flex items-center gap-2 px-4 py-2 text-xs font-semibold ${activeTheme.button}`}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={onClose} className="mac-icon-button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Timeline */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-8 text-zinc-500 text-sm">Loading vehicle records...</div>
          ) : history.length === 0 ? (
            <div className={`text-center py-8 ${activeTheme.textSecondary} text-sm`}>No service records found for this vehicle.</div>
          ) : (
            history.map((record) => {
              const isExpanded = expandedId === record._id;
              return (
                <div key={record._id} className={`overflow-hidden rounded-2xl border ${activeTheme.border} ${activeTheme.input}`}>
                  
                  {/* Collapsible Row Header */}
                  <button
                    onClick={() => toggleExpand(record._id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/40 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                            record.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                            record.status === 'in_service' ? 'bg-blue-500/10 text-blue-400' :
                            record.status === 'booked' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {record.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-zinc-400">
                            Completed: {record.completed_at ? new Date(record.completed_at).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-500 font-mono">
                        {record.completed_odometer ? `${record.completed_odometer.toLocaleString()} km` : '—'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className={`space-y-3 border-t p-4 text-xs ${activeTheme.border} ${activeTheme.card}`}>
                      <div>
                        <strong className="text-zinc-400 block mb-1">Admin / Manager Description:</strong>
                        <p className={`rounded-xl border p-3 font-mono ${activeTheme.border} ${activeTheme.input}`}>
                          {record.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 border-t pt-2 ${activeTheme.textSecondary} ${activeTheme.border}`}>
                        <div>
                          <strong>Scheduled Date:</strong>{' '}
                          {record.scheduled_date ? new Date(record.scheduled_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div>
                          <strong>Completed Date:</strong>{' '}
                          {record.completed_at ? new Date(record.completed_at).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}