const { ServiceRecord } = require('../models');

const getServiceBaselineDate = (vehicle) => vehicle.last_service_at || vehicle.created_at || new Date();

const getServiceBaselineOdometer = (vehicle) => (
  vehicle.last_service_odometer === null || vehicle.last_service_odometer === undefined
    ? vehicle.current_odometer
    : vehicle.last_service_odometer
);

const calculateDueAt = (vehicle) => {
  const baselineDate = getServiceBaselineDate(vehicle);
  const dateDueAt = new Date(baselineDate);
  dateDueAt.setDate(dateDueAt.getDate() + vehicle.date_interval_days);

  const baselineOdometer = getServiceBaselineOdometer(vehicle);
  const mileageDueAt = vehicle.current_odometer >= baselineOdometer + vehicle.mileage_interval
    ? new Date()
    : dateDueAt;

  return dateDueAt <= mileageDueAt ? dateDueAt : mileageDueAt;
};

const isAssignedTechnician = (record, userId) => (
  record.assigned_technicians.some((technicianId) => technicianId.toString() === userId.toString())
);

const createNextServiceRecord = async (vehicle, completedBy) => {
  const dueAt = calculateDueAt(vehicle);
  return ServiceRecord.create({
    vehicle_id: vehicle._id,
    status: 'due',
    description: 'Routine interval service',
    due_at: dueAt,
    created_by: completedBy
  });
};

module.exports = {
  calculateDueAt,
  isAssignedTechnician,
  createNextServiceRecord
};