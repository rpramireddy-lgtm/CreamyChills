const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

router.use(auth, adminAuth);

// Create staff/driver account
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    if (!['staff', 'driver', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be staff, driver, or admin' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const user = new User({
      name, email: email.toLowerCase(), password, role, phone,
      isActive: true, isVerified: true
    });
    await user.save();

    res.status(201).json({ message: 'User created', user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'staff', 'driver', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deactivate user
router.put('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export orders as CSV
router.get('/orders/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const csv = [
      'Order Number,Date,Customer,Email,Items,Subtotal,Tax,Delivery Fee,Total,Method,Status,Payment'
    ];

    orders.forEach(o => {
      const items = o.items.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join('; ');
      const customer = o.user?.name || o.guestInfo?.name || '';
      const email = o.user?.email || o.guestInfo?.email || '';
      const date = new Date(o.createdAt).toISOString().split('T')[0];
      csv.push(`${o.orderNumber},${date},"${customer}",${email},"${items}",${o.subtotal?.toFixed(2)},${o.tax?.toFixed(2)},${o.deliveryFee?.toFixed(2)},${o.total?.toFixed(2)},${o.deliveryMethod},${o.status},${o.paymentStatus}`);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
