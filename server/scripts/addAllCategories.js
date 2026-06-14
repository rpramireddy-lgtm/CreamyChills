const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const waffles = [
  { name: 'Classic Belgian Waffle', description: 'Traditional Belgian waffle with syrup', category: 'waffle', price: 7.99, image: '/images/products/belgian-waffle.jpg', featured: true, sizes: [{ name: 'Regular', price: 7.99 }, { name: 'Large', price: 9.99 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Strawberry Waffle', description: 'Fresh strawberries and cream', category: 'waffle', price: 8.49, image: '/images/products/strawberry-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.49 }, { name: 'Large', price: 10.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Blueberry Waffle', description: 'Blueberries and maple syrup', category: 'waffle', price: 8.49, image: '/images/products/blueberry-waffle.jpg', featured: true, sizes: [{ name: 'Regular', price: 8.49 }, { name: 'Large', price: 10.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Chocolate Chip Waffle', description: 'Loaded with chocolate chips', category: 'waffle', price: 8.99, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.99 }, { name: 'Large', price: 10.99 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Nutella Waffle', description: 'Rich Nutella spread waffle', category: 'waffle', price: 9.49, image: '/images/products/nutella-waffle.jpg', featured: true, sizes: [{ name: 'Regular', price: 9.49 }, { name: 'Large', price: 11.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Caramel Apple Waffle', description: 'Caramel and apple pieces', category: 'waffle', price: 8.99, image: '/images/products/caramel-apple-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.99 }, { name: 'Large', price: 10.99 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Red Velvet Waffle', description: 'Red velvet flavored waffle', category: 'waffle', price: 9.99, image: '/images/products/red-velvet-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 9.99 }, { name: 'Large', price: 11.99 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Banana Waffle', description: 'Fresh banana slices', category: 'waffle', price: 8.49, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.49 }, { name: 'Large', price: 10.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Pecan Waffle', description: 'Crunchy pecan pieces', category: 'waffle', price: 9.49, image: '/images/products/belgian-waffle.jpg', featured: true, sizes: [{ name: 'Regular', price: 9.49 }, { name: 'Large', price: 11.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Cinnamon Waffle', description: 'Warm cinnamon spice', category: 'waffle', price: 8.29, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.29 }, { name: 'Large', price: 10.29 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Oreo Waffle', description: 'Crushed Oreo cookies', category: 'waffle', price: 9.99, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 9.99 }, { name: 'Large', price: 11.99 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Peanut Butter Waffle', description: 'Creamy peanut butter', category: 'waffle', price: 9.49, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 9.49 }, { name: 'Large', price: 11.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Coconut Waffle', description: 'Toasted coconut flakes', category: 'waffle', price: 8.99, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.99 }, { name: 'Large', price: 10.99 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'Lemon Waffle', description: 'Zesty lemon flavor', category: 'waffle', price: 8.49, image: '/images/products/belgian-waffle.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.49 }, { name: 'Large', price: 10.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true },
  { name: 'S\'mores Waffle', description: 'Graham, chocolate, marshmallow', category: 'waffle', price: 10.49, image: '/images/products/belgian-waffle.jpg', featured: true, sizes: [{ name: 'Regular', price: 10.49 }, { name: 'Large', price: 12.49 }], toppings: ['Butter', 'Syrup', 'Whipped Cream', 'Berries', 'Chocolate Chips', 'Ice Cream'], inStock: true }
];

const cakes = [
  { name: 'Chocolate Fudge Cake', description: 'Rich chocolate fudge cake', category: 'cake', price: 12.99, image: '/images/products/chocolate-cake.jpg', featured: true, sizes: [{ name: 'Slice', price: 12.99 }, { name: 'Whole Cake', price: 89.99 }], inStock: true },
  { name: 'Red Velvet Cake', description: 'Classic red velvet with cream cheese', category: 'cake', price: 13.49, image: '/images/products/red-velvet-cake.jpg', featured: true, sizes: [{ name: 'Slice', price: 13.49 }, { name: 'Whole Cake', price: 94.99 }], inStock: true },
  { name: 'Carrot Cake', description: 'Moist carrot cake with walnuts', category: 'cake', price: 11.99, image: '/images/products/carrot-cake.jpg', featured: false, sizes: [{ name: 'Slice', price: 11.99 }, { name: 'Whole Cake', price: 84.99 }], inStock: true },
  { name: 'Lemon Cake', description: 'Fresh lemon sponge cake', category: 'cake', price: 10.99, image: '/images/products/lemon-cake.jpg', featured: false, sizes: [{ name: 'Slice', price: 10.99 }, { name: 'Whole Cake', price: 79.99 }], inStock: true },
  { name: 'Black Forest Cake', description: 'Cherry and chocolate delight', category: 'cake', price: 14.99, image: '/images/products/black-forest.jpg', featured: true, sizes: [{ name: 'Slice', price: 14.99 }, { name: 'Whole Cake', price: 104.99 }], inStock: true },
  { name: 'Strawberry Shortcake', description: 'Fresh strawberries and cream', category: 'cake', price: 12.49, image: '/images/products/strawberry-shortcake.jpg', featured: false, sizes: [{ name: 'Slice', price: 12.49 }, { name: 'Whole Cake', price: 87.99 }], inStock: true },
  { name: 'Vanilla Sponge Cake', description: 'Light vanilla sponge', category: 'cake', price: 9.99, image: '/images/products/vanilla-sponge.jpg', featured: false, sizes: [{ name: 'Slice', price: 9.99 }, { name: 'Whole Cake', price: 74.99 }], inStock: true },
  { name: 'Tiramisu Cake', description: 'Coffee-soaked Italian delight', category: 'cake', price: 15.99, image: '/images/products/chocolate-cake.jpg', featured: false, sizes: [{ name: 'Slice', price: 15.99 }, { name: 'Whole Cake', price: 111.99 }], inStock: true },
  { name: 'Cheesecake', description: 'Creamy New York style', category: 'cake', price: 13.99, image: '/images/products/strawberry-cheesecake.jpg', featured: true, sizes: [{ name: 'Slice', price: 13.99 }, { name: 'Whole Cake', price: 97.99 }], inStock: true },
  { name: 'Banana Cake', description: 'Moist banana cake', category: 'cake', price: 10.49, image: '/images/products/vanilla-sponge.jpg', featured: false, sizes: [{ name: 'Slice', price: 10.49 }, { name: 'Whole Cake', price: 77.99 }], inStock: true },
  { name: 'Coconut Cake', description: 'Tropical coconut layers', category: 'cake', price: 11.99, image: '/images/products/vanilla-sponge.jpg', featured: false, sizes: [{ name: 'Slice', price: 11.99 }, { name: 'Whole Cake', price: 84.99 }], inStock: true },
  { name: 'Funfetti Cake', description: 'Colorful sprinkle cake', category: 'cake', price: 10.99, image: '/images/products/vanilla-sponge.jpg', featured: false, sizes: [{ name: 'Slice', price: 10.99 }, { name: 'Whole Cake', price: 79.99 }], inStock: true },
  { name: 'German Chocolate Cake', description: 'Rich chocolate with coconut', category: 'cake', price: 14.49, image: '/images/products/chocolate-cake.jpg', featured: false, sizes: [{ name: 'Slice', price: 14.49 }, { name: 'Whole Cake', price: 101.99 }], inStock: true },
  { name: 'Pineapple Upside Down', description: 'Classic pineapple cake', category: 'cake', price: 11.49, image: '/images/products/vanilla-sponge.jpg', featured: false, sizes: [{ name: 'Slice', price: 11.49 }, { name: 'Whole Cake', price: 82.99 }], inStock: true },
  { name: 'Lemon Meringue Cake', description: 'Lemon cake with meringue', category: 'cake', price: 13.99, image: '/images/products/lemon-meringue.jpg', featured: true, sizes: [{ name: 'Slice', price: 13.99 }, { name: 'Whole Cake', price: 97.99 }], inStock: true }
];

const milkshakes = [
  { name: 'Vanilla Milkshake', description: 'Classic vanilla milkshake', category: 'milkshake', price: 5.99, image: '/images/products/vanilla-shake.jpg', featured: true, sizes: [{ name: 'Regular', price: 5.99 }, { name: 'Large', price: 7.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Chocolate Milkshake', description: 'Rich chocolate milkshake', category: 'milkshake', price: 6.49, image: '/images/products/chocolate-pb-shake.jpg', featured: true, sizes: [{ name: 'Regular', price: 6.49 }, { name: 'Large', price: 8.49 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Strawberry Milkshake', description: 'Fresh strawberry milkshake', category: 'milkshake', price: 6.29, image: '/images/products/strawberry-milkshake.jpg', featured: false, sizes: [{ name: 'Regular', price: 6.29 }, { name: 'Large', price: 8.29 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Oreo Milkshake', description: 'Crushed Oreo cookies', category: 'milkshake', price: 7.49, image: '/images/products/vanilla-shake.jpg', featured: true, sizes: [{ name: 'Regular', price: 7.49 }, { name: 'Large', price: 9.49 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Peanut Butter Shake', description: 'Creamy peanut butter shake', category: 'milkshake', price: 7.99, image: '/images/products/chocolate-pb-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 7.99 }, { name: 'Large', price: 9.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Banana Split Shake', description: 'Banana split flavored shake', category: 'milkshake', price: 8.49, image: '/images/products/banana-split-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.49 }, { name: 'Large', price: 10.49 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Coffee Milkshake', description: 'Rich coffee flavored shake', category: 'milkshake', price: 6.99, image: '/images/products/coffee-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 6.99 }, { name: 'Large', price: 8.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Unicorn Milkshake', description: 'Colorful magical shake', category: 'milkshake', price: 9.99, image: '/images/products/unicorn-milkshake.jpg', featured: true, sizes: [{ name: 'Regular', price: 9.99 }, { name: 'Large', price: 11.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Birthday Cake Shake', description: 'Birthday cake flavored', category: 'milkshake', price: 8.99, image: '/images/products/birthday-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.99 }, { name: 'Large', price: 10.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Caramel Shake', description: 'Sweet caramel milkshake', category: 'milkshake', price: 7.49, image: '/images/products/vanilla-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 7.49 }, { name: 'Large', price: 9.49 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Mint Chocolate Shake', description: 'Refreshing mint chocolate', category: 'milkshake', price: 7.99, image: '/images/products/chocolate-pb-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 7.99 }, { name: 'Large', price: 9.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Cookies & Cream Shake', description: 'Cookies and cream delight', category: 'milkshake', price: 7.99, image: '/images/products/vanilla-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 7.99 }, { name: 'Large', price: 9.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Salted Caramel Shake', description: 'Sweet and salty caramel', category: 'milkshake', price: 8.49, image: '/images/products/vanilla-shake.jpg', featured: true, sizes: [{ name: 'Regular', price: 8.49 }, { name: 'Large', price: 10.49 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Rocky Road Shake', description: 'Chocolate, marshmallow, nuts', category: 'milkshake', price: 8.99, image: '/images/products/chocolate-pb-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 8.99 }, { name: 'Large', price: 10.99 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true },
  { name: 'Nutella Shake', description: 'Rich Nutella milkshake', category: 'milkshake', price: 9.49, image: '/images/products/chocolate-pb-shake.jpg', featured: false, sizes: [{ name: 'Regular', price: 9.49 }, { name: 'Large', price: 11.49 }], flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana', 'Oreo', 'Peanut Butter'], inStock: true }
];

const drinks = [
  { name: 'Fresh Lemonade', description: 'Freshly squeezed lemonade', category: 'drink', price: 3.99, image: '/images/products/lemonade.jpg', featured: true, sizes: [{ name: 'Regular', price: 3.99 }, { name: 'Large', price: 5.99 }], inStock: true },
  { name: 'Iced Coffee', description: 'Cold brew iced coffee', category: 'drink', price: 4.49, image: '/images/products/iced-coffee.jpg', featured: false, sizes: [{ name: 'Regular', price: 4.49 }, { name: 'Large', price: 6.49 }], inStock: true },
  { name: 'Hot Chocolate', description: 'Rich hot chocolate', category: 'drink', price: 4.99, image: '/images/products/hot-chocolate.jpg', featured: true, sizes: [{ name: 'Regular', price: 4.99 }, { name: 'Large', price: 6.99 }], inStock: true },
  { name: 'Cappuccino', description: 'Italian cappuccino', category: 'drink', price: 5.49, image: '/images/products/cappuccino.jpg', featured: false, sizes: [{ name: 'Regular', price: 5.49 }, { name: 'Large', price: 7.49 }], inStock: true },
  { name: 'Chai Latte', description: 'Spiced chai latte', category: 'drink', price: 5.99, image: '/images/products/chai-latte.jpg', featured: false, sizes: [{ name: 'Regular', price: 5.99 }, { name: 'Large', price: 7.99 }], inStock: true },
  { name: 'Matcha Latte', description: 'Green tea matcha latte', category: 'drink', price: 6.49, image: '/images/products/matcha-latte.jpg', featured: false, sizes: [{ name: 'Regular', price: 6.49 }, { name: 'Large', price: 8.49 }], inStock: true },
  { name: 'Iced Tea', description: 'Refreshing iced tea', category: 'drink', price: 3.49, image: '/images/products/iced-tea.jpg', featured: false, sizes: [{ name: 'Regular', price: 3.49 }, { name: 'Large', price: 5.49 }], inStock: true },
  { name: 'Fruit Smoothie', description: 'Mixed fruit smoothie', category: 'drink', price: 6.99, image: '/images/products/lemonade.jpg', featured: true, sizes: [{ name: 'Regular', price: 6.99 }, { name: 'Large', price: 8.99 }], flavors: ['Strawberry', 'Mango', 'Berry Mix', 'Tropical'], inStock: true },
  { name: 'Espresso', description: 'Strong Italian espresso', category: 'drink', price: 3.99, image: '/images/products/cappuccino.jpg', featured: false, sizes: [{ name: 'Single', price: 3.99 }, { name: 'Double', price: 5.99 }], inStock: true },
  { name: 'Americano', description: 'Classic americano coffee', category: 'drink', price: 4.49, image: '/images/products/iced-coffee.jpg', featured: false, sizes: [{ name: 'Regular', price: 4.49 }, { name: 'Large', price: 6.49 }], inStock: true },
  { name: 'Mocha', description: 'Chocolate coffee mocha', category: 'drink', price: 5.99, image: '/images/products/hot-chocolate.jpg', featured: false, sizes: [{ name: 'Regular', price: 5.99 }, { name: 'Large', price: 7.99 }], inStock: true },
  { name: 'Vanilla Latte', description: 'Vanilla flavored latte', category: 'drink', price: 5.49, image: '/images/products/cappuccino.jpg', featured: false, sizes: [{ name: 'Regular', price: 5.49 }, { name: 'Large', price: 7.49 }], inStock: true },
  { name: 'Caramel Macchiato', description: 'Sweet caramel macchiato', category: 'drink', price: 6.49, image: '/images/products/cappuccino.jpg', featured: true, sizes: [{ name: 'Regular', price: 6.49 }, { name: 'Large', price: 8.49 }], inStock: true },
  { name: 'Green Tea', description: 'Traditional green tea', category: 'drink', price: 3.99, image: '/images/products/iced-tea.jpg', featured: false, sizes: [{ name: 'Regular', price: 3.99 }, { name: 'Large', price: 5.99 }], inStock: true },
  { name: 'Sparkling Water', description: 'Refreshing sparkling water', category: 'drink', price: 2.99, image: '/images/products/lemonade.jpg', featured: false, sizes: [{ name: 'Regular', price: 2.99 }, { name: 'Large', price: 4.99 }], flavors: ['Plain', 'Lemon', 'Lime', 'Berry'], inStock: true }
];

async function addAllProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing products in these categories
    await Product.deleteMany({ category: { $in: ['waffle', 'cake', 'milkshake', 'drink'] } });
    console.log('Removed existing products');

    // Add all products
    await Product.insertMany([...waffles, ...cakes, ...milkshakes, ...drinks]);
    console.log(`Added ${waffles.length} waffles, ${cakes.length} cakes, ${milkshakes.length} milkshakes, ${drinks.length} drinks`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

addAllProducts();