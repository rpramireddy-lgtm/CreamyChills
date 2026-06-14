const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name contains invalid characters'),
  body('email')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('phone')
    .optional()
    .matches(/^[\d\s+()-]{10,15}$/)
    .withMessage('Invalid phone number'),
  validate
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Order validations
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be positive'),
  body('deliveryMethod')
    .isIn(['delivery', 'pickup'])
    .withMessage('Delivery method must be delivery or pickup'),
  body('deliveryAddress.street')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Street address required for delivery'),
  body('deliveryAddress.city')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('City required for delivery'),
  body('deliveryAddress.zipCode')
    .if(body('deliveryMethod').equals('delivery'))
    .notEmpty()
    .withMessage('Post code required for delivery'),
  validate
];

// Payment validations
const processPaymentValidation = [
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('sourceId')
    .notEmpty()
    .trim()
    .withMessage('Payment source required'),
  body('paymentMethod')
    .isIn(['CARD', 'APPLE_PAY', 'GOOGLE_PAY'])
    .withMessage('Invalid payment method'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email'),
  validate
];

const cashPaymentValidation = [
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('paymentMethod')
    .isIn(['CASH_ON_COLLECTION', 'CASH_ON_DELIVERY'])
    .withMessage('Invalid cash payment type'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  validate
];

// Item validations
const createItemValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('basePrice')
    .isFloat({ min: 0.01, max: 999.99 })
    .withMessage('Price must be between £0.01 and £999.99'),
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  validate
];

// Category validations
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  validate
];

// Param validations
const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createOrderValidation,
  processPaymentValidation,
  cashPaymentValidation,
  createItemValidation,
  createCategoryValidation,
  mongoIdParam
};
