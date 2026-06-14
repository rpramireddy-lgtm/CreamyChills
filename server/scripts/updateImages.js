const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, 'seedData.js');
let content = fs.readFileSync(seedDataPath, 'utf8');

// Ice cream images
content = content.replace(/image: '\/images\/products\/vanilla-ice-cream\.jpg',/g, (match, offset) => {
  const beforeMatch = content.substring(0, offset);
  const productCount = (beforeMatch.match(/name: '/g) || []).length;
  
  const images = [
    '/images/products/vanilla-ice-cream.jpg',
    '/images/products/chocolate-brownie.jpg',
    '/images/products/rainbow-cone.jpg',
    '/images/products/mint-chocolate.jpg',
    '/images/products/cookies-cream.jpg',
    '/images/products/strawberry-cheesecake.jpg',
    '/images/products/rocky-road.jpg',
    '/images/products/pistachio.jpg',
    '/images/products/salted-caramel.jpg',
    '/images/products/neapolitan.jpg',
    '/images/products/coffee-crunch.jpg',
    '/images/products/mango-sorbet.jpg',
    '/images/products/peanut-butter.jpg',
    '/images/products/lemon-meringue.jpg',
    '/images/products/vanilla-ice-cream.jpg',
    '/images/products/mint-chocolate.jpg',
    '/images/products/vanilla-ice-cream.jpg',
    '/images/products/chocolate-brownie.jpg',
    '/images/products/vanilla-ice-cream.jpg',
    '/images/products/rainbow-cone.jpg'
  ];
  
  return `image: '${images[productCount % images.length]}',`;
});

content = content.replace(/image: '\/images\/products\/chocolate-brownie\.jpg',/g, (match, offset) => {
  const beforeMatch = content.substring(0, offset);
  const productCount = (beforeMatch.match(/name: '/g) || []).length;
  
  const images = [
    '/images/products/chocolate-brownie.jpg',
    '/images/products/cookies-cream.jpg',
    '/images/products/rocky-road.jpg',
    '/images/products/coffee-crunch.jpg',
    '/images/products/peanut-butter.jpg'
  ];
  
  return `image: '${images[productCount % images.length]}',`;
});

// Waffle images
content = content.replace(/image: '\/images\/products\/belgian-waffle\.jpg',/g, (match, offset) => {
  const beforeMatch = content.substring(0, offset);
  const productCount = (beforeMatch.match(/Belgian Waffle|Chocolate Chip Waffle|Strawberry Waffle|Banana Nutella|Blueberry Waffle/g) || []).length;
  
  const images = [
    '/images/products/belgian-waffle.jpg',
    '/images/products/belgian-waffle.jpg',
    '/images/products/strawberry-waffle.jpg',
    '/images/products/nutella-waffle.jpg',
    '/images/products/blueberry-waffle.jpg',
    '/images/products/caramel-apple-waffle.jpg',
    '/images/products/belgian-waffle.jpg',
    '/images/products/red-velvet-waffle.jpg',
    '/images/products/belgian-waffle.jpg',
    '/images/products/belgian-waffle.jpg'
  ];
  
  return `image: '${images[productCount % images.length]}',`;
});

// Cake images
content = content.replace(/image: '\/images\/products\/chocolate-cake\.jpg',/g, (match, offset) => {
  const images = [
    '/images/products/chocolate-cake.jpg',
    '/images/products/red-velvet-cake.jpg',
    '/images/products/carrot-cake.jpg',
    '/images/products/black-forest.jpg'
  ];
  const index = Math.floor(Math.random() * images.length);
  return `image: '${images[index]}',`;
});

content = content.replace(/image: '\/images\/products\/lemon-cake\.jpg',/g, (match, offset) => {
  const images = [
    '/images/products/lemon-cake.jpg',
    '/images/products/vanilla-sponge.jpg',
    '/images/products/strawberry-shortcake.jpg'
  ];
  const index = Math.floor(Math.random() * images.length);
  return `image: '${images[index]}',`;
});

// Milkshake images
content = content.replace(/image: '\/images\/products\/strawberry-milkshake\.jpg',/g, (match, offset) => {
  const images = [
    '/images/products/strawberry-milkshake.jpg',
    '/images/products/vanilla-shake.jpg',
    '/images/products/banana-split-shake.jpg',
    '/images/products/coffee-shake.jpg'
  ];
  const index = Math.floor(Math.random() * images.length);
  return `image: '${images[index]}',`;
});

content = content.replace(/image: '\/images\/products\/unicorn-milkshake\.jpg',/g, (match, offset) => {
  const images = [
    '/images/products/unicorn-milkshake.jpg',
    '/images/products/chocolate-pb-shake.jpg',
    '/images/products/birthday-shake.jpg'
  ];
  const index = Math.floor(Math.random() * images.length);
  return `image: '${images[index]}',`;
});

// Drink images
content = content.replace(/image: '\/images\/products\/iced-coffee\.jpg',/g, (match, offset) => {
  const images = [
    '/images/products/iced-coffee.jpg',
    '/images/products/iced-tea.jpg',
    '/images/products/lemonade.jpg'
  ];
  const index = Math.floor(Math.random() * images.length);
  return `image: '${images[index]}',`;
});

content = content.replace(/image: '\/images\/products\/hot-chocolate\.jpg',/g, (match, offset) => {
  const images = [
    '/images/products/hot-chocolate.jpg',
    '/images/products/cappuccino.jpg',
    '/images/products/matcha-latte.jpg',
    '/images/products/chai-latte.jpg'
  ];
  const index = Math.floor(Math.random() * images.length);
  return `image: '${images[index]}',`;
});

fs.writeFileSync(seedDataPath, content);
console.log('Images updated in seedData.js');