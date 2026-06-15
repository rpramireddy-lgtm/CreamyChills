const express = require('express');
const crypto = require('crypto');
const Referral = require('../models/Referral');
const Discount = require('../models/Discount');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get my referral code
router.get('/my-code', auth, async (req, res) => {
  try {
    let referral = await Referral.findOne({ referrer: req.user.id, referred: null });
    
    if (!referral) {
      const code = `REF${req.user.name.substring(0, 3).toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      referral = new Referral({ referrer: req.user.id, code });
      await referral.save();
    }

    const totalReferred = await Referral.countDocuments({ referrer: req.user.id, isRedeemed: true });

    res.json({
      code: referral.code,
      shareUrl: `${process.env.FRONTEND_URL || 'https://staging.creamychills.com'}/register?ref=${referral.code}`,
      totalReferred,
      reward: referral.reward
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply referral code (called during registration)
router.post('/apply', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    const referral = await Referral.findOne({ code: code.toUpperCase() });
    if (!referral) return res.status(404).json({ message: 'Invalid referral code' });
    if (referral.referrer.toString() === req.user.id) return res.status(400).json({ message: 'Cannot use own code' });

    // Create discount for new user
    const newUserDiscount = new Discount({
      code: `WELCOME${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      type: 'fixed',
      value: 3,
      description: '£3 referral welcome bonus',
      maxUses: 1,
      minOrderAmount: 10,
      isActive: true
    });
    await newUserDiscount.save();

    // Create discount for referrer
    const referrerDiscount = new Discount({
      code: `THANKS${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      type: 'fixed',
      value: 3,
      description: '£3 referral reward',
      maxUses: 1,
      minOrderAmount: 10,
      isActive: true
    });
    await referrerDiscount.save();

    // Mark referral as used
    referral.referred = req.user.id;
    referral.isRedeemed = true;
    referral.redeemedAt = new Date();
    await referral.save();

    res.json({
      message: 'Referral applied! You got £3 off.',
      discountCode: newUserDiscount.code
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
