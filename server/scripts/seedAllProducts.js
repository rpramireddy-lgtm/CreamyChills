const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const allProducts = [
  // === ICE CREAM ===
  { name: 'Vanilla Ice Cream', description: 'Classic vanilla ice cream', category: 'ice-cream', price: 4.99, image: '/images/products/IceCreams/Vanilla Ice Cream.jpg', featured: true, allergens: ['Dairy'] },
  { name: 'Belgian Chocolate', description: 'Rich Belgian chocolate ice cream', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Belgian Chocolate Ice Cream.jpg', featured: true, allergens: ['Dairy'] },
  { name: 'Chocolate Fudge Brownie', description: 'Chocolate ice cream with fudge brownie', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Chocolate Fudge Brownie.jpg', featured: true, allergens: ['Dairy', 'Gluten'] },
  { name: 'Biscoff Crunch', description: 'Creamy ice cream with Biscoff cookie pieces', category: 'ice-cream', price: 5.29, image: '/images/products/IceCreams/Biscoff Crunch.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Cookie Dough', description: 'Vanilla ice cream with chocolate chip cookie dough', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Chocolate Chip Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
  { name: 'Ferrero Rocher', description: 'Hazelnut ice cream with Ferrero Rocher', category: 'ice-cream', price: 5.99, image: '/images/products/IceCreams/Ferrero Rocher.jpg', featured: true, allergens: ['Dairy', 'Nuts'] },
  { name: 'Bubblegum', description: 'Sweet bubblegum flavored ice cream', category: 'ice-cream', price: 4.99, image: '/images/products/IceCreams/Bubblegum.jpg', allergens: ['Dairy'] },
  { name: 'Strawberry Ripple', description: 'Vanilla ice cream with strawberry ripple', category: 'ice-cream', price: 5.29, image: '/images/products/IceCreams/Strawberry Ripple.jpg', allergens: ['Dairy'] },
  { name: 'Mango Tango', description: 'Refreshing mango sorbet', category: 'ice-cream', price: 5.29, image: '/images/products/IceCreams/Mango Tango.jpg', allergens: ['Dairy'] },
  { name: 'Honeycomb Crunch', description: 'Creamy ice cream with honeycomb', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Honeycomb Crunch.jpg', allergens: ['Dairy'] },
  { name: 'Raspberry Ripple', description: 'Vanilla ice cream with raspberry swirl', category: 'ice-cream', price: 5.29, image: '/images/products/IceCreams/Raspberry Ripple.jpg', allergens: ['Dairy'] },
  { name: 'Toffee Fudge', description: 'Rich toffee fudge ice cream', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Toffee Fudge.jpg', allergens: ['Dairy'] },
  { name: 'Cinnamon Bun', description: 'Cinnamon bun flavored ice cream', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Cinnamon Bun.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Irn Bru', description: 'Scottish Irn Bru flavored ice cream', category: 'ice-cream', price: 5.29, image: '/images/products/IceCreams/Irn Bru.jpg', allergens: ['Dairy'] },
  { name: 'Vegan Vanilla', description: 'Dairy-free vanilla ice cream', category: 'ice-cream', price: 5.49, image: '/images/products/IceCreams/Vegan Vanilla.jpg', allergens: ['Vegan'] },

  // === MILKSHAKES ===
  { name: 'Strawberry Milkshake', description: 'Creamy strawberry milkshake', category: 'milkshake', price: 5.99, image: '/images/products/Milkshakes/Strawberry.jpg', featured: true, allergens: ['Dairy'] },
  { name: 'Oreo Milkshake', description: 'Rich Oreo cookie milkshake', category: 'milkshake', price: 6.49, image: '/images/products/Milkshakes/Oreo Milkshake.jpeg', featured: true, allergens: ['Dairy', 'Gluten'] },
  { name: 'Nutella Milkshake', description: 'Creamy Nutella chocolate milkshake', category: 'milkshake', price: 6.99, image: '/images/products/Milkshakes/Nutella Milkshake.jpeg', featured: true, allergens: ['Dairy', 'Nuts'] },
  { name: 'Kinder Bueno Milkshake', description: 'Indulgent Kinder Bueno milkshake', category: 'milkshake', price: 6.99, image: '/images/products/Milkshakes/Kinder Bueno Milkshake.jpeg', featured: true, allergens: ['Dairy', 'Nuts'] },
  { name: 'Biscoff Milkshake', description: 'Smooth Biscoff cookie milkshake', category: 'milkshake', price: 6.49, image: '/images/products/Milkshakes/Biscoff Milkshake.jpeg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Dubai Milkshake', description: 'Luxurious Dubai chocolate milkshake', category: 'milkshake', price: 7.99, image: '/images/products/Milkshakes/Dubai Milkshake.jpg', featured: true, allergens: ['Dairy', 'Nuts'] },
  { name: 'Ferrero Milkshake', description: 'Hazelnut Ferrero Rocher milkshake', category: 'milkshake', price: 6.99, image: '/images/products/Milkshakes/Ferroro.jpg', allergens: ['Dairy', 'Nuts'] },
  { name: 'Maltesers Milkshake', description: 'Malty Maltesers milkshake', category: 'milkshake', price: 6.49, image: '/images/products/Milkshakes/Maltesers Milkshake.jpeg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Bubblegum Milkshake', description: 'Sweet bubblegum milkshake', category: 'milkshake', price: 5.99, image: '/images/products/Milkshakes/Bubblegum.jpg', allergens: ['Dairy'] },
  { name: 'Mango Milkshake', description: 'Fresh mango milkshake', category: 'milkshake', price: 5.99, image: '/images/products/Milkshakes/Mango.jpg', allergens: ['Dairy'] },
  { name: 'Raspberry Milkshake', description: 'Tangy raspberry milkshake', category: 'milkshake', price: 5.99, image: '/images/products/Milkshakes/Raspberry.jpg', allergens: ['Dairy'] },
  { name: 'Twix Milkshake', description: 'Caramel Twix milkshake', category: 'milkshake', price: 6.49, image: '/images/products/Milkshakes/Twix Milkshake.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Mars Milkshake', description: 'Mars bar milkshake', category: 'milkshake', price: 6.49, image: '/images/products/Milkshakes/Mars.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Pistachio Swirl Milkshake', description: 'Pistachio cream milkshake', category: 'milkshake', price: 6.99, image: '/images/products/Milkshakes/Pistachio Swirl.jpg', allergens: ['Dairy', 'Nuts'] },
  { name: 'Aero Milkshake', description: 'Bubbly Aero chocolate milkshake', category: 'milkshake', price: 6.49, image: '/images/products/Milkshakes/Aero.jpg', allergens: ['Dairy'] },

  // === WAFFLES ===
  { name: 'Kinder Bueno Waffle', description: 'Belgian waffle with Kinder Bueno and cream', category: 'waffle', price: 8.99, image: '/images/products/Waffles/Kinder Bueno Waffle.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Biscoff Waffle', description: 'Crispy waffle with Biscoff spread and crumbs', category: 'waffle', price: 8.49, image: '/images/products/Waffles/Biscoff Waffle.jpg', featured: true, allergens: ['Dairy', 'Gluten'] },
  { name: 'Dubai Kunafa Waffle', description: 'Warm waffle with pistachio cream and golden kunafa', category: 'waffle', price: 9.99, image: '/images/products/Waffles/Dubai Kunafa Waffle.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Ferrero Waffle', description: 'Belgian waffle with Ferrero Rocher and Nutella', category: 'waffle', price: 9.49, image: '/images/products/Waffles/Ferrero Waffle.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Twix Waffle', description: 'Waffle topped with Twix and caramel', category: 'waffle', price: 8.99, image: '/images/products/Waffles/Twix Waffle.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Lolly Pop Waffle', description: 'Fun waffle on a stick with toppings', category: 'waffle', price: 7.99, image: '/images/products/Waffles/Lolly Pop Waffle.jpg', allergens: ['Dairy', 'Gluten'] },

  // === CREPES ===
  { name: 'Nutella Crepe', description: 'Thin crepe filled with warm Nutella', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Nutella Crepe.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Biscoff Crepe', description: 'Crepe with Biscoff spread and crumbs', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Biscoff.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Kinder Bueno Crepe', description: 'Crepe with Kinder Bueno and white chocolate', category: 'crepe', price: 7.99, image: '/images/products/Crepes/Kinder Bueno.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Ferrero Crepe', description: 'Crepe with Ferrero Rocher and hazelnut', category: 'crepe', price: 8.49, image: '/images/products/Crepes/Ferroro Crepe.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Oreo Crepe', description: 'Crepe with Oreo crumbs and chocolate sauce', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Oreo Crepe.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Dubai Chocolate Crepe', description: 'Crepe with pistachio cream and kunafa', category: 'crepe', price: 8.99, image: '/images/products/Crepes/Dubai Choclate Crepe.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Strawberry & Nutella Crepe', description: 'Crepe with fresh strawberries and Nutella', category: 'crepe', price: 7.99, image: '/images/products/Crepes/Strawberry & Nutella.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Maltesers Crepe', description: 'Crepe with Maltesers and chocolate', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Maltesers Crepe.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Twix Crepe', description: 'Crepe with Twix, caramel and chocolate', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Twix Crepe.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Banoffee Crepe', description: 'Crepe with banana, toffee and cream', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Banoffe Crepe.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Bounty Crepe', description: 'Coconut and chocolate crepe', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Bounty Crepe.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Pistachio Crepe', description: 'Crepe with pistachio cream', category: 'crepe', price: 8.49, image: '/images/products/Crepes/Pistachio.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Aero Crepe', description: 'Crepe with bubbly Aero chocolate', category: 'crepe', price: 7.49, image: '/images/products/Crepes/Aero.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: "Reese's Crepe", description: "Crepe with Reese's peanut butter cups", category: 'crepe', price: 7.99, image: '/images/products/Crepes/Resees Crepe.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },

  // === COOKIE DOUGH ===
  { name: 'Nutella Cookie Dough', description: 'Warm cookie dough with Nutella', category: 'cookie-dough', price: 7.99, image: '/images/products/Cookie Dough/Nutella Cookie Dough.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts', 'Eggs'] },
  { name: 'Biscoff Cookie Dough', description: 'Cookie dough with Biscoff spread', category: 'cookie-dough', price: 7.99, image: '/images/products/Cookie Dough/Biscoff Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
  { name: 'Kinder Bueno Cookie Dough', description: 'Cookie dough with Kinder Bueno', category: 'cookie-dough', price: 8.49, image: '/images/products/Cookie Dough/Kinder Bueno Cooke Dough.jpg', allergens: ['Dairy', 'Gluten', 'Nuts', 'Eggs'] },
  { name: 'Oreo Cookie Dough', description: 'Cookie dough with Oreo crumbs', category: 'cookie-dough', price: 7.99, image: '/images/products/Cookie Dough/Oreo cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
  { name: 'Pistachio Cookie Dough', description: 'Cookie dough with pistachio cream', category: 'cookie-dough', price: 8.49, image: '/images/products/Cookie Dough/Pistachio Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Nuts', 'Eggs'] },
  { name: 'Dubai Chocolate Cookie Dough', description: 'Cookie dough with Dubai chocolate and kunafa', category: 'cookie-dough', price: 8.99, image: '/images/products/Cookie Dough/Dubai Milk Choclate Cookie Dough.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts', 'Eggs'] },
  { name: 'Red Velvet Cookie Dough', description: 'Red velvet flavored cookie dough', category: 'cookie-dough', price: 7.99, image: '/images/products/Cookie Dough/Red Velvet Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
  { name: 'Double Chocolate Cookie Dough', description: 'Rich double chocolate cookie dough', category: 'cookie-dough', price: 7.99, image: '/images/products/Cookie Dough/Double Choclate Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
  { name: 'Strawberry Nutella Cookie Dough', description: 'Cookie dough with strawberry and Nutella', category: 'cookie-dough', price: 8.49, image: '/images/products/Cookie Dough/Strawberry Nutella Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Nuts', 'Eggs'] },
  { name: 'White Chocolate Cookie Dough', description: 'Cookie dough with white chocolate', category: 'cookie-dough', price: 7.99, image: '/images/products/Cookie Dough/White Choclate Cookie Dough.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },

  // === SUNDAES ===
  { name: 'Oreo Sundae', description: 'Vanilla ice cream with Oreo crumbs and chocolate sauce', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Oreo Sundae.jpg', featured: true, allergens: ['Dairy', 'Gluten'] },
  { name: 'Biscoff Sundae', description: 'Ice cream with Biscoff spread and crumbs', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Biscoff Sundae.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Kinder Bueno Sundae', description: 'Ice cream with Kinder Bueno and hazelnut', category: 'sundae', price: 7.99, image: '/images/products/Sundaes/Kinder Bueno Sundae.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Ferrero Sundae', description: 'Ice cream with Ferrero Rocher and Nutella', category: 'sundae', price: 7.99, image: '/images/products/Sundaes/Ferrror Sundae.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Maltesers Sundae', description: 'Ice cream with Maltesers and chocolate', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Maltesers Sundae.jpg', allergens: ['Dairy', 'Gluten'] },
  { name: 'Strawberry Sundae', description: 'Ice cream with fresh strawberries and sauce', category: 'sundae', price: 6.99, image: '/images/products/Sundaes/Strawberry Sundae.jpg', allergens: ['Dairy'] },
  { name: 'Banana Sundae', description: 'Ice cream with banana and toffee sauce', category: 'sundae', price: 6.99, image: '/images/products/Sundaes/Banana Sundae.jpg', allergens: ['Dairy'] },
  { name: 'Chocolate Brownie Sundae', description: 'Ice cream with warm brownie and fudge', category: 'sundae', price: 7.99, image: '/images/products/Sundaes/Choclate Brownie Sundae.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
  { name: 'Chocolate Fudge Sundae', description: 'Ice cream with rich fudge sauce', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Choclate Fudge Sundae.jpg', allergens: ['Dairy'] },
  { name: 'Twix Sundae', description: 'Ice cream with Twix pieces and caramel', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Twix Sundae.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Mint Aero Sundae', description: 'Mint ice cream with Aero bubbles', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Mint Aero Sundae.jpg', allergens: ['Dairy'] },
  { name: 'Mars Caramel Crunch Sundae', description: 'Ice cream with Mars bar and caramel', category: 'sundae', price: 7.49, image: '/images/products/Sundaes/Mars Caramel Crunch Sundae.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Kids Sundae', description: 'Mini sundae with sprinkles for little ones', category: 'sundae', price: 4.99, image: '/images/products/Sundaes/Kids Sundae.jpg', allergens: ['Dairy'] },

  // === LOADED KUNAFA ===
  { name: 'Loaded Kunafa', description: 'Crispy kunafa with cream and pistachio', category: 'loaded-kunafa', price: 8.99, image: '/images/products/Loaded Kunafa/Dubai Kunafas.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Loaded Banana Kunafa', description: 'Kunafa with fresh banana and cream', category: 'loaded-kunafa', price: 9.49, image: '/images/products/Loaded Kunafa/Loaded Banana Kunafa.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Loaded Strawberry Kunafa', description: 'Kunafa with strawberries and cream', category: 'loaded-kunafa', price: 9.49, image: '/images/products/Loaded Kunafa/Loaded Kunafa Strawberry.jpg', allergens: ['Dairy', 'Gluten', 'Nuts'] },
  { name: 'Loaded Kunafa Black Label', description: 'Premium kunafa with dark chocolate and pistachio', category: 'loaded-kunafa', price: 10.99, image: '/images/products/Loaded Kunafa/Loaded Kunafa black label.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Nuts'] },

  // === CAKES ===
  { name: 'Matilda Cake', description: 'Rich chocolate Matilda cake', category: 'cake', price: 5.99, image: '/images/products/Cakes/Matilda Cake.jpg', featured: true, allergens: ['Dairy', 'Gluten', 'Eggs'], sizes: [{ name: 'Slice', price: 5.99 }, { name: 'Whole', price: 24.99 }] },
  { name: 'Dream Cake', description: 'Layered dream cake with frosting', category: 'cake', price: 5.99, image: '/images/products/Cakes/Dream Cake.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'], sizes: [{ name: 'Slice', price: 5.99 }, { name: 'Whole', price: 27.99 }] },
  { name: 'Old School Cake', description: 'Classic old school sponge cake', category: 'cake', price: 4.99, image: '/images/products/Cakes/Old School Cake.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'], sizes: [{ name: 'Slice', price: 4.99 }, { name: 'Whole', price: 22.99 }] },

  // === SLUSHES ===
  { name: 'Slush', description: 'Frozen slush in your choice of flavour', category: 'slush', price: 3.99, image: '/images/products/Slushes & Tango Blast/Slushes.jpg', allergens: [], sizes: [{ name: 'Regular', price: 3.99 }, { name: 'Large', price: 4.99 }] },
  { name: 'Tango Ice Blast', description: 'Frozen Tango Ice Blast', category: 'slush', price: 4.49, image: '/images/products/Slushes & Tango Blast/Tango Ice Blast.jpg', allergens: [], sizes: [{ name: 'Regular', price: 4.49 }, { name: 'Large', price: 5.49 }] },

  // === DONUTS ===
  { name: 'Doughnut Customisation', description: 'Build your own doughnut with sauces and toppings', category: 'donut', price: 5.99, image: '/images/products/Donut Customisation/Doughnut Customisation.jpg', allergens: ['Dairy', 'Gluten', 'Eggs'] },
];

// Add defaults
allProducts.forEach(p => {
  p.inStock = true;
  p.featured = p.featured || false;
  p.preparationTime = p.category === 'ice-cream' ? 5 : p.category === 'milkshake' ? 5 : 10;
});

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creamychills');
    await Product.deleteMany({});
    await Product.insertMany(allProducts);
    console.log(`✅ ${allProducts.length} products seeded`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAll();
