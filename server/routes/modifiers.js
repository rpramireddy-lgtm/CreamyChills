const express = require('express');
const router = express.Router();
const ModifierGroup = require('../models/ModifierGroup');

// Get all modifier groups
router.get('/', async (req, res) => {
  try {
    const groups = await ModifierGroup.find().sort({ sortOrder: 1, name: 1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single modifier group
router.get('/:id', async (req, res) => {
  try {
    const group = await ModifierGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Modifier group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create modifier group
router.post('/', async (req, res) => {
  try {
    const group = new ModifierGroup(req.body);
    const newGroup = await group.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update modifier group
router.put('/:id', async (req, res) => {
  try {
    const group = await ModifierGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!group) return res.status(404).json({ message: 'Modifier group not found' });
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete modifier group
router.delete('/:id', async (req, res) => {
  try {
    const group = await ModifierGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: 'Modifier group not found' });
    res.json({ message: 'Modifier group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
