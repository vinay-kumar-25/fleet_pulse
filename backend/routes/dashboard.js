const express = require('express');
const router = express.Router();
const { ServiceRecord, Vehicle } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/dashboard/metrics (Fleet Manager)
router.get('/metrics', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const totalDue = await ServiceRecord.countDocuments({ status: 'due' });
    const totalInService = await ServiceRecord.countDocuments({ status: 'in_service' });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const completedThisWeek = await ServiceRecord.countDocuments({
      status: 'completed',
      completed_at: { $gte: startOfWeek }
    });

    // 8-Week Completed Services Aggregation
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const completionTrend = await ServiceRecord.aggregate([
      { $match: { status: 'completed', completed_at: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { $isoWeek: '$completed_at' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      headline: { totalDue, totalInService, completedThisWeek },
      completionTrend
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

      const gracePeriodMs = vehicle.grace_period_days * 24 * 60 * 60 * 1000;
      const isBreached = (now - new Date(record.created_at)) > gracePeriodMs;

      // Ensure alert is not dismissed during current breach
      const isDismissed = record.alert_dismissed_at && (record.alert_dismissed_at > record.created_at);

      return isBreached && !isDismissed;
    });

    res.json({ count: overdueAlerts.length, alerts: overdueAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/service-records/:id/dismiss-alert
router.patch('/alerts/:id/dismiss', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const record = await ServiceRecord.findByIdAndUpdate(
      req.params.id,
      { alert_dismissed_at: new Date() },
      { returnDocument: 'after' }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;