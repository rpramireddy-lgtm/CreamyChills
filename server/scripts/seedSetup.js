const mongoose = require('mongoose');
const Category = require('../models/Category');
const ModifierGroup = require('../models/ModifierGroup');
require('dotenv').config();

const categories = [
  { name: 'Waffles', slug: 'waffles', sortOrder: 1, color: '#d4859a' },
  { name: 'Crepes', slug: 'crepes', sortOrder: 2, color: '#e1a5b4' },
  { name: 'Cookie Dough', slug: 'cookie-dough', sortOrder: 3, color: '#c66481' },
  { name: 'Cakes', slug: 'cakes', sortOrder: 4, color: '#b03160' },
  { name: 'Sundaes', slug: 'sundaes', sortOrder: 5, color: '#d4859a' },
  { name: 'Milkshakes', slug: 'milkshakes', sortOrder: 6, color: '#e1a5b4' },
  { name: 'Smoothies', slug: 'smoothies', sortOrder: 7, color: '#fcf5f6' },
  { name: 'Slush', slug: 'slush', sortOrder: 8, color: '#c66481' },
  { name: 'Ice Cream', slug: 'ice-cream', sortOrder: 9, color: '#b03160' },
  { name: 'Drinks', slug: 'drinks', sortOrder: 10, color: '#d4859a' },
  { name: 'Hot Drinks', slug: 'hot-drinks', sortOrder: 11, color: '#e1a5b4' },
  { name: 'Loaded Kunafa', slug: 'loaded-kunafa', sortOrder: 12, color: '#c66481' },
  { name: 'Donuts', slug: 'donuts', sortOrder: 13, color: '#b03160' },
  { name: 'Extras', slug: 'extras', sortOrder: 14, color: '#fcf5f6' }
];

const modifierGroups = [
  {
    name: 'Extra Sauce',
    description: 'Add extra sauce to your dessert',
    isRequired: false,
    maxSelection: 3,
    modifiers: [
      { name: 'Nutella', groupName: 'Extra Sauce', price: 1.00, sortOrder: 1 },
      { name: 'Biscoff', groupName: 'Extra Sauce', price: 1.00, sortOrder: 2 },
      { name: 'White Chocolate', groupName: 'Extra Sauce', price: 1.00, sortOrder: 3 },
      { name: 'Milk Chocolate', groupName: 'Extra Sauce', price: 1.00, sortOrder: 4 },
      { name: 'Pistachio', groupName: 'Extra Sauce', price: 1.50, sortOrder: 5 },
      { name: 'Caramel', groupName: 'Extra Sauce', price: 1.00, sortOrder: 6 },
      { name: 'Toffee', groupName: 'Extra Sauce', price: 1.00, sortOrder: 7 }
    ],
    sortOrder: 1
  },
  {
    name: 'Extra Toppings',
    description: 'Add extra toppings to your dessert',
    isRequired: false,
    maxSelection: 5,
    modifiers: [
      { name: 'Oreo Crumbs', groupName: 'Extra Toppings', price: 1.00, sortOrder: 1 },
      { name: 'Biscoff Crumbs', groupName: 'Extra Toppings', price: 1.00, sortOrder: 2 },
      { name: 'Chocolate Curls', groupName: 'Extra Toppings', price: 1.00, sortOrder: 3 },
      { name: 'Sprinkles', groupName: 'Extra Toppings', price: 0.75, sortOrder: 4 },
      { name: 'Kunafa', groupName: 'Extra Toppings', price: 1.50, sortOrder: 5 },
      { name: 'Nuts', groupName: 'Extra Toppings', price: 1.00, sortOrder: 6 },
      { name: 'Brownie Pieces', groupName: 'Extra Toppings', price: 1.50, sortOrder: 7 }
    ],
    sortOrder: 2
  },
  {
    name: 'Add Ice Cream',
    description: 'Add a scoop of ice cream',
    isRequired: false,
    maxSelection: 3,
    modifiers: [
      { name: 'Vanilla Scoop', groupName: 'Add Ice Cream', price: 1.50, sortOrder: 1 },
      { name: 'Chocolate Scoop', groupName: 'Add Ice Cream', price: 1.50, sortOrder: 2 },
      { name: 'Strawberry Scoop', groupName: 'Add Ice Cream', price: 1.50, sortOrder: 3 },
      { name: 'Bubblegum Scoop', groupName: 'Add Ice Cream', price: 1.50, sortOrder: 4 },
      { name: 'Ferrero Scoop', groupName: 'Add Ice Cream', price: 1.75, sortOrder: 5 },
      { name: 'Pistachio Scoop', groupName: 'Add Ice Cream', price: 1.75, sortOrder: 6 }
    ],
    sortOrder: 3
  },
  {
    name: 'Size',
    description: 'Choose your size',
    isRequired: true,
    minSelection: 1,
    maxSelection: 1,
    modifiers: [
      { name: 'Regular', groupName: 'Size', price: 0, sortOrder: 1 },
      { name: 'Large', groupName: 'Size', price: 1.50, sortOrder: 2 }
    ],
    sortOrder: 4
  }
];

const seedSetup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creamychills');
    
    console.log('Seeding categories...');
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log(`✓ ${categories.length} categories created`);
    
    console.log('Seeding modifier groups...');
    await ModifierGroup.deleteMany({});
    await ModifierGroup.insertMany(modifierGroups);
    console.log(`✓ ${modifierGroups.length} modifier groups created`);
    
    console.log('✓ Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding setup:', error);
    process.exit(1);
  }
};

seedSetup();
