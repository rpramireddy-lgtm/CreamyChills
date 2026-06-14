const express = require('express');
const Review = require('../models/Review');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit review
router.post('/', auth, async (req, res) => {
  try {
    const { product, rating, comment, order } = req.body;

    const existing = await Review.findOne({ product, user: req.user.id });
    if (existing) return res.status(409).json({ message: 'You already reviewed this product' });

    const review = new Review({
      product,
      user: req.user.id,
      order,
      rating,
      comment: comment?.substring(0, 500)
    });
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: approve/reject reviews
router.get('/pending', auth, adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name')
      .populate('product', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
