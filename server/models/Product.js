const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['ice-cream', 'waffle', 'cake', 'milkshake', 'drink', 'crepe', 'cookie-dough', 'sundae', 'loaded-kunafa', 'slush', 'donut', 'smoothie', 'hot-drink', 'extras']
  },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  images: [String], // Additional images
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  
  // Ice cream specific fields
  flavors: [String],
  toppings: [String],
  
  // Cake specific fields
  sizes: [{
    name: String,
    price: Number
  }],
  
  // General customization options
  customizations: [{
    name: String,
    options: [String],
    additionalPrice: { type: Number, default: 0 }
  }],
  
  nutritionalInfo: {
    calories: Number,
    allergens: [String]
  },
  allergens: [{ type: String, enum: ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Soya', 'Vegan', 'Vegetarian'] }],
  preparationTime: { type: Number, default: 10 },
  modifierGroupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ModifierGroup' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);