const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const router = express.Router();

// Generate secure JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId, iat: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '24h', algorithm: 'HS256' }
  );
};

// Generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    
    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      password, 
      phone 
    });
    await user.save();
    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken();
    
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();
    
    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Account locked. Try again in ${remaining} minutes.` 
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();
        return res.status(423).json({ 
          message: 'Account locked due to too many failed attempts. Try again in 30 minutes.' 
        });
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 86400000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 604800000 });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken();
    
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -refreshToken -failedLoginAttempts -lockUntil');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, addresses, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, addresses, preferences },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -failedLoginAttempts -lockUntil');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Password changed successfully', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
