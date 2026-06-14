# Creamy Chills Items & Services Management Module

## Overview
Complete Square-style item management system for Creamy Chills dessert shop.

## Database Models

### Category
- name, slug, description
- icon, color, sortOrder
- isActive status

### ModifierGroup
- name, description
- isRequired, minSelection, maxSelection
- Array of modifiers (name, price)
- isActive, sortOrder

### Item
- name, description, basePrice
- category (ref), image, images[]
- isActive, isArchived, isSoldOut
- Channel settings (website, pos, justEat, uberEats, deliveroo, scoffable)
  - Each channel: enabled, price override, description override, image override
- taxable, allergens[], preparationTime
- modifierGroups[] (refs)
- options[] (name + values with price adjustments)
- sku, sortOrder, isFeatured

## API Endpoints

### Categories
- GET /api/categories - List all
- GET /api/categories/:id - Get one
- POST /api/categories - Create
- PUT /api/categories/:id - Update
- DELETE /api/categories/:id - Delete

### Modifiers
- GET /api/modifiers - List all
- GET /api/modifiers/:id - Get one
- POST /api/modifiers - Create
- PUT /api/modifiers/:id - Update
- DELETE /api/modifiers/:id - Delete

### Items
- GET /api/items?category=&channel=&status=&search= - List with filters
- GET /api/items/:id - Get one
- POST /api/items - Create
- POST /api/items/:id/duplicate - Duplicate
- PUT /api/items/:id - Update
- PUT /api/items/bulk/prices - Bulk price update
- PUT /api/items/bulk/categories - Bulk category update
- PUT /api/items/:id/archive - Archive
- PUT /api/items/:id/soldout - Toggle sold out
- DELETE /api/items/:id - Delete

## Admin Pages

### /admin/items
- Grid view of all items
- Search and filter by category/channel
- Quick actions: duplicate, archive, mark sold out
- Click to edit

### /admin/categories
- Table view with sort order
- Add/edit/delete categories
- Color picker for visual organization

### /admin/modifiers
- Card view of modifier groups
- Shows all modifiers in each group
- Add/edit/delete groups and modifiers

## Pre-seeded Data

### Categories (14)
Waffles, Crepes, Cookie Dough, Cakes, Sundaes, Milkshakes, Smoothies, Slush, Ice Cream, Drinks, Hot Drinks, Loaded Kunafa, Donuts, Extras

### Modifier Groups (4)

**Extra Sauce** - max 3 selections
- Nutella £1.00
- Biscoff £1.00
- White Chocolate £1.00
- Milk Chocolate £1.00
- Pistachio £1.50
- Caramel £1.00
- Toffee £1.00

**Extra Toppings** - max 5 selections
- Oreo Crumbs £1.00
- Biscoff Crumbs £1.00
- Chocolate Curls £1.00
- Sprinkles £0.75
- Kunafa £1.50
- Nuts £1.00
- Brownie Pieces £1.50

**Add Ice Cream** - max 3 selections
- Vanilla/Chocolate/Strawberry/Bubblegum Scoop £1.50
- Ferrero/Pistachio Scoop £1.75

**Size** - required, 1 selection
- Regular £0
- Large £1.50

## Setup Instructions

1. Seed categories and modifiers:
```bash
cd server
node scripts/seedSetup.js
```

2. Start server:
```bash
npm run dev
```

3. Access admin:
- Navigate to /admin/items
- Navigate to /admin/categories
- Navigate to /admin/modifiers

## Channel Management

Each item supports 6 channels:
- Website
- Square POS
- Just Eat
- Uber Eats
- Deliveroo
- Scoffable

Per channel you can:
- Enable/disable
- Override price
- Override description
- Override image
- Override name

## Features

✅ Add item in under 60 seconds
✅ Duplicate existing items
✅ Archive old items
✅ Temporarily hide sold-out items
✅ Bulk update prices (percentage or fixed)
✅ Bulk assign categories
✅ Search by name/description
✅ Filter by category
✅ Filter by channel
✅ Filter by status (active/inactive/archived/soldout)

## Example Item: Dubai Chocolate Waffle

```javascript
{
  name: "Dubai Chocolate Waffle",
  description: "Warm waffle topped with rich chocolate sauce, pistachio cream and crispy golden kunafa",
  category: "waffles-category-id",
  basePrice: 8.95,
  image: "/images/products/Waffles/Dubai Kunafa Waffle.jpg",
  channels: {
    website: { enabled: true },
    pos: { enabled: true },
    justEat: { enabled: true, price: 9.45 },
    uberEats: { enabled: true, price: 9.45 },
    deliveroo: { enabled: true, price: 9.45 },
    scoffable: { enabled: true }
  },
  modifierGroups: [
    "extra-sauce-group-id",
    "extra-toppings-group-id",
    "add-ice-cream-group-id"
  ],
  allergens: ["Nuts", "Gluten", "Dairy"],
  preparationTime: 8,
  taxable: true,
  isActive: true,
  isFeatured: true
}
```

## UI Components Created

- AdminItems.tsx - Main items grid view
- AdminCategories.tsx - Categories table
- AdminModifiers.tsx - Modifier groups cards
- AdminSidebar.tsx - Navigation sidebar

All styled with Creamy Chills brand colors (#b03160, #fff8f4).
