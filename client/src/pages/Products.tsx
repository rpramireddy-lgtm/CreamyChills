import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardMedia, CardContent, Button, Chip, Tabs, Tab,
  Snackbar, Alert, Skeleton, TextField, InputAdornment, Dialog, DialogContent,
  IconButton, Radio, Checkbox, Divider
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

  const openProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedVariation(null);
    setSelectedModifiers({});
    setQuantity(1);
  };

  const getModifierTotal = () => {
    if (!selectedProduct) return 0;
    let total = 0;
    Object.entries(selectedModifiers).forEach(([groupId, selected]) => {
      const group = selectedProduct.modifiers.find((m: any) => m.id === groupId);
      if (group) selected.forEach(name => {
        const mod = group.modifiers.find((m: any) => m.name === name);
        if (mod) total += mod.price;
      });
    });
    return total;
  };

  const getTotal = () => {
    const base = selectedVariation?.price || selectedProduct?.variations?.[0]?.price || 0;
    return (base + getModifierTotal()) * quantity;
  };

  const isValid = () => {
    if (!selectedProduct) return false;
    if (selectedProduct.variations?.length > 1 && !selectedVariation) return false;
    const requiredGroups = (selectedProduct.modifiers || []).filter((g: any) =>
      g.required || g.name.toLowerCase().includes('cone') || g.name.toLowerCase().includes('whipp')
    );
    if (!requiredGroups.every((g: any) => (selectedModifiers[g.id]?.length || 0) > 0)) return false;
    // Check mix limits are met
    const mixGroups = (selectedProduct.modifiers || []).filter((g: any) => g.name.toLowerCase().includes('mix of any'));
    for (const g of mixGroups) {
      const isMix2 = g.name.toLowerCase().includes('mix of any 2');
      const isMix3 = g.name.toLowerCase().includes('mix of any 3');
      const required = isMix2 ? 2 : isMix3 ? 3 : 0;
      const picked = (selectedModifiers[g.id] || []).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).length;
      if (required > 0 && picked < required) return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !isValid()) return;
    const base = selectedVariation?.price || selectedProduct.variations?.[0]?.price || 0;
    const variationName = selectedVariation?.name || '';
    const customizations = Object.entries(selectedModifiers).flatMap(([groupId, selected]) => {
      const group = selectedProduct.modifiers.find((m: any) => m.id === groupId);
      return selected.map(name => {
        const mod = group?.modifiers.find((m: any) => m.name === name);
        return { name: group?.name || '', value: name, additionalPrice: mod?.price || 0 };
      });
    });
    const itemName = variationName && variationName !== 'Regular' ? `${selectedProduct.name} (${variationName})` : selectedProduct.name;
    for (let i = 0; i < quantity; i++) {
      addToCart({ id: `${selectedProduct.id}-${variationName}-${Date.now()}-${i}`, name: itemName, price: base, image: selectedProduct.image, customizations });
    }
    setAddedItemName(itemName);
    setShowConfirmation(true);
    setSelectedProduct(null);
  };

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <SEO title="Menu" description="Order from our full menu." />
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>Our Menu</Typography>
        </Box>

        <TextField fullWidth size="small" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#b03160' }} /></InputAdornment> }}
          sx={{ mb: 3, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Tabs value={selectedCategory} onChange={(_, v) => { setSelectedCategory(v); setVisibleCount(24); }} variant="scrollable" scrollButtons="auto"
          sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontFamily: '"PT Serif"', fontSize: '0.85rem', minWidth: 'auto', px: 2 }, '& .Mui-selected': { color: '#b03160 !important' }, '& .MuiTabs-indicator': { backgroundColor: '#b03160' } }}>
          <Tab label="All" value="all" />
          {categories.map(cat => <Tab key={cat.id} label={cat.name} value={cat.slug} />)}
        </Tabs>

        {loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => <Card key={i}><Skeleton variant="rectangular" height={150} /><CardContent><Skeleton width="70%" /><Skeleton width="40%" /></CardContent></Card>)}
          </Box>
        )}

        {!loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {visible.map(product => (
              <Card key={product.id} onClick={() => openProduct(product)} sx={{
                cursor: 'pointer', borderRadius: 2, overflow: 'hidden', border: '1px solid #f0e8e8', boxShadow: 'none',
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(176,49,96,0.1)' }
              }}>
                {product.image ? (
                  <Box sx={{ height: 150, bgcolor: '#faf5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                    <Box component="img" src={product.image} alt={product.name} loading="lazy" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </Box>
                ) : (
                  <Box sx={{ height: 150, bgcolor: '#fcf5f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#d4859a', fontSize: '2rem' }}>🍦</Typography>
                  </Box>
                )}
                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.85rem', color: '#333', lineHeight: 1.2, mb: 0.5 }}>{product.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#999', mb: 1 }}>{product.category}</Typography>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '0.95rem' }}>
                    {product.variations?.length > 1 ? `From £${Math.min(...product.variations.map((v: any) => v.price)).toFixed(2)}` : `£${product.variations?.[0]?.price?.toFixed(2) || '0.00'}`}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {!loading && visibleCount < filtered.length && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button onClick={() => setVisibleCount(prev => prev + 24)} variant="outlined" sx={{ borderColor: '#b03160', color: '#b03160', borderRadius: '100px', textTransform: 'none', px: 4 }}>
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </Box>
        )}
        {!loading && filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 8 }}><Typography sx={{ color: '#999' }}>No items found</Typography></Box>}
      </Container>

      {/* JUST EAT STYLE ORDERING DIALOG */}
      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 }, maxHeight: { xs: '100%', sm: '90vh' } } }} fullScreen={window.innerWidth < 600}>
        {selectedProduct && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              {selectedProduct.image && <Box component="img" src={selectedProduct.image} sx={{ width: '100%', height: { xs: 200, sm: 220 }, objectFit: 'cover' }} />}
              <IconButton onClick={() => setSelectedProduct(null)} sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'white', boxShadow: 2 }}><Close /></IconButton>
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, fontSize: '1.3rem', mb: 0.5 }}>{selectedProduct.name}</Typography>
              {selectedProduct.description && <Typography sx={{ color: '#666', fontSize: '0.88rem', mb: 3, lineHeight: 1.5 }}>{selectedProduct.description}</Typography>}

              {/* SIZE SECTION - Required, radio style */}
              {selectedProduct.variations?.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Choose size</Typography>
                    <Chip label="Required" size="small" sx={{ bgcolor: '#fff0f3', color: '#b03160', fontSize: '0.7rem', height: 22 }} />
                  </Box>
                  {selectedProduct.variations.map((v: any) => (
                    <Box key={v.id} onClick={() => setSelectedVariation(v)} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.5, mb: 0.5, borderRadius: 1.5, cursor: 'pointer',
                      border: selectedVariation?.id === v.id ? '2px solid #b03160' : '1px solid #e8e8e8',
                      bgcolor: selectedVariation?.id === v.id ? '#fff8f4' : 'white',
                      '&:hover': { bgcolor: '#fafafa' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Radio checked={selectedVariation?.id === v.id} size="small" sx={{ p: 0, '&.Mui-checked': { color: '#b03160' } }} />
                        <Typography sx={{ fontSize: '0.9rem' }}>{v.name}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>£{v.price.toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* MODIFIER SECTIONS - sorted: required first (cone after size), then optional */}
              {[...(selectedProduct.modifiers || [])]
                .sort((a: any, b: any) => {
                  const aReq = a.required || a.name.toLowerCase().includes("cone") || a.name.toLowerCase().includes("whipp");
                  const bReq = b.required || b.name.toLowerCase().includes("cone") || b.name.toLowerCase().includes("whipp");
                  if (aReq && !bReq) return -1;
                  if (!aReq && bReq) return 1;
                  if (a.name.toLowerCase().includes("cone")) return -1;
                  if (b.name.toLowerCase().includes("cone")) return 1;
                  return 0;
                })
                .map((group: any) => {
                const selected = selectedModifiers[group.id] || [];
                const isRequired = group.required || group.name.toLowerCase().includes("cone") || group.name.toLowerCase().includes("whipp");
                const isSinglePick = isRequired;
                const isMix2 = group.name.toLowerCase().includes("mix of any 2");
                const isMix3 = group.name.toLowerCase().includes("mix of any 3");
                const maxPicks = isMix2 ? 2 : isMix3 ? 3 : 0;
                const uniqueSelected = selected.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
                const atLimit = maxPicks > 0 && uniqueSelected.length >= maxPicks;

                return (
                  <Box key={group.id} sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{group.name}</Typography>
                      {(isRequired || maxPicks > 0)
                        ? <Chip label={maxPicks > 0 ? `${uniqueSelected.length}/${maxPicks} chosen` : "Required"} size="small" sx={{ bgcolor: (maxPicks > 0 && uniqueSelected.length === maxPicks) ? "#e8f5e9" : "#fff0f3", color: (maxPicks > 0 && uniqueSelected.length === maxPicks) ? "#2e7d32" : "#b03160", fontSize: "0.7rem", height: 22 }} />
                        : <Chip label="Optional" size="small" sx={{ bgcolor: "#f5f5f5", color: "#888", fontSize: "0.7rem", height: 22 }} />
                      }
                    </Box>
                    {maxPicks > 0 && <Typography sx={{ fontSize: "0.75rem", color: "#999", mb: 1 }}>Choose exactly {maxPicks} flavour{maxPicks > 1 ? "s" : ""}</Typography>}
                    {!isRequired && !maxPicks && <Typography sx={{ fontSize: "0.75rem", color: "#999", mb: 1 }}>Choose as many as you like</Typography>}

                    {group.modifiers.map((mod: any) => {
                      const isSelected = selected.includes(mod.name);
                      const itemCount = selected.filter((x: string) => x === mod.name).length;
                      const disabledByLimit = maxPicks > 0 && !isSelected && atLimit;
                      return (
                        <Box key={mod.id} sx={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          p: 1.5, mb: 0.5, borderRadius: 1.5, opacity: disabledByLimit ? 0.4 : 1,
                          border: isSelected ? "2px solid #b03160" : "1px solid #e8e8e8",
                          bgcolor: isSelected ? "#fff8f4" : "white",
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            {isSinglePick
                              ? <Radio checked={isSelected} size="small" sx={{ p: 0, "&.Mui-checked": { color: "#b03160" } }} onClick={() => setSelectedModifiers({ ...selectedModifiers, [group.id]: [mod.name] })} />
                              : <Checkbox checked={isSelected} size="small" disabled={disabledByLimit} sx={{ p: 0, "&.Mui-checked": { color: "#b03160" } }} onClick={() => {
                                  if (maxPicks > 0) {
                                    const updated = isSelected ? uniqueSelected.filter((x: string) => x !== mod.name) : (uniqueSelected.length < maxPicks ? [...uniqueSelected, mod.name] : uniqueSelected);
                                    setSelectedModifiers({ ...selectedModifiers, [group.id]: updated });
                                  } else {
                                    const updated = isSelected ? selected.filter((x: string) => x !== mod.name) : [...selected, mod.name];
                                    setSelectedModifiers({ ...selectedModifiers, [group.id]: updated });
                                  }
                                }} />
                            }
                            <Typography sx={{ fontSize: "0.9rem" }}>{mod.name}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {mod.price > 0 && <Typography sx={{ fontSize: "0.85rem", color: "#b03160", fontWeight: 500 }}>+£{mod.price.toFixed(2)}</Typography>}
                            {!isSinglePick && !maxPicks && isSelected && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); const updated = [...selected]; const idx = updated.lastIndexOf(mod.name); if (idx > -1) updated.splice(idx, 1); setSelectedModifiers({ ...selectedModifiers, [group.id]: updated }); }} sx={{ width: 24, height: 24, border: "1px solid #ddd" }}><Remove sx={{ fontSize: 14 }} /></IconButton>
                                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, minWidth: 16, textAlign: "center" }}>{itemCount}</Typography>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedModifiers({ ...selectedModifiers, [group.id]: [...selected, mod.name] }); }} sx={{ width: 24, height: 24, border: "1px solid #ddd" }}><Add sx={{ fontSize: 14 }} /></IconButton>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}

              {/* Quantity */}
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ border: '1px solid #ddd', width: 36, height: 36 }}><Remove /></IconButton>
                <Typography sx={{ fontWeight: 600, fontSize: '1.2rem' }}>{quantity}</Typography>
                <IconButton onClick={() => setQuantity(Math.min(10, quantity + 1))} sx={{ border: '1px solid #ddd', width: 36, height: 36 }}><Add /></IconButton>
              </Box>
            </Box>

            {/* Fixed footer */}
            <Box sx={{ p: 2, borderTop: '1px solid #eee', flexShrink: 0, bgcolor: 'white' }}>
              <Button fullWidth variant="contained" onClick={handleAddToCart} disabled={!isValid()}
                sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' }, borderRadius: 2, py: 1.5, textTransform: 'none', fontFamily: '"Poppins"', fontSize: '1rem', fontWeight: 600, boxShadow: 'none' }}>
                {!isValid() ? 'Complete required selections' : `Add to order \u2022 \u00a3${getTotal().toFixed(2)}`}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      <Snackbar open={showConfirmation} autoHideDuration={2500} onClose={() => setShowConfirmation(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setShowConfirmation(false)} severity="success">{addedItemName} added to cart</Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
