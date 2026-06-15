const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user's favourite products (most ordered)
router.get('/favourites', auth, async (req, res) => {
  try {
    const favourites = await Order.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', count: { $sum: '$items.quantity' }, lastOrdered: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { product: 1, count: 1, lastOrdered: 1 } }
    ]);
    res.json(favourites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reorder - duplicate a previous order into cart format
router.get('/reorder/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    const cartItems = order.items.map(item => ({
      id: item.product._id,
      name: item.product.name,
      price: item.price,
      image: item.product.image,
      quantity: item.quantity,
      customizations: item.customizations || []
    }));

    res.json({ items: cartItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
