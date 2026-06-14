const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Guest order support
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    customizations: [{
      name: String,
      value: String,
      additionalPrice: { type: Number, default: 0 }
    }]
  }],
  
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  deliveryMethod: { type: String, enum: ['delivery', 'pickup'], required: true },
  
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  paymentIntentId: String, // Stripe payment intent ID
  
  estimatedDeliveryTime: Date,
  notes: String
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CC${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);