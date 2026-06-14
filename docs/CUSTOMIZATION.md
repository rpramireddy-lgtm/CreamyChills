# Customization Guide

## Easy Modifications for Non-Technical Users

### 1. Changing Store Information

#### Store Name & Branding
**File:** `client/src/components/Layout/Navbar.tsx`
```typescript
// Line 67: Change store name
🍦 Creamy Chills  // Replace with your store name
```

**File:** `client/src/components/Layout/Footer.tsx`
```typescript
// Update company information
Creamy Chills  // Your store name
Your favorite dessert destination  // Your tagline
```

#### Contact Information
**File:** `client/src/components/Layout/Footer.tsx`
```typescript
// Update address, phone, email
📍 123 Dessert Street, Sweet City, SC 12345
📞 (555) 123-4567
✉️ hello@creamychills.com
```

### 2. Changing Colors & Appearance

#### Main Colors
**File:** `client/src/theme/index.ts`
```typescript
primary: {
  main: '#FF6B9D', // Main pink color - change this
  light: '#FFB3D1', // Light version
  dark: '#E91E63',  // Dark version
},
secondary: {
  main: '#4ECDC4', // Mint green - change this
}
```

#### Popular Color Schemes
```typescript
// Blue Theme
primary: { main: '#2196F3' }
secondary: { main: '#FF9800' }

// Green Theme  
primary: { main: '#4CAF50' }
secondary: { main: '#FFC107' }

// Purple Theme
primary: { main: '#9C27B0' }
secondary: { main: '#00BCD4' }
```

### 3. Adding/Removing Product Categories

#### Update Navigation Menu
**File:** `client/src/components/Layout/Navbar.tsx`
```typescript
const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'Ice Cream', path: '/products/ice-cream' },
  { label: 'Waffles', path: '/products/waffle' },
  { label: 'Cakes', path: '/products/cake' },
  // Add your categories here:
  { label: 'Cookies', path: '/products/cookie' },
  { label: 'Pastries', path: '/products/pastry' },
];
```

#### Update Home Page Categories
**File:** `client/src/pages/Home.tsx`
```typescript
const categories = [
  { name: 'Ice Cream', path: '/products/ice-cream', emoji: '🍦', color: '#FFE4E1' },
  { name: 'Waffles', path: '/products/waffle', emoji: '🧇', color: '#F5DEB3' },
  // Add new categories:
  { name: 'Cookies', path: '/products/cookie', emoji: '🍪', color: '#DEB887' },
];
```

#### Update Database Model
**File:** `server/models/Product.js`
```javascript
category: { 
  type: String, 
  required: true,
  enum: ['ice-cream', 'waffle', 'cake', 'milkshake', 'drink', 'cookie', 'pastry'] // Add new categories
},
```

### 4. Modifying Text Content

#### Homepage Headlines
**File:** `client/src/pages/Home.tsx`
```typescript
// Hero section text
Welcome to Creamy Chills  // Main headline
Indulge in our delicious desserts, made fresh daily with love  // Subtitle

// Features section
Why Choose Creamy Chills?  // Section title
🌟 Premium Quality  // Feature 1
We use only the finest ingredients  // Feature 1 description
```

#### About Section
**File:** `client/src/pages/Home.tsx`
```typescript
// Update the three feature boxes:
🌟 Premium Quality
🚚 Fast Delivery  
🎨 Custom Orders
```

### 5. Pricing & Fees

#### Delivery Fee
**File:** `server/routes/orders.js` and `client/src/pages/Checkout.tsx`
```javascript
const deliveryFee = deliveryMethod === 'delivery' ? 5.99 : 0;  // Change 5.99
```

#### Tax Rate
**File:** `server/routes/orders.js` and multiple client files
```javascript
const tax = subtotal * 0.08; // Change 0.08 (8%) to your tax rate
```

### 6. Adding Products (Easy Method)

#### Using the Seed Script
**File:** `server/scripts/seedData.js`

Add new products to the `sampleProducts` array:
```javascript
{
  name: 'Your Product Name',
  description: 'Product description here',
  category: 'ice-cream', // Choose: ice-cream, waffle, cake, milkshake, drink
  price: 6.99,
  image: '/images/products/your-image.jpg',
  featured: true, // Show on homepage
  inStock: true,
  // Optional customizations:
  flavors: ['Vanilla', 'Chocolate'],
  toppings: ['Sprinkles', 'Nuts'],
}
```

Then run: `cd server && node scripts/seedData.js`

### 7. Email & Social Media Links

#### Footer Social Links
**File:** `client/src/components/Layout/Footer.tsx`
```typescript
// Update social media links
<IconButton color="inherit" size="small" href="https://facebook.com/yourpage">
<IconButton color="inherit" size="small" href="https://instagram.com/yourpage">
```

### 8. Order Timing

#### Estimated Delivery Times
**File:** `server/routes/orders.js`
```javascript
estimatedDeliveryTime: new Date(Date.now() + (deliveryMethod === 'delivery' ? 45 : 20) * 60000)
// Change 45 minutes for delivery, 20 minutes for pickup
```

### 9. Payment Configuration

#### Stripe Setup
1. Get Stripe keys from dashboard.stripe.com
2. Update environment files:

**File:** `server/.env`
```
STRIPE_SECRET_KEY=sk_test_your_key_here
```

**File:** `client/.env`
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 10. SEO & Meta Information

#### Page Titles
**File:** `client/public/index.html`
```html
<title>Creamy Chills - Online Dessert Shop</title>
<meta name="description" content="Order delicious desserts online for delivery or pickup">
```

## Quick Customization Checklist

- [ ] Update store name in navbar and footer
- [ ] Change contact information
- [ ] Modify color scheme in theme file
- [ ] Add/remove product categories
- [ ] Update homepage text and features
- [ ] Set correct tax rate and delivery fee
- [ ] Add your products via seed script
- [ ] Configure Stripe payment keys
- [ ] Update social media links
- [ ] Set delivery/pickup timing

## Need Help?

For more complex customizations:
1. Check the main README.md file
2. Look at component files in `client/src/components/`
3. Review API routes in `server/routes/`
4. Test changes in development before deploying