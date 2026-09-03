import { useEffect, useState } from "react";
import { useApp } from "../context/appContext";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import VehicleServiceHistoryModal from "../components/VehicleServiceHistoryModal";
import { Plus, Edit2, Archive, RefreshCw, FileUp } from "lucide-react";

export default function Vehicles() {
  const { activeTheme } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [historyVehicle, setHistoryVehicle] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadReport, setUploadReport] = useState(null);

  const [formData, setFormData] = useState({
    registration_number: "",
    make: "",
    model: "",
    current_odometer: 0,
    mileage_interval: 10000,
    date_interval_days: 180,
  });

  const fetchVehicles = async () => {
    try {
      const res = await axiosClient.get(
        `/vehicles?include_archived=${includeArchived}`
      );
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        const res = await axiosClient.get(
          `/vehicles?include_archived=${includeArchived}`
        );
        if (isMounted) setVehicles(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    void runFetch();

    return () => {
      isMounted = false;
    };
  }, [includeArchived]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData({
      registration_number: "",
      make: "",
      model: "",
      current_odometer: 0,
      mileage_interval: 10000,
      date_interval_days: 180,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number,
      make: vehicle.make,
      model: vehicle.model,
      current_odometer: vehicle.current_odometer,
      mileage_interval: vehicle.mileage_interval,
      date_interval_days: vehicle.date_interval_days,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await axiosClient.put(`/vehicles/${editingVehicle._id}`, formData);
      } else {
        await axiosClient.post("/vehicles", formData);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed");
    }
  };

  const toggleArchive = async (id, isArchived) => {
    try {
      const endpoint = isArchived
        ? `/vehicles/${id}/restore`
        : `/vehicles/${id}/archive`;
      await axiosClient.patch(endpoint);
      fetchVehicles();
    } catch (error) {
      console.error(error);
      alert("Failed to update archive status");
    }
  };

  const handleCSVSubmit = async (event) => {
    event.preventDefault();
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const res = await axiosClient.post('/vehicles/bulk-odometer', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadReport(res.data.report);
      await fetchVehicles();
    } catch (error) {
      alert(error.response?.data?.error || 'CSV upload failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Fleet Vehicles</h1>
          <p className={`text-sm ${activeTheme.textSecondary}`}>
            Manage fleet inventory and service parameters
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm ${activeTheme.accent}`}
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          <span className={activeTheme.textSecondary}>
            Show Archived Vehicles
          </span>
        </label>
      </div>

      {/* 7. View all vehicles and complete fleet data */}
      <div
        className={`mac-card overflow-x-auto ${activeTheme.card}`}
      >
        <table className="w-full text-left text-sm">
          <thead
            className={`border-b ${activeTheme.border} text-xs uppercase ${activeTheme.textSecondary}`}
          >
            <tr>
              <th className="p-4">Reg Number</th>
              <th className="p-4">Make / Model</th>
              <th className="p-4">Odometer</th>
              <th className="p-4">Interval (Days / Miles)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${activeTheme.border}`}>
            {vehicles.map((v) => (
              <tr key={v._id}>
                <td className="p-4 font-bold"><Link to={`/vehicles/${v._id}`} className="hover:underline">{v.registration_number}</Link></td>
                <td className="p-4">{v.make} {v.model}</td>
                <td className="p-4">
                  {v.current_odometer.toLocaleString()} mi
                </td>
                <td className="p-4">
                  {v.date_interval_days} days /{" "}
                  {v.mileage_interval.toLocaleString()} mi
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      v.is_archived
                        ? "bg-zinc-800 text-zinc-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {v.is_archived ? "Archived" : "Active"}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryVehicle(v)}
                    className="p-1 text-xs hover:text-emerald-400"
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="mac-icon-button hover:text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleArchive(v._id, v.is_archived)}
                    className="mac-icon-button hover:text-amber-400"
                  >
                    {v.is_archived ? (
                      <RefreshCw className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2 & 3. Create/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xl">
          <div
            className={`mac-card w-full max-w-md space-y-4 p-6 ${activeTheme.card}`}
          >
            <h3 className="text-lg font-bold">
              {editingVehicle ? "Edit Vehicle" : "Create New Vehicle"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Basic Info Section */}
              <div className="space-y-3">
                <div>
                  <label className="block font-medium mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH12AB1234"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_number: e.target.value,
                      })
                    }
                    className={`mac-input w-full p-3 ${activeTheme.input}`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Ford"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    className={`mac-input w-full p-3 ${activeTheme.input}`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Transit 2022"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className={`mac-input w-full p-3 ${activeTheme.input}`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Current Odometer (Miles)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45200"
                    value={formData.current_odometer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_odometer: Number(e.target.value),
                      })
                    }
                    className={`mac-input w-full p-3 ${activeTheme.input}`}
                    required
                  />
                </div>
              </div>

              {/* Maintenance Intervals Section */}
              <div className={`border-t pt-2 ${activeTheme.border}`}>
                <p
                  className={`font-semibold mb-2 ${activeTheme.textSecondary}`}
                >
                  Maintenance Service Schedule Thresholds
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">
                      Every (Miles)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={formData.mileage_interval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mileage_interval: Number(e.target.value),
                        })
                      }
                      className={`mac-input w-full p-3 ${activeTheme.input}`}
                      required
                    />
                    <span className="text-[10px] text-zinc-400">
                      Mileage limit before alert
                    </span>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Every (Days)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      value={formData.date_interval_days}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_interval_days: Number(e.target.value),
                        })
                      }
                      className={`mac-input w-full p-3 ${activeTheme.input}`}
                      required
                    />
                    <span className="text-[10px] text-zinc-400">
                      Time limit before alert
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className={`flex justify-end gap-2 border-t pt-3 ${activeTheme.border}`}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`mac-button px-4 py-2 text-xs ${activeTheme.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold rounded ${activeTheme.accent}`}
                >
                  {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className={`mac-card p-4 ${activeTheme.card}`}>
        <h2 className="font-bold mb-3">Bulk odometer update</h2>
        <form onSubmit={handleCSVSubmit} className="flex flex-wrap gap-2">
          <input type="file" accept=".csv" required onChange={(event) => setCsvFile(event.target.files[0])} className={`mac-input text-xs p-2 ${activeTheme.input}`} />
          <button type="submit" className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold ${activeTheme.accent}`}><FileUp className="w-4 h-4" /> Upload CSV</button>
        </form>
        {uploadReport && <div className="mt-3 space-y-1 text-xs">{uploadReport.map((row) => <div key={row.row}>{row.registration_number}: {row.status}{row.reason ? ` - ${row.reason}` : ''}</div>)}</div>}
      </section>

      {historyVehicle && (
        <VehicleServiceHistoryModal
          vehicle={historyVehicle}
          onClose={() => setHistoryVehicle(null)}
        />
      )}
    </div>
  );
}
