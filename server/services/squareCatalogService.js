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

    // Category mapping: merge retail categories and clean up for online menu
    const CATEGORY_MAP = {
      // Keep as-is (desserts)
      'Waffles': 'Waffles',
      'Ice Cream': 'Ice Cream',
      'Cookie Dough': 'Cookie Dough',
      'Lollipop Waffle': 'Waffles',
      'Crepes': 'Crepes',
      'Sundaes': 'Sundaes',
      'Milkshakes': 'Milkshakes',
      'Brownies': 'Brownies',
      'Doughnuts': 'Doughnuts',
      'Cheesecakes': 'Cheesecakes',
      'Cakes': 'Cakes',
      'Loaded Dubai Kunafa ': 'Loaded Kunafa',
      'Loaded Dubai Kunafa': 'Loaded Kunafa',
      'Slushee': 'Slushee',
      'Tango Ice Blast': 'Tango Ice Blast',
      '🎁 Dessert Bundles': 'Dessert Bundles',
      '🍓🍌 Fresh  Fruit Tubs': 'Fresh Fruit',
      'Fresh Fruit / Chilled': 'Fresh Fruit',
      // Drinks
      'Drinks(American, Japanese and etc..)': 'Drinks',
      'Drinks': 'Drinks',
      'Caffe Latte': 'Drinks',
      // Merge into Snacks & Sweets
      'American Candy': 'Snacks & Sweets',
      'Candy King Pick & Mix': 'Snacks & Sweets',
      'JOLLY RANCHER': 'Snacks & Sweets',
      'Airheads (Bags)': 'Snacks & Sweets',
      'Hot Tamales': 'Snacks & Sweets',
      'Sour Patch Kids': 'Snacks & Sweets',
      'Airheads Bars (Singles)': 'Snacks & Sweets',
      'Airheads Gum': 'Snacks & Sweets',
      'Nerds Rope': 'Snacks & Sweets',
      'Mike and Ike (22g Singles)': 'Snacks & Sweets',
      'Mike and Ike (120g Packs)': 'Snacks & Sweets',
      'Nerds – Mixed Category': 'Snacks & Sweets',
      'Milka': 'Snacks & Sweets',
      'Crisps': 'Snacks & Sweets',
      'Lays': 'Snacks & Sweets',
      'Pringles': 'Snacks & Sweets',
      'Takis': 'Snacks & Sweets',
      'Tyrrells': 'Snacks & Sweets',
      'Popping Boba': 'Snacks & Sweets',
      'Candy': 'Snacks & Sweets',
      'Snacks': 'Snacks & Sweets',
      'choclates': 'Snacks & Sweets',
      'Aero Scoops': 'Snacks & Sweets',
    };

    // Hidden categories (don't show online)
    const HIDDEN_CATEGORIES = ['Sauces', 'Online Menu', '⭐ Best Sellers', 'Extras', 'Inventory', 'Ingredients Stock Management'];

    // Build category map with merging
    const categoryMap = {};
    const finalCategories = new Map(); // name -> slug

    categories.forEach(c => {
      const rawName = c.categoryData?.name;
      if (!rawName) return;
      const mappedName = CATEGORY_MAP[rawName] || rawName;
      if (HIDDEN_CATEGORIES.includes(rawName) || HIDDEN_CATEGORIES.includes(mappedName)) return;
      categoryMap[c.id] = mappedName;
      if (!finalCategories.has(mappedName)) {
        finalCategories.set(mappedName, mappedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      }
    });

    const uniqueCategories = Array.from(finalCategories.entries()).map(([name, slug], i) => ({ id: slug, name, slug }));

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

      // Skip items in hidden categories
      if (!categoryName || categoryName === 'Other') {
        // Check if the raw category was hidden
        const rawCat = categories.find(c => c.id === catId);
        if (rawCat && HIDDEN_CATEGORIES.includes(rawCat.categoryData?.name)) return null;
      }

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
    }).filter(p => p && p.name);

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
