const mongoose = require('mongoose');

const channelSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  price: Number,
  description: String,
  image: String,
  name: String
}, { _id: false });

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  basePrice: { type: Number, required: true },
  image: String,
  images: [String],
  
  // Availability
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  isSoldOut: { type: Boolean, default: false },
  
  // Channel management
  channels: {
    website: { type: channelSettingsSchema, default: { enabled: true } },
    pos: { type: channelSettingsSchema, default: { enabled: true } },
    justEat: { type: channelSettingsSchema, default: { enabled: false } },
    uberEats: { type: channelSettingsSchema, default: { enabled: false } },
    deliveroo: { type: channelSettingsSchema, default: { enabled: false } },
    scoffable: { type: channelSettingsSchema, default: { enabled: false } }
  },
  
  // Tax and compliance
  taxable: { type: Boolean, default: true },
  allergens: [String],
  preparationTime: { type: Number, default: 10 }, // in minutes
  
  // Modifiers and options
  modifierGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ModifierGroup' }],
  options: [{
    name: String,
    values: [{
      label: String,
      priceAdjustment: { type: Number, default: 0 }
    }]
  }],
  
  // Additional metadata
  sku: String,
  sortOrder: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true
});

itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Item', itemSchema);
