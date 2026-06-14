const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  color: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
