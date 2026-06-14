const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Get all items with filtering
router.get('/', async (req, res) => {
  try {
    const { category, channel, status, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'soldout') query.isSoldOut = true;
    if (status === 'archived') query.isArchived = true;
    if (search) query.$text = { $search: search };

    // Channel filter
    if (channel) {
      query[`channels.${channel}.enabled`] = true;
    }

    const items = await Item.find(query)
      .populate('category')
      .populate('modifierGroups')
      .sort({ sortOrder: 1, name: 1 });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('category')
      .populate('modifierGroups');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const item = new Item(req.body);
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Duplicate item
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await Item.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Item not found' });

    const duplicate = new Item({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      sku: undefined
    });
    
    const newItem = await duplicate.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category').populate('modifierGroups');
    
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk update prices
router.put('/bulk/prices', async (req, res) => {
  try {
    const { itemIds, priceAdjustment, adjustmentType } = req.body;
    
    const items = await Item.find({ _id: { $in: itemIds } });
    
    for (let item of items) {
      if (adjustmentType === 'percentage') {
        item.basePrice = item.basePrice * (1 + priceAdjustment / 100);
      } else {
        item.basePrice = item.basePrice + priceAdjustment;
      }
      await item.save();
    }
    
    res.json({ message: 'Prices updated', count: items.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk update categories
router.put('/bulk/categories', async (req, res) => {
  try {
    const { itemIds, categoryId } = req.body;
    
    await Item.updateMany(
      { _id: { $in: itemIds } },
      { category: categoryId }
    );
    
    res.json({ message: 'Categories updated', count: itemIds.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Archive item
router.put('/:id/archive', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, isActive: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle sold out
router.put('/:id/soldout', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.isSoldOut = !item.isSoldOut;
    await item.save();
    
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
