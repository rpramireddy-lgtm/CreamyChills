const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  
  paymentMethod: {
    type: String,
    required: true,
    enum: ['CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'CASH_ON_COLLECTION', 'CASH_ON_DELIVERY']
  },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'GBP' },
  
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'PENDING'
  },
  
  // Square payment details
  squarePaymentId: String,
  squareCustomerId: String,
  squareReceiptUrl: String,
  
  // Card details (masked)
  cardBrand: String,
  cardLast4: String,
  
  // Refund tracking
  refundedAmount: { type: Number, default: 0 },
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    refundedAt: Date
  }],
  
  // Metadata
  paymentNote: String,
  metadata: mongoose.Schema.Types.Mixed,
  
  // Timestamps
  completedAt: Date,
  failedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

paymentSchema.index({ order: 1 });
paymentSchema.index({ squarePaymentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
