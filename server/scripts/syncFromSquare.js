const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ModifierGroup = require('../models/ModifierGroup');
const squareCatalogSync = require('../services/squareCatalogSync');
require('dotenv').config();

async function syncFromSquare() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🔄 Syncing from Square POS...\n');

  const { items, categories, modifierLists, imageMap } = await squareCatalogSync.pullAll();
  console.log(`Found: ${items.length} items, ${categories.length} categories, ${modifierLists.length} modifiers, ${Object.keys(imageMap).length} images\n`);

  // 1. Sync Categories (deduplicate by name)
  const seenCatNames = new Set();
  const uniqueCategories = categories.filter(c => {
    const name = c.categoryData?.name;
    if (!name || seenCatNames.has(name)) return false;
    if (['Ingredients Stock Management', 'Inventory'].includes(name)) return false;
    seenCatNames.add(name);
    return true;
  });

  await Category.deleteMany({});
  const categoryMap = {};

  for (let i = 0; i < uniqueCategories.length; i++) {
    const c = uniqueCategories[i];
    const name = c.categoryData.name;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await Category.create({ name, slug, sortOrder: i, isActive: true, color: '#b03160' });
    categoryMap[c.id] = slug;
    // Map duplicate IDs too
    categories.filter(x => x.categoryData?.name === name).forEach(x => { categoryMap[x.id] = slug; });
  }
  console.log(`✅ ${uniqueCategories.length} categories synced`);

  // 2. Sync Modifiers
  await ModifierGroup.deleteMany({});
  const modGroupMap = {};

  for (const m of modifierLists) {
    const data = m.modifierListData;
    const modifiers = (data?.modifiers || []).map((mod, i) => ({
      name: mod.modifierData?.name || `Option ${i + 1}`,
      groupName: data?.name || 'Unknown',
      price: mod.modifierData?.priceMoney?.amount ? Number(mod.modifierData.priceMoney.amount) / 100 : 0,
      sortOrder: i,
      isActive: true
    }));

    const group = await ModifierGroup.create({
      name: data?.name || 'Unknown',
      description: '',
      isRequired: false,
      minSelection: 0,
      maxSelection: Math.max(modifiers.length, 1),
      modifiers,
      isActive: true
    });
    modGroupMap[m.id] = group._id;
  }
  console.log(`✅ ${modifierLists.length} modifier groups synced`);

  // 3. Sync Products with images
  await Product.deleteMany({});
  let count = 0;

  for (const item of items) {
    const data = item.itemData;
    if (!data?.name) continue;

    const catId = data.categories?.[0]?.id || data.reportingCategory?.id;
    const category = categoryMap[catId] || 'extras';

    const variations = data.variations || [];
    const sizes = variations.length > 1
      ? variations.map(v => ({
          name: v.itemVariationData?.name || 'Standard',
          price: v.itemVariationData?.priceMoney?.amount ? Number(v.itemVariationData.priceMoney.amount) / 100 : 0
        }))
      : [];

    const basePrice = variations[0]?.itemVariationData?.priceMoney?.amount
      ? Number(variations[0].itemVariationData.priceMoney.amount) / 100 : 0;

    const modifierGroupIds = (data.modifierListInfo || [])
      .map(ml => modGroupMap[ml.modifierListId])
      .filter(Boolean);

    // Get image URL from Square
    const image = squareCatalogSync.getImageUrl(item, imageMap);

    await Product.create({
      name: data.name,
      description: data.description || '',
      category,
      price: basePrice,
      image,
      inStock: true,
      featured: false,
      sizes,
      modifierGroupIds,
      allergens: [],
      preparationTime: 10,
      squareCatalogId: item.id // Store Square ID for two-way sync
    });
    count++;
  }
  console.log(`✅ ${count} products synced (with ${Object.keys(imageMap).length} images)`);

  console.log('\n🎉 Square sync complete!');
  process.exit(0);
}

syncFromSquare().catch(e => { console.error('Sync failed:', e.message); process.exit(1); });
