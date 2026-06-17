const express = require('express');
const Order = require('../models/Order');
const { auth, staffAuth, optionalAuth } = require('../middleware/auth');
const { createOrderValidation, mongoIdParam } = require('../middleware/validation');
const { checkOpeningHours } = require('../middleware/openingHours');
const { checkDeliveryZone } = require('../middleware/deliveryZone');
const emailService = require('../services/emailService');
const webhookService = require('../services/webhookService');
const { logActivity } = require('../routes/activityLog');
const { emitNewOrder } = require('../services/socketService');
const router = express.Router();

// Create new order
router.post('/', optionalAuth, checkOpeningHours, checkDeliveryZone, createOrderValidation, async (req, res) => {
  try {
    const { items, deliveryMethod, deliveryAddress, guestInfo, notes, scheduledFor } = req.body;
    
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
      if (item.customizations) {
        for (const custom of item.customizations) {
          subtotal += (custom.additionalPrice || 0) * item.quantity;
        }
      }
    }
    
    const tax = 0;
    const deliveryFee = deliveryMethod === 'delivery' ? (req.deliveryFee || 3.99) : 0;
    const total = Math.round((subtotal + deliveryFee) * 100) / 100;
    
    // Determine estimated time
    let estimatedTime;
    if (scheduledFor) {
      estimatedTime = new Date(scheduledFor);
    } else {
      estimatedTime = new Date(Date.now() + (deliveryMethod === 'delivery' ? 45 : 20) * 60000);
    }

    const orderData = {
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      notes: notes ? notes.substring(0, 500) : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      estimatedDeliveryTime: estimatedTime
    };
    
    if (req.user) {
      orderData.user = req.user.id;
    } else if (guestInfo) {
      orderData.guestInfo = {
        name: guestInfo.name?.substring(0, 50),
        email: guestInfo.email?.substring(0, 100),
        phone: guestInfo.phone?.substring(0, 15)
      };
    } else {
      return res.status(400).json({ message: 'Guest info or login required' });
    }
    
    const order = new Order(orderData);
    await order.save();
    await order.populate('items.product');

    // Send confirmation email
    const customerEmail = req.user?.email || guestInfo?.email;
    if (customerEmail) {
      emailService.sendOrderConfirmation(order, customerEmail);
    }

    // Notify admin in real-time
    emitNewOrder(order);
    webhookService.notifyNewOrder(order);
    logActivity(req.user?.id, 'order_created', 'order', order._id, `Order ${order.orderNumber} - £${order.total}`, req.ip);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: 'Failed to create order' });
  }
});

// Get user orders (authenticated only)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order (owner or staff only)
router.get('/:id', mongoIdParam, optionalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow owner or staff to view
    if (req.user) {
      const isOwner = order.user && order.user.toString() === req.user.id;
      const isStaff = ['admin', 'staff'].includes(req.user.role);
      
      if (!isOwner && !isStaff) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      // Guest can only see their order within 24 hours
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      if (orderAge > 24 * 60 * 60 * 1000) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (staff only)
router.patch('/:id/status', auth, staffAuth, mongoIdParam, async (req, res) => {
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
    ).populate('items.product').populate('user', 'email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send status update email
    const email = order.user?.email || order.guestInfo?.email;
    if (email) {
      emailService.sendOrderStatusUpdate(order, email, status);
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel order (owner only, within 5 minutes)
router.post('/:id/cancel', auth, mongoIdParam, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    if (orderAge > 5 * 60 * 1000) {
      return res.status(400).json({ message: 'Order can only be cancelled within 5 minutes of placing' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
