import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';

export default function VehicleDetails() {
  const { activeTheme } = useApp();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    axiosClient.get(`/vehicles/${id}`).then((response) => {
      if (mounted) setData(response.data);
    }).catch((requestError) => {
      if (mounted) setError(requestError.response?.data?.error || 'Failed to load vehicle history');
    });
    return () => { mounted = false; };
  }, [id]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return <div className="p-8">Loading vehicle history...</div>;

  return <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
    <Link to="/vehicles" className={`text-sm ${activeTheme.textSecondary}`}>Back to vehicles</Link>
    <header><h1 className="text-2xl font-bold">{data.vehicle.registration_number}</h1><p className={activeTheme.textSecondary}>{data.vehicle.make} {data.vehicle.model}</p></header>
    <div className={`mac-card overflow-x-auto ${activeTheme.card}`}><table className="w-full text-left text-sm"><thead className={`border-b ${activeTheme.border} ${activeTheme.textSecondary}`}><tr><th className="p-4">Description</th><th className="p-4">Status</th><th className="p-4">Scheduled</th><th className="p-4">Completed</th></tr></thead><tbody className={`divide-y ${activeTheme.border}`}>{data.history.map((record) => <tr key={record._id}><td className="p-4">{record.description || 'No description'}</td><td className="p-4">{record.status}</td><td className="p-4">{record.scheduled_date ? new Date(record.scheduled_date).toLocaleDateString() : 'Not scheduled'}</td><td className="p-4">{record.completed_at ? new Date(record.completed_at).toLocaleDateString() : '-'}</td></tr>)}</tbody></table></div>
  </main>;
}