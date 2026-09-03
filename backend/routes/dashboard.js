const express = require('express');
const router = express.Router();
const { ServiceRecord, Vehicle, User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const { calculateDueAt } = require('../services/scheduling');

const getIsoWeekKey = (date) => {
  const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((value - yearStart) / 86400000) + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

// GET /api/dashboard/metrics (Fleet Manager)
router.get('/metrics', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const now = new Date();
    const vehicles = await Vehicle.find({ is_archived: false });
    const dueRecords = await ServiceRecord.find({ status: 'due' }).populate('vehicle_id');
    
    const dueVehicles = dueRecords.filter((record) => {
      return record.vehicle_id && calculateDueAt(record.vehicle_id) <= now;
    });

    // FIX: Replaced undefined `vehicle` variable with `record.vehicle_id`
    const overdueVehicles = dueVehicles.filter((record) => {
      const vehicle = record.vehicle_id;
      if (!vehicle) return false;
      const dueAt = calculateDueAt(vehicle);
      const graceMs = (vehicle.grace_period_days || 0) * 24 * 60 * 60 * 1000;
      return (now - dueAt) > graceMs;
    });

    const totalInService = await ServiceRecord.countDocuments({ status: 'in_service' });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const completedThisWeek = await ServiceRecord.countDocuments({
      status: 'completed',
      completed_at: { $gte: startOfWeek }
    });

    // 8-Week Completed Services Aggregation
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const completionTrend = await ServiceRecord.aggregate([
      { $match: { status: 'completed', completed_at: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%G-W%V', date: '$completed_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // FIX: Formatted output keys as `_id` to match Recharts `<XAxis dataKey="_id" />`
    const trend = Array.from({ length: 8 }, (_, index) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 * (7 - index)));
      const weekKey = getIsoWeekKey(weekStart);
      const match = completionTrend.find((item) => item._id === weekKey);
      return { _id: weekKey, count: match?.count || 0 };
    });

    const [statusBreakdown, technicianBreakdown] = await Promise.all([
      ServiceRecord.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }, 
        { $sort: { _id: 1 } }
      ]),
      ServiceRecord.aggregate([
        { $unwind: '$assigned_technicians' },
        { $group: { _id: '$assigned_technicians', count: { $sum: 1 } } },
        { $lookup: { from: User.collection.name, localField: '_id', foreignField: '_id', as: 'technician' } },
        { $unwind: '$technician' },
        { $project: { _id: 0, technician_id: '$_id', email: '$technician.email', count: 1 } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      headline: { 
        totalDue: dueVehicles.length, 
        totalInService, 
        completedThisWeek, 
        totalOverdue: overdueVehicles.length, 
        totalVehicles: vehicles.length 
      },
      statusBreakdown,
      technicianBreakdown,
      completionTrend: trend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts (Overdue alerts badge & list)
router.get('/alerts', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const records = await ServiceRecord.find({ status: 'due' }).populate('vehicle_id');
    const now = new Date();

    const overdueAlerts = records.filter(record => {
      const vehicle = record.vehicle_id;
      if (!vehicle) return false;

      const dueAt = calculateDueAt(vehicle);
      const gracePeriodMs = (vehicle.grace_period_days || 0) * 24 * 60 * 60 * 1000;
      const isBreached = (now - dueAt) > gracePeriodMs;

      // Ensure alert is not dismissed during current breach
      const isDismissed = record.alert_dismissed_at && (new Date(record.alert_dismissed_at) > dueAt);

      return isBreached && !isDismissed;
    });

    res.json({ count: overdueAlerts.length, alerts: overdueAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/service-records/alerts/:id/dismiss
router.patch('/alerts/:id/dismiss', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const record = await ServiceRecord.findByIdAndUpdate(
      req.params.id,
      { alert_dismissed_at: new Date() },
      { returnDocument: 'after' }
    );
    if (!record || record.status !== 'due') {
      return res.status(404).json({ error: 'Active overdue record not found.' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;