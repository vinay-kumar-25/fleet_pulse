import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';

export default function MyAssignments() {
  const { activeTheme } = useApp();
  const [assignedRecords, setAssignedRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const res = await axiosClient.get('/service-records/my-assigned');
      setAssignedRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        const res = await axiosClient.get('/service-records/my-assigned');
        if (isMounted) setAssignedRecords(res.data);
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

  const handleDescriptionSave = async (id, description) => {
    try {
      await axiosClient.patch(`/service-records/${id}/description`, { description });
      alert('Work description updated');
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save description');
    }
  };

  const handleStatusAdvance = async (id, next_status) => {
    try {
      await axiosClient.patch(`/service-records/${id}/status`, { next_status });
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.error || 'Illegal status transition');
    }
  };

  if (loading) return <div className="p-8 text-center text-sm">Loading assigned maintenance queue...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Assigned Work Orders</h1>
        <p className={`text-sm ${activeTheme.textSecondary}`}>Assigned maintenance tasks requiring update</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignedRecords.map((item) => (
          <div key={item._id} className={`p-5 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg} space-y-4`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{item.vehicle_id?.registration_number}</h3>
                <p className={`text-xs ${activeTheme.textSecondary}`}>{item.vehicle_id?.make_model}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400">
                {item.status}
              </span>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${activeTheme.textSecondary}`}>Work Log & Notes</label>
              <textarea
                defaultValue={item.description}
                onBlur={(e) => handleDescriptionSave(item._id, e.target.value)}
                rows={3}
                className={`w-full p-2 text-xs rounded border outline-none ${activeTheme.inputBg}`}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-zinc-500">Auto-saves on blur</span>
              {item.status === 'in_service' && (
                <button
                  onClick={() => handleStatusAdvance(item._id, 'completed')}
                  className="px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}