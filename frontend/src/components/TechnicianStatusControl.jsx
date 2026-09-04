import { useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { Loader2 } from 'lucide-react';

const TRANSITION_CONFIG = {
  due: null,
  booked: { label: 'Start Service', next: 'in_service' },
  in_service: { label: 'Mark as Completed', next: 'completed' },
  completed: null
};

export default function TechnicianStatusControl({ record, onUpdate }) {
  const { activeTheme } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = TRANSITION_CONFIG[record.status];

  if (record.status === 'due') {
    return <span className={`text-xs italic ${activeTheme.textMuted}`}>Awaiting Fleet Manager Booking</span>;
  }

  if (!config) {
    return <span className={`text-xs font-semibold ${activeTheme.success} px-2 py-0.5 rounded-full`}>Completed</span>;
  }

  const handleStatusUpdate = async () => {
    setError('');
    try {
      setLoading(true);
      const res = await axiosClient.patch(`/service-records/${record._id}/status`, {
        next_status: config.next
      });
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      {error && <span className={`text-[10px] ${activeTheme.danger} px-2 py-0.5 rounded-full`}>{error}</span>}
      <button
        onClick={handleStatusUpdate}
        disabled={loading}
        className={`mac-button flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium ${activeTheme.button}`}
      >
        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
        {loading ? 'Updating…' : config.label}
      </button>
    </div>
  );
}