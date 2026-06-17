const mongoose = require('mongoose');
const { SquareClient, SquareEnvironment } = require('square');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ModifierGroup = require('../models/ModifierGroup');
require('dotenv').config();

async function syncFromSquare() {
  await mongoose.connect(process.env.MONGODB_URI);

  const client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: SquareEnvironment.Production
  });

  console.log('🔄 Syncing from Square POS...\n');

  // 1. Fetch all catalog objects
  let allObjects = [];
  let cursor = null;
  do {
    const search = await client.catalog.search({
      objectTypes: ['ITEM', 'CATEGORY', 'MODIFIER_LIST'],
      limit: 200,
      cursor: cursor || undefined
    });
    if (search.objects) allObjects = allObjects.concat(search.objects);
    cursor = search.cursor;
  } while (cursor);

  const squareItems = allObjects.filter(o => o.type === 'ITEM');
  const squareCategories = allObjects.filter(o => o.type === 'CATEGORY');
  const squareModifiers = allObjects.filter(o => o.type === 'MODIFIER_LIST');

  console.log(`Found: ${squareItems.length} items, ${squareCategories.length} categories, ${squareModifiers.length} modifier lists\n`);

  // 2. Sync Categories
  // Filter to main dessert categories only (skip duplicates and internal ones)
  const mainCategories = squareCategories.filter(c => {
    const name = c.categoryData?.name || '';
    // Skip internal/inventory categories
    if (['Ingredients Stock Management', 'Inventory', 'Online Menu'].includes(name)) return false;
    return true;
  });

  // Deduplicate by name (keep first occurrence)
  const seenCatNames = new Set();
  const uniqueCategories = mainCategories.filter(c => {
    const name = c.categoryData?.name;
    if (seenCatNames.has(name)) return false;
    seenCatNames.add(name);
    return true;
  });

  await Category.deleteMany({});
  const categoryMap = {}; // squareId -> slug

  for (let i = 0; i < uniqueCategories.length; i++) {
    const c = uniqueCategories[i];
    const name = c.categoryData?.name || 'Unknown';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const cat = new Category({
      name,
      slug,
      sortOrder: i,
      isActive: true,
      color: '#b03160'
    });
    await cat.save();
    categoryMap[c.id] = slug;
  }
  console.log(`✅ ${uniqueCategories.length} categories synced`);

  // 3. Sync Modifier Lists
  await ModifierGroup.deleteMany({});
  const modGroupMap = {}; // squareId -> mongoId

  for (const m of squareModifiers) {
    const data = m.modifierListData;
    const modifiers = (data?.modifiers || []).map((mod, i) => ({
      name: mod.modifierData?.name || `Option ${i + 1}`,
      groupName: data?.name || 'Unknown',
      price: mod.modifierData?.priceMoney?.amount ? Number(mod.modifierData.priceMoney.amount) / 100 : 0,
      sortOrder: i,
      isActive: true
    }));

    const group = new ModifierGroup({
      name: data?.name || 'Unknown',
      description: '',
      isRequired: false,
      minSelection: 0,
      maxSelection: modifiers.length,
      modifiers,
      isActive: true,
      sortOrder: 0
    });
    await group.save();
    modGroupMap[m.id] = group._id;
  }
  console.log(`✅ ${squareModifiers.length} modifier groups synced`);

  // 4. Sync Items
  await Product.deleteMany({});
  let itemCount = 0;

  for (const item of squareItems) {
    const data = item.itemData;
    if (!data?.name) continue;

    // Find category
    const catId = data.categories?.[0]?.id || data.reportingCategory?.id;
    const category = categoryMap[catId] || 'extras';

    // Get variations (sizes/prices)
    const variations = data.variations || [];
    const sizes = variations.length > 1
      ? variations.map(v => ({
          name: v.itemVariationData?.name || 'Standard',
          price: v.itemVariationData?.priceMoney?.amount ? Number(v.itemVariationData.priceMoney.amount) / 100 : 0
        }))
      : [];

    const basePrice = variations[0]?.itemVariationData?.priceMoney?.amount
      ? Number(variations[0].itemVariationData.priceMoney.amount) / 100
      : 0;

    // Get linked modifier lists
    const modifierGroupIds = (data.modifierListInfo || [])
      .map(ml => modGroupMap[ml.modifierListId])
      .filter(Boolean);

    const product = new Product({
      name: data.name,
      description: data.description || '',
      category,
      price: basePrice,
      image: data.imageIds?.[0] ? '' : '', // Square images need separate fetch
      inStock: true,
      featured: false,
      sizes,
      modifierGroupIds,
      allergens: [],
      preparationTime: 10
    });

    await product.save();
    itemCount++;
  }
  console.log(`✅ ${itemCount} products synced`);

  console.log('\n🎉 Square sync complete!');
  console.log(`   Categories: ${uniqueCategories.length}`);
  console.log(`   Modifiers: ${squareModifiers.length}`);
  console.log(`   Products: ${itemCount}`);

  process.exit(0);
}

syncFromSquare().catch(e => {
  console.error('Sync failed:', e);
  process.exit(1);
});
