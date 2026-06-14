const express = require('express');
const router = express.Router();

// Legacy Stripe endpoints - redirect to Square payments
router.all('*', (req, res) => {
  res.status(410).json({ 
    message: 'This endpoint has been deprecated. Use /api/payments instead.' 
  });
});

module.exports = router;
