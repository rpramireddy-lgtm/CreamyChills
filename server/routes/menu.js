const express = require('express');
const squareCatalog = require('../services/squareCatalogService');
const router = express.Router();

// Get full menu (categories + products)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const catalog = await squareCatalog.getCatalog();

    let products = catalog.products;

    // Filter by category
    if (category && category !== 'all') {
      products = products.filter(p => p.categorySlug === category);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    res.json({
      products,
      categories: catalog.categories,
      total: products.length
    });
  } catch (error) {
    console.error('Menu fetch error:', error.message);
    res.status(500).json({ message: 'Failed to load menu' });
  }
});

// Get single product with full modifier details
router.get('/item/:id', async (req, res) => {
  try {
    const product = await squareCatalog.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Item not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load item' });
  }
});

// Get categories only
router.get('/categories', async (req, res) => {
  try {
    const catalog = await squareCatalog.getCatalog();
    res.json(catalog.categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

// Refresh cache (admin)
router.post('/refresh', async (req, res) => {
  try {
    const catalog = await squareCatalog.refresh();
    res.json({ message: 'Menu refreshed', products: catalog.products.length, categories: catalog.categories.length });
  } catch (error) {
    res.status(500).json({ message: 'Refresh failed' });
  }
});

module.exports = router;
