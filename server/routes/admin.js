const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { auth, adminAuth, staffAuth } = require('../middleware/auth');
const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, adminAuth);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalProducts,
      totalUsers,
      pendingOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ status: 'pending' })
    ]);
    
    const recentOrders = await Order.find()
      .populate('items.product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
      pendingOrders,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product management
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order management
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, startDate, endDate } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name image')
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Order.countDocuments(filter)
    ]);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product').populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      User.countDocuments(filter)
    ]);

    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payment reports
router.get('/payments/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const summary = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = summary.reduce((sum, s) => sum + s.total, 0);
    const totalTransactions = summary.reduce((sum, s) => sum + s.count, 0);

    res.json({
      totalRevenue,
      totalTransactions,
      byMethod: summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
