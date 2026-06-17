const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true }, // percentage (0-100) or fixed amount in £
  
  // Constraints
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number, // Cap for percentage discounts
  maxUses: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  maxUsesPerCustomer: { type: Number, default: 1 },
  
  // Validity
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  isActive: { type: Boolean, default: true },
  
  // Targeting
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  
  // Tracking
  usedBy: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);
