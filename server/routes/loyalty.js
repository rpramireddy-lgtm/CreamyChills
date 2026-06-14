const express = require('express');
const Loyalty = require('../models/Loyalty');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get loyalty status
router.get('/status', auth, async (req, res) => {
  try {
    let loyalty = await Loyalty.findOne({ user: req.user.id });
    
    if (!loyalty) {
      loyalty = new Loyalty({ user: req.user.id });
      await loyalty.save();
    }

    const tierBenefits = {
      bronze: { multiplier: 1, discount: 0 },
      silver: { multiplier: 1.5, discount: 5 },
      gold: { multiplier: 2, discount: 10 },
      platinum: { multiplier: 3, discount: 15 }
    };

    res.json({
      points: loyalty.points,
      tier: loyalty.tier,
      totalEarned: loyalty.totalPointsEarned,
      benefits: tierBenefits[loyalty.tier],
      pointsToNextTier: getPointsToNextTier(loyalty),
      recentHistory: loyalty.history.slice(-10).reverse()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Earn points (called after order completion)
router.post('/earn', auth, async (req, res) => {
  try {
    const { orderAmount, orderId } = req.body;

    let loyalty = await Loyalty.findOne({ user: req.user.id });
    if (!loyalty) {
      loyalty = new Loyalty({ user: req.user.id });
    }

    const tierMultipliers = { bronze: 1, silver: 1.5, gold: 2, platinum: 3 };
    const multiplier = tierMultipliers[loyalty.tier] || 1;
    const pointsEarned = Math.floor(orderAmount * multiplier);

    loyalty.points += pointsEarned;
    loyalty.totalPointsEarned += pointsEarned;
    loyalty.history.push({
      type: 'earned',
      points: pointsEarned,
      description: `Order #${orderId} (${multiplier}x multiplier)`,
      orderId
    });
    loyalty.updateTier();
    await loyalty.save();

    res.json({
      pointsEarned,
      totalPoints: loyalty.points,
      tier: loyalty.tier
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Redeem points (100 points = £1 discount)
router.post('/redeem', auth, async (req, res) => {
  try {
    const { points } = req.body;

    const loyalty = await Loyalty.findOne({ user: req.user.id });
    if (!loyalty) return res.status(404).json({ message: 'No loyalty account' });

    if (points < 100) {
      return res.status(400).json({ message: 'Minimum 100 points to redeem' });
    }

    if (loyalty.points < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    const discount = Math.floor(points / 100); // £1 per 100 points

    loyalty.points -= points;
    loyalty.totalPointsRedeemed += points;
    loyalty.history.push({
      type: 'redeemed',
      points: -points,
      description: `Redeemed for £${discount} discount`
    });
    await loyalty.save();

    res.json({
      discount,
      pointsUsed: points,
      remainingPoints: loyalty.points
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function getPointsToNextTier(loyalty) {
  const thresholds = { bronze: 100, silver: 250, gold: 500, platinum: Infinity };
  const next = thresholds[loyalty.tier];
  return next === Infinity ? 0 : next - loyalty.totalPointsEarned;
}

module.exports = router;
