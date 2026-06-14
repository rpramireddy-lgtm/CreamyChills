const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
};

const images = [
  // Ice cream images
  { url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop', name: 'cookies-cream.jpg' },
  { url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop', name: 'strawberry-cheesecake.jpg' },
  { url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop', name: 'rocky-road.jpg' },
  { url: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400&h=300&fit=crop', name: 'pistachio.jpg' },
  { url: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=400&h=300&fit=crop', name: 'salted-caramel.jpg' },
  { url: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400&h=300&fit=crop', name: 'neapolitan.jpg' },
  { url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop', name: 'coffee-crunch.jpg' },
  { url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=300&fit=crop', name: 'mango-sorbet.jpg' },
  { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop', name: 'peanut-butter.jpg' },
  { url: 'https://images.unsplash.com/photo-1633933358116-a27b902fad35?w=400&h=300&fit=crop', name: 'lemon-meringue.jpg' },
  
  // Waffle images
  { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', name: 'strawberry-waffle.jpg' },
  { url: 'https://images.unsplash.com/photo-1571167530149-c9b4c2d0b6b8?w=400&h=300&fit=crop', name: 'nutella-waffle.jpg' },
  { url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop', name: 'blueberry-waffle.jpg' },
  { url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', name: 'caramel-apple-waffle.jpg' },
  { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', name: 'red-velvet-waffle.jpg' },
  
  // Cake images
  { url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop', name: 'red-velvet-cake.jpg' },
  { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', name: 'vanilla-sponge.jpg' },
  { url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop', name: 'carrot-cake.jpg' },
  { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop', name: 'black-forest.jpg' },
  { url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', name: 'strawberry-shortcake.jpg' },
  
  // Milkshake images
  { url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&h=300&fit=crop', name: 'chocolate-pb-shake.jpg' },
  { url: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400&h=300&fit=crop', name: 'vanilla-shake.jpg' },
  { url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop', name: 'birthday-shake.jpg' },
  { url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', name: 'banana-split-shake.jpg' },
  { url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop', name: 'coffee-shake.jpg' },
  
  // Drink images
  { url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', name: 'iced-tea.jpg' },
  { url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', name: 'lemonade.jpg' },
  { url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', name: 'cappuccino.jpg' },
  { url: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop', name: 'matcha-latte.jpg' },
  { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', name: 'chai-latte.jpg' }
];

const downloadAll = async () => {
  const outputDir = path.join(__dirname, '../../client/public/images/products');
  
  for (const img of images) {
    try {
      const filepath = path.join(outputDir, img.name);
      await downloadImage(img.url, filepath);
      console.log(`Downloaded: ${img.name}`);
    } catch (error) {
      console.error(`Failed to download ${img.name}:`, error.message);
    }
  }
};

downloadAll();