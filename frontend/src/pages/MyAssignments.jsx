import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import TechnicianStatusControl from '../components/TechnicianStatusControl';

const STATUS_THEMES = {
  due: 'bg-red-500/10 text-red-400 border-red-500/20',
  booked: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_service: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

export default function MyAssignments() {
  const { activeTheme } = useApp();
  const [assignedRecords, setAssignedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeline, setSelectedTimeline] = useState(null);

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
    return () => { isMounted = false; };
  }, []);

  const handleDescriptionChange = (id, newText) => {
    setAssignedRecords((prev) =>
      prev.map((rec) => (rec._id === id ? { ...rec, description: newText } : rec))
    );
  };

  const handleDescriptionSave = async (id, description) => {
    try {
      await axiosClient.patch(`/service-records/${id}/description`, { description });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save description');
      fetchAssignments();
    }
  };

  const handleStatusUpdate = (updatedRecord) => {
    setAssignedRecords((currentRecords) =>
      currentRecords.map((record) =>
        record._id === updatedRecord._id ? { ...record, ...updatedRecord } : record
      )
    );
  };

  const viewTimeline = async (id) => {
    try {
      const res = await axiosClient.get(`/service-records/${id}`);
      setSelectedTimeline(res.data.timeline);
    } catch (error) {
      console.error(error);
      alert('Failed to load record timeline');
    }
  };

  if (loading) return <div className={`p-8 text-center text-sm ${activeTheme.textSecondary}`}>Loading assigned maintenance queue...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Assigned Work Orders</h1>
        <p className={`text-sm ${activeTheme.textSecondary}`}>Assigned maintenance tasks requiring update</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignedRecords.map((item) => (
          <div key={item._id} className={`mac-card space-y-4 p-5 ${activeTheme.card}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{item.vehicle_id?.registration_number}</h3>
                <p className={`text-xs ${activeTheme.textSecondary}`}>
                  {item.vehicle_id?.make} {item.vehicle_id?.model}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${STATUS_THEMES[item.status] || STATUS_THEMES.due}`}>
                {item.status?.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-semibold ${activeTheme.textSecondary}`}>Work Log & Notes</label>
              <textarea
                value={item.description || ''}
                onChange={(e) => handleDescriptionChange(item._id, e.target.value)}
                onBlur={(e) => handleDescriptionSave(item._id, e.target.value)}
                rows={3}
                className={`mac-input w-full p-3 text-xs ${activeTheme.input}`}
              />
            </div>

            <div className={`flex justify-between items-center pt-2 border-t ${activeTheme.border}`}>
              <button
                onClick={() => viewTimeline(item._id)}
                className="text-xs text-blue-400 hover:underline font-medium"
              >
                View Audit Timeline
              </button>
              <TechnicianStatusControl record={item} onUpdate={handleStatusUpdate} />
            </div>
          </div>
        ))}
      </div>

      {selectedTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xl">
          <div className={`mac-card w-full max-w-lg space-y-4 p-6 ${activeTheme.card}`}>
            <h3 className="text-lg font-bold">Immutable Timeline History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {selectedTimeline.map((event) => (
                <div key={event._id} className={`rounded-xl border p-3 text-xs ${activeTheme.border} ${activeTheme.input}`}>
                  <div className="font-semibold uppercase">{event.event_type}</div>
                  <div>By: {event.user_id?.email || 'System'}</div>
                  <div className="text-[10px] text-zinc-500">{new Date(event.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedTimeline(null)}
              className={`mac-button px-4 py-2 text-xs font-semibold ${activeTheme.buttonSecondary}`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}