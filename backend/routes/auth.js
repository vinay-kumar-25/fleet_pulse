const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '12h' }
    );

    res.json({ token, role: user.role, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/technicians (Fleet Manager only)
router.get('/technicians', verifyToken, requireRole('fleet_manager'), async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('_id email');
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;