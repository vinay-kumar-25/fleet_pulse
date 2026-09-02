import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import axiosClient from '../api/axiosClient';
import { Plus, UserPlus, Download, Wrench, CheckCircle, Clock } from 'lucide-react';

export default function ServiceRecords() {
  const { activeTheme, user } = useApp();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form States
  const [createForm, setCreateForm] = useState({ vehicle_id: '', description: '', scheduled_date: '' });
  const [selectedTechs, setSelectedTechs] = useState([]);

  const fetchData = async () => {
    try {
      const [recRes, vehRes] = await Promise.all([
        axiosClient.get('/service-records'),
        axiosClient.get('/vehicles')
      ]);
      setRecords(recRes.data);
      setVehicles(vehRes.data);

      if (user?.role === 'fleet_manager') {
        const techRes = await axiosClient.get('/service-records/technicians');
        setTechnicians(techRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (err) {
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
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create service record');
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
    } catch (err) {
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

      {/* Service Records Table */}
      <div className={`overflow-x-auto rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
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
                <td className="p-4 font-bold">{r.vehicle_id?.registration_number || 'N/A'}</td>
                <td className="p-4">{r.description}</td>
                <td className="p-4">{new Date(r.scheduled_date).toLocaleDateString()}</td>
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
                    <button
                      onClick={() => handleExportCSV(r.vehicle_id._id, r.vehicle_id.registration_number)}
                      title="Export Vehicle History CSV"
                      className="p-1 hover:text-emerald-400"
                    >
                      <Download className="w-4 h-4" />
                    </button>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Service Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg} space-y-4`}>
            <h3 className="text-lg font-bold">New Service Record</h3>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              <select
                value={createForm.vehicle_id}
                onChange={(e) => setCreateForm({ ...createForm, vehicle_id: e.target.value })}
                className={`w-full p-2 text-xs rounded border outline-none ${activeTheme.inputBg}`}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registration_number} - {v.make_model}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description / Maintenance Details"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className={`w-full p-2 text-xs rounded border outline-none ${activeTheme.inputBg}`}
                required
              />
              <input
                type="date"
                value={createForm.scheduled_date}
                onChange={(e) => setCreateForm({ ...createForm, scheduled_date: e.target.value })}
                className={`w-full p-2 text-xs rounded border outline-none ${activeTheme.inputBg}`}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg} space-y-4`}>
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