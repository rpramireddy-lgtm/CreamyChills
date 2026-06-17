import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent } from '@mui/material';
import { Add } from '@mui/icons-material';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const UpsellSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { state, addToCart } = useCart();

  useEffect(() => {
    fetchSuggestions();
  }, [state.items]);

  const fetchSuggestions = async () => {
    try {
      const res = await productsAPI.getAll({ featured: true, limit: 20 });
      const products = res.data.products || [];
      
      // Get categories in cart
      const cartCategories = state.items.map(i => i.name).join(' ').toLowerCase();
      
      // Suggest complementary items not already in cart
      const cartIds = state.items.map(i => i.id);
      let suggestions = products.filter((p: any) => !cartIds.some(id => id.includes(p._id)));

      // If waffle/crepe in cart, suggest milkshake
      if (cartCategories.includes('waffle') || cartCategories.includes('crepe')) {
        const milkshakes = suggestions.filter((p: any) => p.category === 'milkshake');
        if (milkshakes.length > 0) { setSuggestions(milkshakes.slice(0, 3)); return; }
      }

      // If milkshake in cart, suggest waffle/cookie dough
      if (cartCategories.includes('milkshake') || cartCategories.includes('shake')) {
        const desserts = suggestions.filter((p: any) => ['waffle', 'crepe', 'cookie-dough'].includes(p.category));
        if (desserts.length > 0) { setSuggestions(desserts.slice(0, 3)); return; }
      }

      // Default: show random featured items
      setSuggestions(suggestions.sort(() => Math.random() - 0.5).slice(0, 3));
    } catch (e) {}
  };

  const handleAdd = (product: any) => {
    addToCart({ id: product._id, name: product.name, price: product.price, image: product.image });
  };

  if (suggestions.length === 0 || state.items.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.95rem', mb: 2 }}>
        Goes great with your order
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, overflow: 'auto', pb: 1 }}>
        {suggestions.map((p: any) => (
          <Card key={p._id} sx={{ minWidth: 140, maxWidth: 160, borderRadius: 2, border: '1px solid #f0e8e8', boxShadow: 'none', flexShrink: 0 }}>
            <CardMedia component="img" height="80" image={p.image} alt={p.name} sx={{ objectFit: 'cover' }} />
            <CardContent sx={{ p: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2, mb: 0.5 }}>{p.name}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#b03160' }}>£{p.price.toFixed(2)}</Typography>
                <Button size="small" onClick={() => handleAdd(p)} sx={{ minWidth: 'auto', p: 0.5, bgcolor: '#b03160', color: 'white', borderRadius: '50%', '&:hover': { bgcolor: '#9e3a58' } }}>
                  <Add sx={{ fontSize: 14 }} />
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default UpsellSuggestions;
