const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  // Ice Creams
  {
    name: 'Vanilla Ice Cream',
    description: 'Classic vanilla ice cream',
    category: 'ice-cream',
    price: 4.99,
    image: '/images/products/IceCreams/Vanilla Ice Cream.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Belgian Chocolate',
    description: 'Rich Belgian chocolate ice cream',
    category: 'ice-cream',
    price: 5.49,
    image: '/images/products/IceCreams/Belgian Chocolate Ice Cream.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Chocolate Fudge Brownie',
    description: 'Chocolate ice cream with fudge brownie pieces',
    category: 'ice-cream',
    price: 5.49,
    image: '/images/products/IceCreams/Chocolate Fudge Brownie.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Biscoff Crunch',
    description: 'Creamy ice cream with Biscoff cookie pieces',
    category: 'ice-cream',
    price: 5.29,
    image: '/images/products/IceCreams/Biscoff Crunch.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Cookie Dough',
    description: 'Vanilla ice cream loaded with chocolate chip cookie dough',
    category: 'ice-cream',
    price: 5.49,
    image: '/images/products/IceCreams/Chocolate Chip Cookie Dough.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Ferrero Rocher',
    description: 'Hazelnut ice cream with Ferrero Rocher pieces',
    category: 'ice-cream',
    price: 5.99,
    image: '/images/products/IceCreams/Ferrero Rocher.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Bubblegum',
    description: 'Sweet bubblegum flavored ice cream',
    category: 'ice-cream',
    price: 4.99,
    image: '/images/products/IceCreams/Bubblegum.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Strawberry Ripple',
    description: 'Vanilla ice cream with strawberry ripple',
    category: 'ice-cream',
    price: 5.29,
    image: '/images/products/IceCreams/Strawberry Ripple.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Mango Tango',
    description: 'Refreshing mango sorbet',
    category: 'ice-cream',
    price: 5.29,
    image: '/images/products/IceCreams/Mango Tango.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Honeycomb Crunch',
    description: 'Creamy ice cream with honeycomb pieces',
    category: 'ice-cream',
    price: 5.49,
    image: '/images/products/IceCreams/Honeycomb Crunch.jpg',
    featured: false,
    inStock: true,
  },

  // Milkshakes
  {
    name: 'Strawberry Milkshake',
    description: 'Creamy strawberry milkshake',
    category: 'milkshake',
    price: 5.99,
    image: '/images/products/Milkshakes/Strawberry.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Oreo Milkshake',
    description: 'Rich Oreo cookie milkshake',
    category: 'milkshake',
    price: 6.49,
    image: '/images/products/Milkshakes/Oreo Milkshake.jpeg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Nutella Milkshake',
    description: 'Creamy Nutella chocolate milkshake',
    category: 'milkshake',
    price: 6.99,
    image: '/images/products/Milkshakes/Nutella Milkshake.jpeg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Kinder Bueno Milkshake',
    description: 'Indulgent Kinder Bueno milkshake',
    category: 'milkshake',
    price: 6.99,
    image: '/images/products/Milkshakes/Kinder Bueno Milkshake.jpeg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Biscoff Milkshake',
    description: 'Smooth Biscoff cookie milkshake',
    category: 'milkshake',
    price: 6.49,
    image: '/images/products/Milkshakes/Biscoff Milkshake.jpeg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Dubai Milkshake',
    description: 'Luxurious Dubai chocolate milkshake',
    category: 'milkshake',
    price: 7.99,
    image: '/images/products/Milkshakes/Dubai Milkshake.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Ferrero Milkshake',
    description: 'Hazelnut Ferrero Rocher milkshake',
    category: 'milkshake',
    price: 6.99,
    image: '/images/products/Milkshakes/Ferroro.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Maltesers Milkshake',
    description: 'Malty Maltesers milkshake',
    category: 'milkshake',
    price: 6.49,
    image: '/images/products/Milkshakes/Maltesers Milkshake.jpeg',
    featured: false,
    inStock: true,
  },

  // Waffles
  {
    name: 'Kinder Bueno Waffle',
    description: 'Belgian waffle with Kinder Bueno',
    category: 'waffle',
    price: 8.99,
    image: '/images/products/Waffles/Kinder Bueno Waffle.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Biscoff Waffle',
    description: 'Crispy waffle with Biscoff spread',
    category: 'waffle',
    price: 8.49,
    image: '/images/products/Waffles/Biscoff Waffle.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Dubai Kunafa Waffle',
    description: 'Fusion waffle with kunafa topping',
    category: 'waffle',
    price: 9.99,
    image: '/images/products/Waffles/Dubai Kunafa Waffle.jpg',
    featured: true,
    inStock: true,
  },
  {
    name: 'Ferrero Waffle',
    description: 'Belgian waffle with Ferrero Rocher',
    category: 'waffle',
    price: 9.49,
    image: '/images/products/Waffles/Ferrero Waffle.jpg',
    featured: false,
    inStock: true,
  },
  {
    name: 'Twix Waffle',
    description: 'Waffle topped with Twix chocolate',
    category: 'waffle',
    price: 8.99,
    image: '/images/products/Waffles/Twix Waffle.jpg',
    featured: false,
    inStock: true,
  },

  // Cakes
  {
    name: 'Matilda Cake',
    description: 'Rich chocolate Matilda cake',
    category: 'cake',
    price: 24.99,
    image: '/images/products/Cakes/Matilda Cake.jpg',
    featured: true,
    sizes: [
      { name: 'Small', price: 24.99 },
      { name: 'Medium', price: 34.99 },
      { name: 'Large', price: 44.99 },
    ],
    inStock: true,
  },
  {
    name: 'Dream Cake',
    description: 'Layered dream cake with frosting',
    category: 'cake',
    price: 27.99,
    image: '/images/products/Cakes/Dream Cake.jpg',
    featured: true,
    sizes: [
      { name: 'Small', price: 27.99 },
      { name: 'Medium', price: 37.99 },
      { name: 'Large', price: 47.99 },
    ],
    inStock: true,
  },
  {
    name: 'Old School Cake',
    description: 'Classic old school cake',
    category: 'cake',
    price: 22.99,
    image: '/images/products/Cakes/Old School Cake.jpg',
    featured: false,
    sizes: [
      { name: 'Small', price: 22.99 },
      { name: 'Medium', price: 32.99 },
      { name: 'Large', price: 42.99 },
    ],
    inStock: true,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creamychills');
    
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('Products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();