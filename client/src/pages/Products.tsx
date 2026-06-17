import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardMedia, CardContent, Button, Chip, Tabs, Tab,
  Snackbar, Alert, Skeleton, TextField, InputAdornment, Dialog, DialogContent, DialogActions,
  Radio, RadioGroup, FormControlLabel, Checkbox, IconButton, Divider
} from '@mui/material';
import { Search as SearchIcon, Close, Add, Remove } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://staging.creamychills.com/api', withCredentials: true });

const Products: React.FC = () => {
  const location = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  // Ordering flow state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => { fetchMenu(); }, []);
  useEffect(() => { if (location.state?.category) setSelectedCategory(location.state.category); }, [location.state]);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = products
    .filter(p => selectedCategory === 'all' || p.categorySlug === selectedCategory)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const visible = filtered.slice(0, visibleCount);

  // Ordering flow
  const openProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedVariation(product.variations?.[0] || null);
    setSelectedModifiers({});
    setQuantity(1);
  };

  const toggleModifier = (groupId: string, modName: string, selectionType: string) => {
    const current = selectedModifiers[groupId] || [];
    if (selectionType === 'SINGLE') {
      setSelectedModifiers({ ...selectedModifiers, [groupId]: [modName] });
    } else {
      if (current.includes(modName)) {
        setSelectedModifiers({ ...selectedModifiers, [groupId]: current.filter(m => m !== modName) });
      } else {
        setSelectedModifiers({ ...selectedModifiers, [groupId]: [...current, modName] });
      }
    }
  };

  const getModifierTotal = () => {
    if (!selectedProduct) return 0;
    let total = 0;
    Object.entries(selectedModifiers).forEach(([groupId, selected]) => {
      const group = selectedProduct.modifiers.find((m: any) => m.id === groupId);
      if (group) {
        selected.forEach(name => {
          const mod = group.modifiers.find((m: any) => m.name === name);
          if (mod) total += mod.price;
        });
      }
    });
    return total;
  };

  const getTotal = () => {
    const base = selectedVariation?.price || selectedProduct?.variations?.[0]?.price || 0;
    return (base + getModifierTotal()) * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const base = selectedVariation?.price || selectedProduct.variations?.[0]?.price || 0;
    const variationName = selectedVariation?.name || '';

    const customizations = Object.entries(selectedModifiers).flatMap(([groupId, selected]) => {
      const group = selectedProduct.modifiers.find((m: any) => m.id === groupId);
      return selected.map(name => {
        const mod = group?.modifiers.find((m: any) => m.name === name);
        return { name: group?.name || '', value: name, additionalPrice: mod?.price || 0 };
      });
    });

    const itemName = variationName && variationName !== 'Regular'
      ? `${selectedProduct.name} (${variationName})`
      : selectedProduct.name;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${selectedProduct.id}-${variationName}-${Date.now()}-${i}`,
        name: itemName,
        price: base,
        image: selectedProduct.image,
        customizations
      });
    }

    setAddedItemName(itemName);
    setShowConfirmation(true);
    setSelectedProduct(null);
  };

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <SEO title="Menu" description="Order from our full menu — ice cream, waffles, milkshakes, crepes and more." />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            Our Menu
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          fullWidth size="small" placeholder="Search menu..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#b03160' }} /></InputAdornment> }}
          sx={{ mb: 3, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* Categories */}
        <Tabs value={selectedCategory} onChange={(_, v) => { setSelectedCategory(v); setVisibleCount(24); }} variant="scrollable" scrollButtons="auto"
          sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontFamily: '"PT Serif"', fontSize: '0.85rem', minWidth: 'auto', px: 2 }, '& .Mui-selected': { color: '#b03160 !important' }, '& .MuiTabs-indicator': { backgroundColor: '#b03160' } }}>
          <Tab label="All" value="all" />
          {categories.map(cat => <Tab key={cat.id} label={cat.name} value={cat.slug} />)}
        </Tabs>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => <Card key={i}><Skeleton variant="rectangular" height={150} /><CardContent><Skeleton width="70%" /><Skeleton width="40%" /></CardContent></Card>)}
          </Box>
        )}

        {/* Products Grid */}
        {!loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {visible.map(product => (
              <Card key={product.id} onClick={() => openProduct(product)} sx={{
                cursor: 'pointer', borderRadius: 2, overflow: 'hidden', border: '1px solid #f0e8e8', boxShadow: 'none',
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(176,49,96,0.1)' }
              }}>
                {product.image ? (
                  <CardMedia component="img" height="150" image={product.image} alt={product.name} loading="lazy" sx={{ objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ height: 150, bgcolor: '#fcf5f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#d4859a', fontSize: '2rem' }}>🍦</Typography>
                  </Box>
                )}
                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.85rem', color: '#333', lineHeight: 1.2, mb: 0.5 }}>{product.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#999', mb: 1 }}>{product.category}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '0.95rem' }}>
                      {product.variations?.length > 1
                        ? `From £${Math.min(...product.variations.map((v: any) => v.price)).toFixed(2)}`
                        : `£${product.variations?.[0]?.price?.toFixed(2) || '0.00'}`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Load More */}
        {!loading && visibleCount < filtered.length && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button onClick={() => setVisibleCount(prev => prev + 24)} variant="outlined" sx={{ borderColor: '#b03160', color: '#b03160', borderRadius: '100px', textTransform: 'none', px: 4 }}>
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}><Typography sx={{ color: '#999' }}>No items found</Typography></Box>
        )}
      </Container>

      {/* ORDERING DIALOG — Step by step like Square */}
      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} maxWidth="sm" fullWidth>
        {selectedProduct && (
          <>
            <Box sx={{ position: 'relative' }}>
              {selectedProduct.image && (
                <Box component="img" src={selectedProduct.image} sx={{ width: '100%', height: 200, objectFit: 'cover' }} />
              )}
              <IconButton onClick={() => setSelectedProduct(null)} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}><Close /></IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.3rem', mb: 0.5 }}>{selectedProduct.name}</Typography>
              {selectedProduct.description && <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 2 }}>{selectedProduct.description}</Typography>}

              {/* Step 1: Size/Variation */}
              {selectedProduct.variations?.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.95rem', mb: 1.5 }}>Choose Size</Typography>
                  <RadioGroup value={selectedVariation?.id || ''} onChange={(e) => setSelectedVariation(selectedProduct.variations.find((v: any) => v.id === e.target.value))}>
                    {selectedProduct.variations.map((v: any) => (
                      <FormControlLabel key={v.id} value={v.id} control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#b03160' } }} />}
                        label={<Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                          <Typography sx={{ fontSize: '0.9rem' }}>{v.name}</Typography>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#b03160' }}>£{v.price.toFixed(2)}</Typography>
                        </Box>}
                        sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 0.5, mx: 0, pr: 0, ...(selectedVariation?.id === v.id ? { border: '1px solid #b03160', bgcolor: '#fcf5f6' } : {}) }}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}

              {/* Step 2+: Modifier Groups */}
              {selectedProduct.modifiers?.map((group: any) => (
                <Box key={group.id} sx={{ mb: 3 }}>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.95rem', mb: 0.5 }}>{group.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#999', mb: 1.5 }}>
                    {group.selectionType === 'SINGLE' ? 'Choose one' : 'Select as many as you like'}
                  </Typography>

                  {group.modifiers.map((mod: any) => {
                    const isSelected = (selectedModifiers[group.id] || []).includes(mod.name);
                    return (
                      <Box
                        key={mod.id}
                        onClick={() => toggleModifier(group.id, mod.name, group.selectionType)}
                        sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          p: 1.5, mb: 0.5, borderRadius: 1, cursor: 'pointer',
                          border: isSelected ? '1px solid #b03160' : '1px solid #e0e0e0',
                          bgcolor: isSelected ? '#fcf5f6' : 'white',
                          '&:hover': { bgcolor: '#fafafa' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {group.selectionType === 'SINGLE'
                            ? <Radio checked={isSelected} size="small" sx={{ p: 0, '&.Mui-checked': { color: '#b03160' } }} />
                            : <Checkbox checked={isSelected} size="small" sx={{ p: 0, '&.Mui-checked': { color: '#b03160' } }} />
                          }
                          <Typography sx={{ fontSize: '0.88rem' }}>{mod.name}</Typography>
                        </Box>
                        {mod.price > 0 && <Typography sx={{ fontSize: '0.85rem', color: '#b03160', fontWeight: 500 }}>+£{mod.price.toFixed(2)}</Typography>}
                      </Box>
                    );
                  })}
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Quantity */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ border: '1px solid #ddd' }}><Remove /></IconButton>
                <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>{quantity}</Typography>
                <IconButton onClick={() => setQuantity(Math.min(10, quantity + 1))} sx={{ border: '1px solid #ddd' }}><Add /></IconButton>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button fullWidth variant="contained" onClick={handleAddToCart}
                sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', py: 1.5, textTransform: 'none', fontFamily: '"PT Serif"', fontSize: '1rem', boxShadow: 'none' }}>
                Add to Cart — £{getTotal().toFixed(2)}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={showConfirmation} autoHideDuration={2500} onClose={() => setShowConfirmation(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowConfirmation(false)} severity="success">{addedItemName} added to cart</Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
