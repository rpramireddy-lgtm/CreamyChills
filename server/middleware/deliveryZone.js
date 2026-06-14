// Delivery zone: 5-mile radius from Broxburn (EH52 5EE)
const DELIVERY_POSTCODES = {
  'EH52': 0,    // Broxburn - free zone
  'EH53': 0,    // Local
  'EH54': 1.00, // Livingston
  'EH48': 1.50, // Bathgate
  'EH49': 1.50, // Linlithgow
  'EH27': 2.00,
  'EH28': 2.00, // Newbridge
  'EH30': 2.50  // South Queensferry
};

const BASE_DELIVERY_FEE = 3.99;

const checkDeliveryZone = (req, res, next) => {
  const { deliveryMethod, deliveryAddress } = req.body;
  
  if (deliveryMethod !== 'delivery') return next();
  
  if (!deliveryAddress?.zipCode) {
    return res.status(400).json({ message: 'Post code required for delivery' });
  }

  const postcode = deliveryAddress.zipCode.toUpperCase().replace(/\s/g, '');
  const prefix = Object.keys(DELIVERY_POSTCODES).find(p => postcode.startsWith(p));
  
  if (!prefix) {
    return res.status(400).json({
      message: `Sorry, we don't deliver to ${deliveryAddress.zipCode}. We deliver to: ${Object.keys(DELIVERY_POSTCODES).join(', ')}.`,
      deliveryZone: Object.keys(DELIVERY_POSTCODES)
    });
  }

  // Attach calculated delivery fee to request
  req.deliveryFee = BASE_DELIVERY_FEE + DELIVERY_POSTCODES[prefix];
  next();
};

module.exports = { checkDeliveryZone };
