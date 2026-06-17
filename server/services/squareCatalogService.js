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

    const S3_BASE = process.env.CDN_URL || 'https://creamychills-assets.s3.eu-west-2.amazonaws.com';

    // S3 image fallback mapping (filename without extension → S3 URL)
    const S3_IMAGE_MAP = {
      // Ice Cream
      'belgian chocolate': 'menu/IceCreams/Belgain Choclate Icecream.jpg',
      'biscoff crunch': 'menu/IceCreams/Biscoff Crunch.jpg',
      'bubblegum': 'menu/IceCreams/Bubblegum.jpg',
      'chocolate fudge brownie': 'menu/IceCreams/Choclate Fudge Brownie.jpg',
      'cookie dough ice cream': 'menu/IceCreams/Chocochip COokie Dough.jpg',
      'cinnamon bun': 'menu/IceCreams/Cinamon Bun.jpg',
      'double bubble': 'menu/IceCreams/Double Bubble.jpg',
      'ferrero rocher': 'menu/IceCreams/Ferroro Rocher.jpg',
      'honeycomb crunch': 'menu/IceCreams/Honeycomb Crunch.jpg',
      'irn bru': 'menu/IceCreams/Irn Bru.jpg',
      'isle of sky': 'menu/IceCreams/Isle of Sky.jpg',
      'isle of skye': 'menu/IceCreams/Isle of Sky.jpg',
      'mango tango': 'menu/IceCreams/Mango Tango.jpg',
      'raspberry ripple': 'menu/IceCreams/Rasberry Ripple.jpg',
      'strawberry ripple': 'menu/IceCreams/Strawberry Ripple.jpg',
      'toffee fudge': 'menu/IceCreams/Toffe Fudge.jpg',
      'vanilla': 'menu/IceCreams/Vanilla Icecream.jpg',
      'double cream': 'menu/IceCreams/Vanilla Icecream.jpg',
      'vegan vanilla': 'menu/IceCreams/Vegan Vanilla.jpg',
      'christmas pudding': 'menu/IceCreams/Christmas Pudding.jpg',
      // Milkshakes
      'biscoff milkshake': 'menu/Milkshakes/Biscoff Milkshake.jpeg',
      'kinder bueno milkshake': 'menu/Milkshakes/Kinder Bueno Milkshake.jpeg',
      'maltesers milkshake': 'menu/Milkshakes/Maltesers Milkshake.jpeg',
      'nutella milkshake': 'menu/Milkshakes/Nutella Milkshake.jpeg',
      'oreo milkshake': 'menu/Milkshakes/Oreo Milkshake.jpeg',
      'dubai milkshake': 'menu/Milkshakes/Dubai Milkshake.jpg',
      'twix milkshake': 'menu/Milkshakes/Twix Milkshake.jpg',
      'strawberry milkshake': 'menu/Milkshakes/Strawberry.jpg',
      'bubblegum milkshake': 'menu/Milkshakes/Bubblegum.jpg',
      'mango milkshake': 'menu/Milkshakes/Mango.jpg',
      'raspberry milkshake': 'menu/Milkshakes/Rasberry.jpg',
      'mars milkshake': 'menu/Milkshakes/Mars.jpg',
      'pistachio milkshake': 'menu/Milkshakes/Pistachio Swirl.jpg',
      'aero milkshake': 'menu/Milkshakes/Aero.jpg',
      'belgium milk': 'menu/Milkshakes/Belgium Milk Choclate Milkshake.jpg',
      'daim milkshake': 'menu/Milkshakes/Daim.jpg',
      'ferroro milkshake': 'menu/Milkshakes/Ferroro.jpg',
      'ferrero milkshake': 'menu/Milkshakes/Ferroro.jpg',
      // Waffles
      'biscoff waffle': 'menu/Waffles/Biscoff Waffle.jpg',
      'dubai': 'menu/Waffles/Dubai Kunafa Waffle.jpg',
      'ferrero waffle': 'menu/Waffles/Ferror Waffle.jpg',
      'kinder bueno waffle': 'menu/Waffles/Kinder Bueno Waffle.jpg',
      'bueno waffle': 'menu/Waffles/Kinder Bueno Waffle.jpg',
      'lolly pop': 'menu/Waffles/Lolly Pop Waffle.jpg',
      'twix waffle': 'menu/Waffles/Twix Waffle.jpg',
      // Crepes
      'nutella crepe': 'menu/Crepes/Nutella Crepe.jpg',
      'biscoff crepe': 'menu/Crepes/Biscoff.jpg',
      'kinder bueno crepe': 'menu/Crepes/Kinder Bueno.jpg',
      'bueno crepe': 'menu/Crepes/Kinder Bueno.jpg',
      'ferrero crepe': 'menu/Crepes/Ferroro Crepe.jpg',
      'oreo crepe': 'menu/Crepes/Oreo Crepe.jpg',
      'dubai choc': 'menu/Crepes/Dubai Choclate Crepe.jpg',
      'strawberry & nutella crepe': 'menu/Crepes/Strawberry & Nutella.jpg',
      'strawberry nutella crepe': 'menu/Crepes/Strawberry & Nutella.jpg',
      'maltesers crepe': 'menu/Crepes/Maltesers Crepe.jpg',
      'twix crepe': 'menu/Crepes/Twix Crepe.jpg',
      'banoffee crepe': 'menu/Crepes/Banoffe Crepe.jpg',
      'bounty crepe': 'menu/Crepes/Bounty Crepe.jpg',
      'pistachio crepe': 'menu/Crepes/Pistachio.jpg',
      'aero crepe': 'menu/Crepes/Aero.jpg',
      'reese': 'menu/Crepes/Resees Crepe.jpg',
      // Cookie Dough
      'nutella cookie': 'menu/Cookie Dough/Nutella Cookie Dough.jpg',
      'biscoff cookie': 'menu/Cookie Dough/Biscoff Cookie Dough.jpg',
      'kinder bueno cookie': 'menu/Cookie Dough/Kinder Bueno Cooke Dough.jpg',
      'oreo cookie': 'menu/Cookie Dough/Oreo cookie Dough.jpg',
      'pistachio cookie': 'menu/Cookie Dough/Pistachio Cookie Dough.jpg',
      'dubai cookie': 'menu/Cookie Dough/Dubai Milk Choclate Cookie Dough.jpg',
      'red velvet cookie': 'menu/Cookie Dough/Red Velvet Cookie Dough.jpg',
      'double choc': 'menu/Cookie Dough/Double Choclate Cookie Dough.jpg',
      'strawberry nutella cookie': 'menu/Cookie Dough/Strawberry Nutella Cookie Dough.jpg',
      'white choc': 'menu/Cookie Dough/White Choclate Cookie Dough.jpg',
      'banoffee cookie': 'menu/Cookie Dough/Banoffe Cookie Dough.jpg',
      'ferrero cookie': 'menu/Cookie Dough/Ferrror Cookie Dough.jpg',
      // Sundaes
      'oreo sundae': 'menu/Sundaes/Oreo Sundae.jpg',
      'biscoff sundae': 'menu/Sundaes/Biscoff Sundae.jpg',
      'kinder bueno sundae': 'menu/Sundaes/Kinder Bueno Sundae.jpg',
      'ferrero sundae': 'menu/Sundaes/Ferrror Sundae.jpg',
      'maltesers sundae': 'menu/Sundaes/Maltesers Sundae.jpg',
      'strawberry sundae': 'menu/Sundaes/Strawberry Sundae.jpg',
      'banana sundae': 'menu/Sundaes/Banana Sundae.jpg',
      'brownie sundae': 'menu/Sundaes/Choclate Brownie Sundae.jpg',
      'fudge sundae': 'menu/Sundaes/Choclate Fudge Sundae.jpg',
      'twix sundae': 'menu/Sundaes/Twix Sundae.jpg',
      'mint aero sundae': 'menu/Sundaes/Mint Aero Sundae.jpg',
      'mars sundae': 'menu/Sundaes/Mars Caramel Crunch Sundae.jpg',
      'kids sundae': 'menu/Sundaes/Kids Sundae.jpg',
      'banoffee sundae': 'menu/Sundaes/Banoffe Sundae.jpg',
      // Loaded Kunafa
      'loaded kunafa': 'menu/Loaded Kunafa/Dubai Kunafas.jpg',
      'banana kunafa': 'menu/Loaded Kunafa/Loaded Banana Kunafa.jpg',
      'strawberry kunafa': 'menu/Loaded Kunafa/Loaded Kunafa Strawberry.jpg',
      'black label': 'menu/Loaded Kunafa/Loaded Kunafa black label.jpg',
      // Cakes
      'matilda': 'menu/Cakes/Matilda Cake.jpg',
      'dream cake': 'menu/Cakes/Dream Cake.jpg',
      'old school': 'menu/Cakes/Old School Cake.jpg',
      // Slushes
      'slush': 'menu/Slushes & Tango Blast/Slushes.jpg',
      'tango ice blast': 'menu/Slushes & Tango Blast/Tango Ice Blast.jpg',
      // Doughnuts
      'doughnut': 'menu/Donut Customisation/Doughnut Customisation.jpg',
    };

    // Function to find S3 fallback image for a product name
    const findS3Image = (productName) => {
      const lower = productName.toLowerCase();
      for (const [key, path] of Object.entries(S3_IMAGE_MAP)) {
        if (lower.includes(key)) {
          return `${S3_BASE}/${encodeURI(path)}`;
        }
      }
      return '';
    };

    // Build products
    const products = items.map(item => {
      const data = item.itemData;
      const catId = data?.categories?.[0]?.id || data?.reportingCategory?.id;
      const categoryName = categoryMap[catId] || 'Other';
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Skip items in hidden categories or with £0 price
      if (!categoryName || categoryName === 'Other') {
        const rawCat = categories.find(c => c.id === catId);
        if (rawCat && HIDDEN_CATEGORIES.includes(rawCat.categoryData?.name)) return null;
      }

      // Variations (sizes)
      const variations = (data?.variations || []).map(v => ({
        id: v.id,
        name: v.itemVariationData?.name || 'Standard',
        price: v.itemVariationData?.priceMoney?.amount ? Number(v.itemVariationData.priceMoney.amount) / 100 : 0
      }));

      // Hide items with all £0 prices
      if (variations.every(v => v.price === 0)) return null;

      // Linked modifier groups - filter duplicates and mark required
      let linkedModifiers = (data?.modifierListInfo || [])
        .map(ml => modifierGroups.find(g => g.id === ml.modifierListId))
        .filter(Boolean);
      // Remove "Drink Size" if item already has size variations
      if (variations.length > 1) {
        linkedModifiers = linkedModifiers.filter(g => !g.name.toLowerCase().includes("drink size"));
      }
      // Mark cone type and whipp cream as required
      linkedModifiers = linkedModifiers.map(g => ({
        ...g,
        required: g.name.toLowerCase().includes("cone") || g.name.toLowerCase().includes("whipp")
      }));

      // Image: prefer Square image, fallback to S3 match
      const squareImage = data?.imageIds?.[0] ? (imageMap[data.imageIds[0]] || '') : '';
      const image = squareImage || findS3Image(data?.name || '');

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
