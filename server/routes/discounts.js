const express = require('express');
const Discount = require('../models/Discount');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Validate discount code (customer facing)
router.post('/validate', optionalAuth, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) return res.status(400).json({ message: 'Discount code required' });

    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });

    if (!discount) {
      return res.status(404).json({ valid: false, message: 'Invalid discount code' });
    }

    // Check dates
    const now = new Date();
    if (discount.startDate && now < discount.startDate) {
      return res.status(400).json({ valid: false, message: 'Discount not yet active' });
    }
    if (discount.endDate && now > discount.endDate) {
      return res.status(400).json({ valid: false, message: 'Discount has expired' });
    }

    // Check usage limits
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ valid: false, message: 'Discount fully redeemed' });
    }

    // Check per-customer limit
    if (req.user && discount.maxUsesPerCustomer) {
      const userUses = discount.usedBy.filter(u => u.user?.toString() === req.user.id).length;
      if (userUses >= discount.maxUsesPerCustomer) {
        return res.status(400).json({ valid: false, message: 'You have already used this code' });
      }
    }

    // Check minimum order
    if (orderAmount && orderAmount < discount.minOrderAmount) {
      return res.status(400).json({ 
        valid: false, 
        message: `Minimum order £${discount.minOrderAmount.toFixed(2)} required` 
      });
    }

    // Calculate discount
    let discountAmount;
    if (discount.type === 'percentage') {
      discountAmount = (orderAmount || 0) * (discount.value / 100);
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else {
      discountAmount = discount.value;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    res.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      description: discount.description
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Redeem discount (called when order is placed)
router.post('/redeem', optionalAuth, async (req, res) => {
  try {
    const { code } = req.body;
    
    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });
    if (!discount) return res.status(404).json({ message: 'Invalid code' });

    discount.usedCount += 1;
    if (req.user) {
      discount.usedBy.push({ user: req.user.id });
    }
    await discount.save();

    res.json({ message: 'Discount applied' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all discounts
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create discount
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Discount code already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update discount
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json(discount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete discount
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discount deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
