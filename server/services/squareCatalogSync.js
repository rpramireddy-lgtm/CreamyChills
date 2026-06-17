const { SquareClient, SquareEnvironment } = require('square');
const crypto = require('crypto');
require('dotenv').config();

class SquareCatalogSync {
  constructor() {
    this.client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox
    });
  }

  // Pull entire catalog from Square
  async pullAll() {
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

    // Build image map: id -> url
    const imageMap = {};
    images.forEach(img => {
      if (img.imageData?.url) {
        imageMap[img.id] = img.imageData.url;
      }
    });

    return { items, categories, modifierLists, imageMap };
  }

  // Get image URL for an item
  getImageUrl(item, imageMap) {
    const imageId = item.itemData?.imageIds?.[0];
    return imageId ? (imageMap[imageId] || '') : '';
  }

  // Push a new item to Square
  async pushItem({ name, description, price, categoryId, variations }) {
    const idempotencyKey = crypto.randomBytes(16).toString('hex');

    const itemVariations = (variations && variations.length > 0)
      ? variations.map(v => ({
          type: 'ITEM_VARIATION',
          id: `#${v.name.replace(/\s/g, '')}`,
          itemVariationData: {
            name: v.name,
            pricingType: 'FIXED_PRICING',
            priceMoney: { amount: BigInt(Math.round(v.price * 100)), currency: 'GBP' }
          }
        }))
      : [{
          type: 'ITEM_VARIATION',
          id: '#regular',
          itemVariationData: {
            name: 'Regular',
            pricingType: 'FIXED_PRICING',
            priceMoney: { amount: BigInt(Math.round(price * 100)), currency: 'GBP' }
          }
        }];

    const result = await this.client.catalog.upsert({
      idempotencyKey,
      object: {
        type: 'ITEM',
        id: '#newitem',
        itemData: {
          name,
          description: description || '',
          categoryId: categoryId || undefined,
          variations: itemVariations
        }
      }
    });

    return result.catalogObject;
  }

  // Update item in Square
  async updateItem(squareId, { name, description, price }) {
    // First retrieve current version
    const current = await this.client.catalog.search({
      objectTypes: ['ITEM'],
      query: { exactQuery: { attributeName: 'id', attributeValue: squareId } }
    });

    // Simplified: use upsert with the ID
    const idempotencyKey = crypto.randomBytes(16).toString('hex');
    const result = await this.client.catalog.upsert({
      idempotencyKey,
      object: {
        type: 'ITEM',
        id: squareId,
        itemData: {
          name,
          description: description || ''
        }
      }
    });

    return result.catalogObject;
  }

  // Delete item from Square
  async deleteItem(squareId) {
    await this.client.catalog.delete({ objectId: squareId });
  }

  // Push a category to Square
  async pushCategory({ name }) {
    const idempotencyKey = crypto.randomBytes(16).toString('hex');
    const result = await this.client.catalog.upsert({
      idempotencyKey,
      object: {
        type: 'CATEGORY',
        id: '#newcat',
        categoryData: { name }
      }
    });
    return result.catalogObject;
  }
}

module.exports = new SquareCatalogSync();
