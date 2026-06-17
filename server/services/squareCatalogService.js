const { SquareClient, SquareEnvironment } = require('square');
require('dotenv').config();

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class SquareCatalogService {
  constructor() {
    this.client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox
    });
  }

  async getCatalog(forceRefresh = false) {
    if (!forceRefresh && cache.data && (Date.now() - cache.timestamp) < CACHE_TTL) {
      return cache.data;
    }

    let allObjects = [];
    let cursor = null;

    do {
      const search = await this.client.catalog.search({
        objectTypes: ['ITEM', 'CATEGORY', 'MODIFIER_LIST', 'IMAGE'],
        limit: 200,
        cursor: cursor || undefined
      });
      if (search.objects) allObjects = allObjects.concat(search.objects);
      cursor = search.cursor;
    } while (cursor);

    const items = allObjects.filter(o => o.type === 'ITEM');
    const categories = allObjects.filter(o => o.type === 'CATEGORY');
    const modifierLists = allObjects.filter(o => o.type === 'MODIFIER_LIST');
    const images = allObjects.filter(o => o.type === 'IMAGE');

    // Build image map
    const imageMap = {};
    images.forEach(img => {
      if (img.imageData?.url) imageMap[img.id] = img.imageData.url;
    });

    // Build category map (deduplicate by name)
    const categoryMap = {};
    const seenNames = new Set();
    const uniqueCategories = [];

    categories.forEach(c => {
      const name = c.categoryData?.name;
      if (!name || seenNames.has(name)) return;
      if (['Ingredients Stock Management', 'Inventory'].includes(name)) return;
      seenNames.add(name);
      categoryMap[c.id] = name;
      uniqueCategories.push({ id: c.id, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') });
    });
    // Also map duplicate category IDs to same name
    categories.forEach(c => {
      if (c.categoryData?.name && seenNames.has(c.categoryData.name)) {
        categoryMap[c.id] = c.categoryData.name;
      }
    });

    // Build modifier groups
    const modifierGroups = modifierLists.map(m => {
      const data = m.modifierListData;
      return {
        id: m.id,
        name: data?.name || 'Unknown',
        selectionType: data?.selectionType || 'MULTIPLE',
        modifiers: (data?.modifiers || []).map(mod => ({
          id: mod.id,
          name: mod.modifierData?.name || '',
          price: mod.modifierData?.priceMoney?.amount ? Number(mod.modifierData.priceMoney.amount) / 100 : 0
        }))
      };
    });

    // Build products
    const products = items.map(item => {
      const data = item.itemData;
      const catId = data?.categories?.[0]?.id || data?.reportingCategory?.id;
      const categoryName = categoryMap[catId] || 'Other';
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Variations (sizes)
      const variations = (data?.variations || []).map(v => ({
        id: v.id,
        name: v.itemVariationData?.name || 'Standard',
        price: v.itemVariationData?.priceMoney?.amount ? Number(v.itemVariationData.priceMoney.amount) / 100 : 0
      }));

      // Linked modifier groups
      const linkedModifiers = (data?.modifierListInfo || [])
        .map(ml => modifierGroups.find(g => g.id === ml.modifierListId))
        .filter(Boolean);

      // Image
      const image = data?.imageIds?.[0] ? (imageMap[data.imageIds[0]] || '') : '';

      return {
        id: item.id,
        name: data?.name || '',
        description: data?.description || '',
        category: categoryName,
        categorySlug,
        image,
        variations,
        modifiers: linkedModifiers,
        inStock: !item.isDeleted
      };
    }).filter(p => p.name);

    const result = { products, categories: uniqueCategories, modifierGroups };
    cache = { data: result, timestamp: Date.now() };
    return result;
  }

  // Get single product by ID
  async getProduct(productId) {
    const catalog = await this.getCatalog();
    return catalog.products.find(p => p.id === productId) || null;
  }

  // Get products by category
  async getProductsByCategory(categorySlug) {
    const catalog = await this.getCatalog();
    if (!categorySlug || categorySlug === 'all') return catalog.products;
    return catalog.products.filter(p => p.categorySlug === categorySlug);
  }

  // Force refresh cache
  async refresh() {
    cache = { data: null, timestamp: 0 };
    return this.getCatalog(true);
  }
}

module.exports = new SquareCatalogService();
