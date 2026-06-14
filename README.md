# Creamy Chills - Online Dessert Shop

A modern, responsive e-commerce platform for selling desserts online.

## Features

- 🍦 Product catalog (Ice creams, Waffles, Cakes, Milkshakes, Drinks)
- 🛒 Shopping cart functionality
- 💳 Stripe payment integration
- 📱 Responsive design (mobile & desktop)
- 👨‍💼 Admin dashboard
- 🚚 Delivery/Pickup options
- 👤 User accounts (optional)

## Quick Start

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
# Copy .env.example to .env in both client and server folders
# Add your MongoDB URI, Stripe keys, etc.
```

3. Start development servers:
```bash
npm run dev
```

## Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared utilities
└── docs/           # Documentation
```

## Technology Stack

- **Frontend**: React, Material-UI, Axios
- **Backend**: Node.js, Express, MongoDB
- **Payment**: Stripe
- **Authentication**: JWT
- **Deployment**: Ready for Vercel/Netlify + Heroku

## Customization Guide

### Adding New Products
1. Update `server/models/Product.js` if new fields needed
2. Add product via admin dashboard or directly to database
3. Product images go in `client/public/images/products/`

### Modifying Styles
- Main theme: `client/src/theme/index.js`
- Component styles: Individual component files
- Global styles: `client/src/index.css`

### Payment Configuration
- Update Stripe keys in environment variables
- Modify payment flow in `client/src/components/Checkout/`

## Support

For customization help, refer to the inline comments and component documentation.