const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['customer', 'staff', 'admin'], 
    default: 'customer' 
  },
  
  addresses: [{
    label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    postcode: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }
  }],
  
  preferences: {
    favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    dietaryRestrictions: [String],
    marketingOptIn: { type: Boolean, default: false }
  },

  // Security fields
  refreshToken: String,
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  passwordChangedAt: Date,
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,

  // Square customer reference
  squareCustomerId: String
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  delete obj.verificationToken;
  return obj;
};

userSchema.index({ email: 1 });
userSchema.index({ squareCustomerId: 1 });

module.exports = mongoose.model('User', userSchema);
