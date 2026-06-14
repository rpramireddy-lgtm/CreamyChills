const express = require('express');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

router.use(auth, adminAuth);

// Revenue analytics
router.get('/revenue', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = dailyRevenue.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({ dailyRevenue, totalRevenue, totalOrders, avgOrderValue, period });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Top selling products
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          category: '$product.category',
          image: '$product.image',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Orders by hour (peak times)
router.get('/peak-hours', async (req, res) => {
  try {
    const hourlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(hourlyOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer analytics
router.get('/customers', async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = await User.countDocuments({ 
      role: 'customer', 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    const repeatCustomers = await Order.aggregate([
      { $group: { _id: '$user', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 }, _id: { $ne: null } } },
      { $count: 'total' }
    ]);

    res.json({
      totalCustomers,
      newCustomers,
      repeatCustomers: repeatCustomers[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category breakdown
router.get('/categories', async (req, res) => {
  try {
    const categoryBreakdown = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(categoryBreakdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
