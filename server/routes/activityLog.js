const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Log an activity (called from other routes)
const logActivity = async (userId, action, entity, entityId, details, ip) => {
  try {
    await ActivityLog.create({ user: userId, action, entity, entityId, details, ip });
  } catch (e) { console.error('Activity log error:', e.message); }
};

// Get activity logs (admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await ActivityLog.countDocuments();
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.logActivity = logActivity;
