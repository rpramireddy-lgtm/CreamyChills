const mongoose = require('mongoose');

const modifierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  groupName: { type: String, required: true },
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

const modifierGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  isRequired: { type: Boolean, default: false },
  minSelection: { type: Number, default: 0 },
  maxSelection: { type: Number, default: 1 },
  modifiers: [modifierSchema],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('ModifierGroup', modifierGroupSchema);
