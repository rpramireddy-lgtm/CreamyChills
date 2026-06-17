const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Trigger full sync from Square (admin only)
router.post('/pull', auth, adminAuth, async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const output = execSync('node scripts/syncFromSquare.js', {
      cwd: __dirname + '/..',
      timeout: 60000,
      encoding: 'utf8'
    });
    res.json({ message: 'Sync complete', output });
  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
});

// Push single item to Square (when created/updated in admin)
router.post('/push-item', auth, adminAuth, async (req, res) => {
  try {
    const squareCatalogSync = require('../services/squareCatalogSync');
    const Product = require('../models/Product');
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const result = await squareCatalogSync.pushItem({
      name: product.name,
      description: product.description,
      price: product.price,
      variations: product.sizes?.length > 0 ? product.sizes : null
    });

    // Store Square ID back
    product.squareCatalogId = result.id;
    await product.save();

    res.json({ message: 'Pushed to Square', squareId: result.id });
  } catch (error) {
    res.status(500).json({ message: 'Push failed', error: error.message });
  }
});

// Webhook endpoint for Square catalog changes (automatic two-way sync)
router.post('/webhook', async (req, res) => {
  // Square sends catalog.version.updated events
  const event = req.body;

  if (event?.type === 'catalog.version.updated') {
    console.log('📡 Square catalog changed - triggering sync...');
    try {
      const { execSync } = require('child_process');
      execSync('node scripts/syncFromSquare.js', {
        cwd: __dirname + '/..',
        timeout: 60000
      });
      console.log('✅ Auto-sync from Square complete');
    } catch (e) {
      console.error('Auto-sync failed:', e.message);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
