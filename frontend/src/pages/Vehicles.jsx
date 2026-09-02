import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import axiosClient from "../api/axiosClient";
import { Plus, Edit2, Archive, RefreshCw, FileUp } from "lucide-react";

export default function Vehicles() {
  const { activeTheme } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    registration_number: "",
    make_model: "",
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
    fetchVehicles();
  }, [includeArchived]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData({
      registration_number: "",
      make_model: "",
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
      make_model: vehicle.make_model,
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
    } catch (err) {
      alert("Failed to update archive status");
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
        className={`overflow-x-auto rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}
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
                <td className="p-4 font-bold">{v.registration_number}</td>
                <td className="p-4">{v.make_model}</td>
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
                    onClick={() => handleOpenEdit(v)}
                    className="p-1 hover:text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleArchive(v._id, v.is_archived)}
                    className="p-1 hover:text-amber-400"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md p-6 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg} space-y-4`}
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
                    placeholder="e.g. REG-1001 or ABC-1234"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registration_number: e.target.value,
                      })
                    }
                    className={`w-full p-2 rounded border outline-none ${activeTheme.inputBg}`}
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Make & Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Ford Transit or Toyota HiAce"
                    value={formData.make_model}
                    onChange={(e) =>
                      setFormData({ ...formData, make_model: e.target.value })
                    }
                    className={`w-full p-2 rounded border outline-none ${activeTheme.inputBg}`}
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
                    className={`w-full p-2 rounded border outline-none ${activeTheme.inputBg}`}
                    required
                  />
                </div>
              </div>

              {/* Maintenance Intervals Section */}
              <div className="pt-2 border-t border-zinc-700/50">
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
                      className={`w-full p-2 rounded border outline-none ${activeTheme.inputBg}`}
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
                      className={`w-full p-2 rounded border outline-none ${activeTheme.inputBg}`}
                      required
                    />
                    <span className="text-[10px] text-zinc-400">
                      Time limit before alert
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-700/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs rounded border border-zinc-700 hover:bg-zinc-800 transition"
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
    </div>
  );
}
