const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creamychills', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  flavors: [String],
  sizes: [{
    name: String,
    price: Number
  }],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

// Parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const product = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      
      if (header === 'price') {
        product[header] = parseFloat(value);
      } else if (header === 'featured' || header === 'inStock') {
        product[header] = value.toLowerCase() === 'true';
      } else if (header === 'flavors') {
        product[header] = value ? value.replace(/"/g, '').split(',').map(f => f.trim()) : [];
      } else if (header === 'sizes') {
        if (value) {
          product[header] = value.replace(/"/g, '').split(',').map(size => {
            const [name, price] = size.split(':');
            return { name: name.trim(), price: parseFloat(price) };
          });
        }
      } else {
        product[header] = value;
      }
    });
    
    products.push(product);
  }
  
  return products;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

// Import products
async function importProducts() {
  try {
    console.log('🚀 Starting product import...\n');
    
    const dataDir = path.join(__dirname, '../../data');
    const csvFiles = [
      'ice-cream-products.csv',
      'milkshakes-products.csv',
      'hot-drinks-products.csv',
      'waffles-products.csv',
      'cakes-products.csv'
    ];
    
    let totalImported = 0;
    
    for (const file of csvFiles) {
      const filePath = path.join(dataDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        continue;
      }
      
      console.log(`📄 Processing ${file}...`);
      const products = parseCSV(filePath);
      
      for (const productData of products) {
        try {
          // Check if product already exists
          const existing = await Product.findOne({ name: productData.name });
          
          if (existing) {
            // Update existing product
            await Product.findByIdAndUpdate(existing._id, productData);
            console.log(`   ✅ Updated: ${productData.name}`);
          } else {
            // Create new product
            await Product.create(productData);
            console.log(`   ✅ Created: ${productData.name}`);
          }
          
          totalImported++;
        } catch (error) {
          console.log(`   ❌ Error with ${productData.name}: ${error.message}`);
        }
      }
      
      console.log(`   Imported ${products.length} products from ${file}\n`);
    }
    
    console.log(`\n🎉 Import complete! Total products: ${totalImported}`);
    
    // Display summary
    const summary = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Product Summary:');
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} products`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run import
importProducts();