import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, Chip, Tabs, Tab, Snackbar, Alert, Skeleton, TextField, InputAdornment } from '@mui/material';
import { Add, Search as SearchIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsAPI, categoriesAPI } from '../services/api';
import ModifierModal from '../components/ModifierModal';
import SEO from '../components/SEO';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
  inStock: boolean;
  sizes?: Array<{ name: string; price: number }>;
  allergens?: string[];
}

const Products: React.FC = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modifierProduct, setModifierProduct] = useState<any>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll().catch(() => ({ data: [] }))
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddToCart = (product: Product, size?: { name: string; price: number }) => {
    const price = size ? size.price : product.price;
    const name = size ? `${product.name} - ${size.name}` : product.name;
    addToCart({ id: `${product._id}-${size?.name || 'standard'}`, name, price, image: product.image, customizations: size ? [{ name: 'Size', value: size.name, additionalPrice: size.price - product.price }] : [] });
    setAddedItemName(name);
    setShowConfirmation(true);
  };

  // Build category tabs from DB categories + fallback
  const categoryTabs = [
    { id: 'all', name: 'All' },
    ...(categories.length > 0
      ? categories.map((c: any) => ({ id: c.slug, name: c.name }))
      : [
          { id: 'ice-cream', name: 'Ice Cream' },
          { id: 'waffle', name: 'Waffles' },
          { id: 'milkshake', name: 'Milkshakes' },
          { id: 'cake', name: 'Cakes' },
          { id: 'drink', name: 'Drinks' }
        ]
    )
  ];

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <SEO title="Menu" description="Browse our full menu of ice cream, waffles, milkshakes, cakes and more." />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 1 }}>
            Our Menu
          </Typography>
          <Typography sx={{ fontFamily: '"PT Serif"', color: '#666' }}>
            Handcrafted desserts made fresh daily
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search menu..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#b03160' }} /></InputAdornment> }}
            sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, v) => setSelectedCategory(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontFamily: '"PT Serif"', fontSize: '0.9rem', minWidth: 'auto', px: 2 },
              '& .Mui-selected': { color: '#b03160 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#b03160' }
            }}
          >
            {categoryTabs.map(cat => (
              <Tab key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Tabs>
        </Box>

        {/* Loading Skeletons */}
        {loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} sx={{ borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={160} />
                <CardContent>
                  <Skeleton width="70%" height={24} />
                  <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Products Grid */}
        {!loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {filteredProducts.map((product) => (
              <Card
                key={product._id}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #f0e8e8',
                  boxShadow: 'none',
                  opacity: product.inStock ? 1 : 0.5,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(176,49,96,0.1)' }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  {!product.inStock && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Chip label="Sold Out" sx={{ bgcolor: 'white', fontWeight: 600 }} />
                    </Box>
                  )}
                  {product.featured && product.inStock && (
                    <Chip label="Popular" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#b03160', color: 'white', fontSize: '0.7rem' }} />
                  )}
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.9rem', color: '#333', mb: 0.5, lineHeight: 1.3 }}>
                    {product.name}
                  </Typography>

                  {/* Allergen badges */}
                  {product.allergens && product.allergens.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', mb: 1 }}>
                      {product.allergens.slice(0, 3).map((a: string) => (
                        <Chip key={a} label={a} size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: a === 'Nuts' ? '#fff3e0' : a === 'Dairy' ? '#e3f2fd' : a === 'Gluten' ? '#fce4ec' : '#f5f5f5' }} />
                      ))}
                    </Box>
                  )}

                  {product.description && (
                    <Typography sx={{ fontFamily: '"PT Serif"', color: '#999', fontSize: '0.75rem', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </Typography>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {product.sizes.map(size => (
                        <Box key={size.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{size.name}</Typography>
                            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '0.9rem' }}>
                              £{size.price.toFixed(2)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => handleAddToCart(product, size)}
                            disabled={!product.inStock}
                            sx={{ minWidth: 'auto', bgcolor: '#b03160', color: 'white', borderRadius: '100px', px: 1.5, py: 0.3, fontSize: '0.7rem', '&:hover': { bgcolor: '#9e3a58' }, boxShadow: 'none' }}
                          >
                            Add
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '1rem' }}>
                        £{product.price.toFixed(2)}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add sx={{ fontSize: '0.9rem' }} />}
                        onClick={() => setModifierProduct(product)}
                        disabled={!product.inStock}
                        sx={{ bgcolor: '#b03160', color: 'white', borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', fontSize: '0.75rem', px: 1.5, py: 0.4, boxShadow: 'none', '&:hover': { bgcolor: '#9e3a58' } }}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {!loading && filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#999', fontFamily: '"PT Serif"' }}>No items in this category yet</Typography>
          </Box>
        )}
      </Container>

      <ModifierModal
        open={!!modifierProduct}
        onClose={() => setModifierProduct(null)}
        product={modifierProduct}
        onAdded={(name) => { setAddedItemName(name); setShowConfirmation(true); }}
      />

      <Snackbar open={showConfirmation} autoHideDuration={2500} onClose={() => setShowConfirmation(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ zIndex: 9999 }}>
        <Alert onClose={() => setShowConfirmation(false)} severity="success" sx={{ width: '100%' }}>
          {addedItemName} added to cart
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
