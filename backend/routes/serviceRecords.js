const express = require('express');
const router = express.Router();
const { ServiceRecord, TimelineEvent, Vehicle } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

// Allowed status transitions
const VALID_TRANSITIONS = {
  due: ['booked'],
  booked: ['in_service'],
  in_service: ['completed'],
  completed: []
};

// GET /api/service-records (Server-side search, filter, sort, paginate)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, vehicle_id, status, technician_id, sort_by = 'created_at', order = 'desc', page = 1, limit = 10 } = req.query;

    let query = {};

    // Role view restriction for technicians
    if (req.user.role === 'technician') {
      query.assigned_technicians = req.user.id;
    } else if (technician_id) {
      query.assigned_technicians = technician_id;
    }

    if (vehicle_id) query.vehicle_id = vehicle_id;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const sortOptions = {};
    sortOptions[sort_by] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalMatches = await ServiceRecord.countDocuments(query);
    const records = await ServiceRecord.find(query)
      .populate('vehicle_id', 'registration_number make_model')
      .populate('assigned_technicians', 'email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      data: records,
      pagination: { totalMatches, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(totalMatches / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/service-records/my-assigned
router.get('/my-assigned', verifyToken, requireRole('technician'), async (req, res) => {
  try {
    const records = await ServiceRecord.find({ assigned_technicians: req.user.id })
      .populate('vehicle_id')
      .sort({ updated_at: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/service-records (Fleet Manager)
router.post('/', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const record = new ServiceRecord(req.body);
    await record.save();

    await TimelineEvent.create({
      service_record_id: record._id,
      user_id: req.user.id,
      event_type: 'created'
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/service-records/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('vehicle_id')
      .populate('assigned_technicians', 'email');
    if (!record) return res.status(404).json({ error: 'Service record not found.' });

    const timeline = await TimelineEvent.find({ service_record_id: record._id })
      .populate('user_id', 'email')
      .sort({ created_at: 1 });

    res.json({ record, timeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/service-records/:id/status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { next_status, scheduled_date } = req.body;
    const record = await ServiceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found.' });

    // State transition guard
    if (!VALID_TRANSITIONS[record.status].includes(next_status)) {
      return res.status(400).json({
        error: `Illegal state transition from '${record.status}' to '${next_status}'.`
      });
    }

    const oldStatus = record.status;
    record.status = next_status;

    if (next_status === 'booked') {
      if (!scheduled_date) return res.status(400).json({ error: 'Scheduled date required for booking.' });
      record.scheduled_date = scheduled_date;
    } else if (next_status === 'completed') {
      record.completed_at = new Date();
      const vehicle = await Vehicle.findById(record.vehicle_id);
      record.completed_odometer = vehicle.current_odometer;
      record.alert_dismissed_at = null; // Clear alert dismissal for next service cycle
    }

    await record.save();

    await TimelineEvent.create({
      service_record_id: record._id,
      user_id: req.user.id,
      event_type: 'status_change',
      old_value: oldStatus,
      new_value: next_status
    });

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/service-records/:id/description
router.patch('/:id/description', verifyToken, async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found.' });

    // Restrict editing to assigned technicians or fleet managers
    if (req.user.role === 'technician' && !record.assigned_technicians.includes(req.user.id)) {
      return res.status(403).json({ error: 'You are not assigned to update this record.' });
    }

    record.description = req.body.description;
    await record.save();

    await TimelineEvent.create({
      service_record_id: record._id,
      user_id: req.user.id,
      event_type: 'description_update',
      new_value: req.body.description
    });

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/service-records/:id/assignments (Fleet Manager)
router.post('/:id/assignments', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const { technician_id } = req.body;
    const record = await ServiceRecord.findById(req.params.id);

    if (!record.assigned_technicians.includes(technician_id)) {
      record.assigned_technicians.push(technician_id);
      await record.save();

      await TimelineEvent.create({
        service_record_id: record._id,
        user_id: req.user.id,
        event_type: 'assignment_add',
        new_value: technician_id
      });
    }

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/service-records/:id/assignments/:user_id (Fleet Manager)
router.delete('/:id/assignments/:user_id', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id);
    record.assigned_technicians = record.assigned_technicians.filter(
      id => id.toString() !== req.params.user_id
    );
    await record.save();

    await TimelineEvent.create({
      service_record_id: record._id,
      user_id: req.user.id,
      event_type: 'assignment_remove',
      old_value: req.params.user_id
    });

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;