const express = require('express');
const router = express.Router();
const { ServiceRecord, TimelineEvent, Vehicle, User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

// Allowed status transitions
const VALID_TRANSITIONS = {
  due: ['booked'],
  booked: ['in_service'],
  in_service: ['completed'],
  completed: []
};

// ==========================================
// 1. SPECIFIC STATIC ROUTES (Must come before /:id)
// ==========================================

// GET /api/service-records (Server-side search, filter, sort, paginate)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, vehicle_id, status, technician_id, sort_by = 'created_at', order = 'desc', page, limit } = req.query;

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

    // Optional pagination: If no page/limit provided, return all records for compatibility
    if (!page && !limit) {
      const records = await ServiceRecord.find(query)
        .populate('vehicle_id', 'registration_number make_model current_odometer')
        .populate('assigned_technicians', 'email role')
        .sort(sortOptions);
      return res.json(records);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalMatches = await ServiceRecord.countDocuments(query);
    const records = await ServiceRecord.find(query)
      .populate('vehicle_id', 'registration_number make_model current_odometer')
      .populate('assigned_technicians', 'email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: records,
      pagination: {
        totalMatches,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalMatches / limitNum)
      }
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

// GET /api/service-records/technicians (Fetch available technicians)
router.get('/technicians', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const techs = await User.find({ role: 'technician' }).select('_id email');
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/service-records (Create record with Timeline Audit Log)
router.post('/', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const { vehicle_id, description, scheduled_date, assigned_technicians } = req.body;
    
    const record = new ServiceRecord({
      vehicle_id,
      description,
      scheduled_date,
      assigned_technicians: assigned_technicians || [],
      status: 'due'
    });

    await record.save();

    // Create audit event
    await TimelineEvent.create({
      service_record_id: record._id,
      user_id: req.user.id,
      event_type: 'created'
    });

    const populated = await record.populate([
      { path: 'vehicle_id', select: 'registration_number make_model current_odometer' },
      { path: 'assigned_technicians', select: 'email role' }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 2. DYNAMIC PARAMETER ROUTES (/:id)
// ==========================================

// GET /api/service-records/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id)
      .populate('vehicle_id')
      .populate('assigned_technicians', 'email role');
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

    if (!VALID_TRANSITIONS[record.status]?.includes(next_status)) {
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
      if (vehicle) {
        record.completed_odometer = vehicle.current_odometer;
      }
      record.alert_dismissed_at = null;
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

// PATCH /api/service-records/:id/technicians (Assign/Remove multiple technicians array)
router.patch('/:id/technicians', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const { assigned_technicians } = req.body;
    const record = await ServiceRecord.findByIdAndUpdate(
      req.params.id,
      { assigned_technicians },
      { returnDocument: 'after' }
    ).populate([
      { path: 'vehicle_id', select: 'registration_number make_model current_odometer' },
      { path: 'assigned_technicians', select: 'email role' }
    ]);

    if (!record) return res.status(404).json({ error: 'Service record not found' });

    await TimelineEvent.create({
      service_record_id: record._id,
      user_id: req.user.id,
      event_type: 'assignment_update',
      new_value: JSON.stringify(assigned_technicians)
    });

    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/service-records/:id/assignments (Single technician push)
router.post('/:id/assignments', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const { technician_id } = req.body;
    const record = await ServiceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

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

// DELETE /api/service-records/:id/assignments/:user_id (Single technician remove)
router.delete('/:id/assignments/:user_id', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const record = await ServiceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

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