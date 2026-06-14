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
  { url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', name: 'vanilla-ice-cream.jpg' },
  { url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop', name: 'chocolate-brownie.jpg' },
  { url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop', name: 'belgian-waffle.jpg' },
  { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', name: 'chocolate-cake.jpg' },
  { url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', name: 'strawberry-milkshake.jpg' },
  { url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', name: 'iced-coffee.jpg' },
  { url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop', name: 'rainbow-cone.jpg' },
  { url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop', name: 'unicorn-milkshake.jpg' },
  { url: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400&h=300&fit=crop', name: 'mint-chocolate.jpg' },
  { url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', name: 'lemon-cake.jpg' },
  { url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=300&fit=crop', name: 'hot-chocolate.jpg' }
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