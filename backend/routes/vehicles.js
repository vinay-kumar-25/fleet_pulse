const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Vehicle, ServiceRecord } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });

// GET /api/vehicles
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.query.include_archived === 'true' ? {} : { is_archived: false };
    const vehicles = await Vehicle.find(filter).sort({ registration_number: 1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles (Fleet Manager)
router.post('/', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    const history = await ServiceRecord.find({ vehicle_id: vehicle._id }).sort({ created_at: -1 });
    res.json({ vehicle, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id (Fleet Manager)
router.put('/:id', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/vehicles/:id/archive (Fleet Manager)
router.patch('/:id/archive', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { is_archived: true }, { returnDocument: 'after' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/vehicles/:id/restore (Fleet Manager)
router.patch('/:id/restore', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { is_archived: false }, { returnDocument: 'after' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles/bulk-odometer (Fleet Manager CSV Upload)
router.post('/bulk-odometer', verifyToken, requireRole('fleet_manager'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required.' });

  const results = [];
  const rows = [];

  try {
    // Parse CSV file stream into memory
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const regNum = rows[i].registration_number?.trim().toUpperCase();
      
      // Supports both 'odometer' and 'new_odometer' column headers
      const rawOdometer = rows[i].odometer || rows[i].new_odometer;
      const newReading = parseInt(rawOdometer, 10);

      if (!regNum || isNaN(newReading)) {
        results.push({ 
          row: rowNum, 
          registration_number: regNum || 'N/A', 
          status: 'rejected', 
          reason: 'Invalid data format.' 
        });
        continue;
      }

      const vehicle = await Vehicle.findOne({ registration_number: regNum });
      if (!vehicle) {
        results.push({ 
          row: rowNum, 
          registration_number: regNum, 
          status: 'rejected', 
          reason: 'Vehicle not found.' 
        });
        continue;
      }

      if (newReading < vehicle.current_odometer) {
        results.push({
          row: rowNum,
          registration_number: regNum,
          status: 'rejected',
          reason: `Reading (${newReading}) is lower than current odometer (${vehicle.current_odometer}).`
        });
      } else {
        vehicle.current_odometer = newReading;
        await vehicle.save();
        results.push({ 
          row: rowNum, 
          registration_number: regNum, 
          status: 'success', 
          new_odometer: newReading 
        });
      }
    }

    res.json({ report: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Guaranteed cleanup of uploaded temporary file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// ==========================================
// VEHICLE ROUTES (routes/vehicles.js)
// ==========================================

// 2. Create new vehicle (Fleet Manager)
router.post('/', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const { registration_number, make_model, current_odometer, mileage_interval, date_interval_days } = req.body;
    const vehicle = new Vehicle({
      registration_number: registration_number.trim().toUpperCase(),
      make_model,
      current_odometer,
      mileage_interval,
      date_interval_days
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Edit existing vehicle (Fleet Manager)
router.put('/:id', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Archive & Restore vehicles (Fleet Manager)
router.patch('/:id/archive', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { is_archived: true }, { returnDocument: 'after' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/restore', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { is_archived: false }, { returnDocument: 'after' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id/export-csv (Export vehicle service history to CSV)
router.get('/:id/export-csv', verifyToken, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    const history = await ServiceRecord.find({ vehicle_id: vehicle._id })
      .populate('assigned_technicians', 'email')
      .sort({ scheduled_date: -1 });

    // Generate CSV Headers and Rows
    const headers = ['Record ID', 'Status', 'Scheduled Date', 'Completed At', 'Odometer Reading', 'Description', 'Assigned Technicians'];
    
    const rows = history.map(r => [
      r._id,
      r.status,
      r.scheduled_date ? new Date(r.scheduled_date).toISOString().split('T')[0] : '',
      r.completed_at ? new Date(r.completed_at).toISOString().split('T')[0] : '',
      r.odometer_at_service || '',
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${r.assigned_technicians.map(t => t.email).join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=service_history_${vehicle.registration_number}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;