import { useState } from 'react';
import { useApp } from '../context/appContext';
import axiosClient from '../api/axiosClient';

const TRANSITION_CONFIG = {
  due: null, // Booking must be performed by Fleet Managers during scheduling
  booked: { label: 'Start Service', next: 'in_service', color: 'bg-amber-600 hover:bg-amber-500' },
  in_service: { label: 'Mark as Completed', next: 'completed', color: 'bg-emerald-600 hover:bg-emerald-500' },
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
    return <span className={`text-xs font-semibold ${activeTheme.success}`}>Completed</span>;
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
      {error && <span className={`text-[10px] ${activeTheme.danger}`}>{error}</span>}
      <button
        onClick={handleStatusUpdate}
        disabled={loading}
        className={`mac-button px-3 py-1.5 text-xs font-medium ${activeTheme.button}`}
      >
        {loading ? 'Updating...' : config.label}
      </button>
    </div>
  );
}