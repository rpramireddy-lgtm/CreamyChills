const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  totalPointsEarned: { type: Number, default: 0 },
  totalPointsRedeemed: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  
  history: [{
    type: { type: String, enum: ['earned', 'redeemed', 'expired'] },
    points: Number,
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// 1 point per £1 spent. Tier thresholds:
// Bronze: 0-99, Silver: 100-249, Gold: 250-499, Platinum: 500+
loyaltySchema.methods.updateTier = function() {
  if (this.totalPointsEarned >= 500) this.tier = 'platinum';
  else if (this.totalPointsEarned >= 250) this.tier = 'gold';
  else if (this.totalPointsEarned >= 100) this.tier = 'silver';
  else this.tier = 'bronze';
};

module.exports = mongoose.model('Loyalty', loyaltySchema);
