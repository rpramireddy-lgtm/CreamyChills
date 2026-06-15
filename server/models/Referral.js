const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  code: { type: String, required: true, unique: true },
  reward: { type: Number, default: 3 }, // £3 for both
  isRedeemed: { type: Boolean, default: false },
  redeemedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
