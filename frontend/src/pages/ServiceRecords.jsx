import { useEffect, useState } from 'react';
import { useApp } from '../context/appContext';
import axiosClient from '../api/axiosClient';
import { Plus, UserPlus, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ServiceRecords() {
  const { activeTheme, user } = useApp();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  const [filters, setFilters] = useState({ search: '', vehicle_id: '', status: '', technician_id: '', sort_by: 'updated_at', order: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, totalMatches: 0 });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [createForm, setCreateForm] = useState({ vehicle_id: '', description: '' });
  const { search, vehicle_id, status, technician_id, sort_by, order } = filters;

  const updateFilter = (key, value) => {
    setPagination((current) => ({ ...current, page: 1 }));
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const openDetails = async (id) => {
    try {
      const res = await axiosClient.get(`/service-records/${id}`);
      setSelectedRecord(res.data.record);
      setTimeline(res.data.timeline);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to load record details');
    }
  };

  const bookRecord = async (record) => {
    try {
      await axiosClient.patch(`/service-records/${record._id}/status`, {
        next_status: 'booked',
        scheduled_date: new Date().toISOString()
      });
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Unable to book service');
    }
  };

  const fetchData = async () => {
    try {
      const [recRes, vehRes] = await Promise.all([
        axiosClient.get('/service-records', { params: { search, vehicle_id, status, technician_id, sort_by, order, page: pagination.page, limit: pagination.limit } }),
        user?.role === 'fleet_manager' ? axiosClient.get('/vehicles') : Promise.resolve({ data: [] })
      ]);
      setRecords(recRes.data.data);
      setVehicles(vehRes.data);
      setPagination((current) => ({ ...current, ...recRes.data.pagination }));

      if (user?.role === 'fleet_manager') {
        const techRes = await axiosClient.get('/service-records/technicians');
        setTechnicians(techRes.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        const [recRes, vehRes] = await Promise.all([
          axiosClient.get('/service-records', { params: { search, vehicle_id, status, technician_id, sort_by, order, page: pagination.page, limit: pagination.limit } }),
          user?.role === 'fleet_manager' ? axiosClient.get('/vehicles') : Promise.resolve({ data: [] })
        ]);
        if (isMounted) {
          setRecords(recRes.data.data);
          setPagination((current) => ({ ...current, ...recRes.data.pagination }));
          setVehicles(vehRes.data);
        }

        if (isMounted && user?.role === 'fleet_manager') {
          const techRes = await axiosClient.get('/service-records/technicians');
          setTechnicians(techRes.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void runFetch();

    return () => {
      isMounted = false;
    };
  }, [search, vehicle_id, status, technician_id, sort_by, order, pagination.page, pagination.limit, user?.role]);

  // Handle CSV Download per vehicle
  const handleExportCSV = async (vehicleId, regNum) => {
    try {
      const response = await axiosClient.get(`/vehicles/${vehicleId}/export-csv`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `service_history_${regNum}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert('Failed to export CSV history.');
    }
  };

  // Create Service Record Handler
  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/service-records', createForm);
      setShowCreateModal(false);
      setCreateForm({ vehicle_id: '', description: '', scheduled_date: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create service record');
    }
  };

  // Open Assignment Modal
  const openAssignModal = (record) => {
    setSelectedRecord(record);
    setSelectedTechs(record.assigned_technicians.map(t => t._id));
    setShowAssignModal(true);
  };

  // Assign/Remove Technicians Handler
  const handleSaveTechnicians = async () => {
    try {
      await axiosClient.patch(`/service-records/${selectedRecord._id}/technicians`, {
        assigned_technicians: selectedTechs
      });
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to update technicians');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Service Records & Maintenance</h1>
          <p className={`text-sm ${activeTheme.textSecondary}`}>Manage maintenance schedules and technician tasks</p>
        </div>
        {user?.role === 'fleet_manager' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm ${activeTheme.accent}`}
          >
            <Plus className="w-4 h-4" /> Create Service Record
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search descriptions" className={`mac-input p-3 text-sm ${activeTheme.input}`} />
        <select value={filters.vehicle_id} onChange={(e) => updateFilter('vehicle_id', e.target.value)} className={`mac-input p-3 text-sm ${activeTheme.input}`}><option value="">All vehicles</option>{vehicles.map((vehicle) => <option key={vehicle._id} value={vehicle._id}>{vehicle.registration_number}</option>)}</select>
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className={`mac-input p-3 text-sm ${activeTheme.input}`}><option value="">All statuses</option>{['due', 'booked', 'in_service', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}</select>
        {user?.role === 'fleet_manager' && <select value={filters.technician_id} onChange={(e) => updateFilter('technician_id', e.target.value)} className={`mac-input p-3 text-sm ${activeTheme.input}`}><option value="">All technicians</option>{technicians.map((technician) => <option key={technician._id} value={technician._id}>{technician.email}</option>)}</select>}
        <select value={`${filters.sort_by}:${filters.order}`} onChange={(e) => { const [sort_by, order] = e.target.value.split(':'); setFilters((current) => ({ ...current, sort_by, order })); updateFilter('sort_by', sort_by); }} className={`mac-input p-3 text-sm ${activeTheme.input}`}><option value="updated_at:desc">Recently updated</option><option value="scheduled_date:asc">Scheduled date</option><option value="status:asc">Status</option></select>
      </div>

      {/* Service Records Table */}
      <div className={`mac-card overflow-x-auto ${activeTheme.card}`}>
        <table className="w-full text-left text-sm">
          <thead className={`border-b ${activeTheme.border} text-xs uppercase ${activeTheme.textSecondary}`}>
            <tr>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Description</th>
              <th className="p-4">Scheduled Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Assigned Technicians</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${activeTheme.border}`}>
            {records.map((r) => (
              <tr key={r._id}>
                <td className="p-4 font-bold">{r.vehicle_id?.registration_number || 'N/A'}<div className={`text-xs font-normal ${activeTheme.textSecondary}`}>{r.vehicle_id?.make} {r.vehicle_id?.model}</div></td>
                <td className="p-4">{r.description}</td>
                <td className="p-4">{r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : 'Not scheduled'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4">
                  {r.assigned_technicians?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {r.assigned_technicians.map((t) => (
                        <span key={t._id} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {t.email}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {/* Export CSV Button per Vehicle */}
                  {r.vehicle_id && (
                    <>
                      <button onClick={() => openDetails(r._id)} className="p-1 hover:text-cyan-400" title="View timeline">Details</button>
                      <button onClick={() => handleExportCSV(r.vehicle_id._id, r.vehicle_id.registration_number)} title="Export Vehicle History CSV" className="p-1 hover:text-emerald-400"><Download className="w-4 h-4" /></button>
                    </>
                  )}
                  {user?.role === 'fleet_manager' && (
                    <button
                      onClick={() => openAssignModal(r)}
                      title="Assign/Remove Technicians"
                      className="p-1 hover:text-blue-400"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                  {user?.role === 'fleet_manager' && r.status === 'due' && (
                    <button
                      onClick={() => bookRecord(r)}
                      className={`px-2 py-1 rounded ${activeTheme.accent}`}
                    >
                      Book
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`p-4 border-t ${activeTheme.border} flex justify-between text-xs`}><span>{pagination.totalMatches} matches, page {pagination.page} of {pagination.totalPages || 1}</span><div className="flex gap-2"><button disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="p-1 border rounded disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="p-1 border rounded disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>
      </div>

      {selectedRecord && <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xl"><aside className={`mac-card h-full w-full max-w-lg overflow-y-auto p-6 ${activeTheme.card}`}><button onClick={() => setSelectedRecord(null)} className="mac-icon-button float-right"><X /></button><h2 className="mb-4 text-xl font-bold">Record timeline</h2><p>{selectedRecord.vehicle_id?.registration_number} - {selectedRecord.description}</p><div className="mt-6 space-y-3">{timeline.map((event) => <div key={event._id} className={`rounded-xl border p-3 ${activeTheme.border}`}><div className="font-semibold">{event.event_type.replace('_', ' ')}</div><div className={`text-xs ${activeTheme.textSecondary}`}>{event.user_id?.email || 'System'} | {new Date(event.created_at).toLocaleString()}</div>{event.old_value && <div>From: {event.old_value}</div>}{event.new_value && <div>To: {event.new_value}</div>}</div>)}</div></aside></div>}

      {/* Create Service Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xl">
          <div className={`mac-card w-full max-w-md space-y-4 p-6 ${activeTheme.card}`}>
            <h3 className="text-lg font-bold">New Service Record</h3>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              <select
                value={createForm.vehicle_id}
                onChange={(e) => setCreateForm({ ...createForm, vehicle_id: e.target.value })}
                className={`mac-input w-full p-3 text-xs ${activeTheme.input}`}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registration_number} - {v.make} {v.model}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description / Maintenance Details"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className={`mac-input w-full p-3 text-xs ${activeTheme.input}`}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 text-xs">Cancel</button>
                <button type="submit" className={`px-4 py-1.5 text-xs font-bold rounded ${activeTheme.accent}`}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Technicians Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xl">
          <div className={`mac-card w-full max-w-md space-y-4 p-6 ${activeTheme.card}`}>
            <h3 className="text-lg font-bold">Assign Technicians</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {technicians.map((t) => (
                <label key={t._id} className="flex items-center gap-2 text-sm cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={selectedTechs.includes(t._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTechs([...selectedTechs, t._id]);
                      } else {
                        setSelectedTechs(selectedTechs.filter((id) => id !== t._id));
                      }
                    }}  
                  />
                  <span>{t.email}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAssignModal(false)} className="px-3 py-1.5 text-xs">Cancel</button>
              <button onClick={handleSaveTechnicians} className={`px-4 py-1.5 text-xs font-bold rounded ${activeTheme.accent}`}>Save Assignments</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}