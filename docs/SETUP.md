# Creamy Chills Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Stripe account for payments

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install-all
```

### 2. Environment Setup

#### Backend (.env in server folder)
```bash
cd server
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/creamychills
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NODE_ENV=development
```

#### Frontend (.env in client folder)
```bash
cd client
cp .env.example .env
```

Edit `.env` with your values:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create new cluster
3. Get connection string
4. Update MONGODB_URI in server/.env

### 4. Seed Sample Data

```bash
cd server
node scripts/seedData.js
```

This creates:
- Sample products (ice cream, cakes, etc.)
- Admin user (admin@creamychills.com / admin123)

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- Backend server: http://localhost:5000
- Frontend app: http://localhost:3000

## Stripe Payment Setup

1. Create Stripe account at stripe.com
2. Get API keys from dashboard
3. Add keys to environment files
4. Test with card: 4242 4242 4242 4242

## Admin Access

- Email: admin@creamychills.com
- Password: admin123
- Access admin dashboard at /admin

## Adding Products

### Via Admin Dashboard
1. Login as admin
2. Go to /admin
3. Use product management interface

### Via Database
Add products directly to MongoDB with this structure:
```javascript
{
  name: "Product Name",
  description: "Product description",
  category: "ice-cream", // ice-cream, waffle, cake, milkshake, drink
  price: 9.99,
  image: "/images/products/product-image.jpg",
  featured: true, // Show on homepage
  inStock: true,
  // Optional fields for customization
  flavors: ["Vanilla", "Chocolate"],
  toppings: ["Sprinkles", "Nuts"],
  sizes: [
    { name: "Small", price: 9.99 },
    { name: "Large", price: 14.99 }
  ]
}
```

## Adding Product Images

1. Add images to `client/public/images/products/`
2. Reference in database as `/images/products/filename.jpg`
3. Recommended size: 400x300px
4. Formats: JPG, PNG, WebP

## Deployment

### Frontend (Netlify/Vercel)
1. Build: `cd client && npm run build`
2. Deploy `build` folder
3. Set environment variables

### Backend (Heroku/Railway)
1. Deploy `server` folder
2. Set environment variables
3. Ensure MongoDB connection

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check MongoDB is running
- Verify connection string
- Check network access (Atlas)

**Stripe Payment Fails**
- Verify API keys are correct
- Check test mode vs live mode
- Ensure webhook endpoints are set

**Images Not Loading**
- Check file paths in database
- Verify images exist in public folder
- Check file permissions

### Getting Help

1. Check console for error messages
2. Verify environment variables
3. Test API endpoints directly
4. Check database connections

## Customization Guide

### Changing Colors/Theme
Edit `client/src/theme/index.ts`

### Adding New Product Categories
1. Update Product model enum
2. Add to navigation menu
3. Update category pages

### Modifying Order Flow
Edit checkout and payment components in `client/src/pages/`

### Adding Features
- User reviews: Add to Product model
- Loyalty program: Extend User model
- Inventory tracking: Add stock fields
- Email notifications: Integrate email service