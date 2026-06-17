import React from 'react';
import { Container, Typography, Box, Paper, Button, IconButton, Divider } from '@mui/material';
import { Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import UpsellSuggestions from '../components/UpsellSuggestions';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, getItemTotal } = useCart();

  if (state.items.length === 0) {
    return (
      <Box sx={{ bgcolor: '#fff8f4', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <SEO title="Cart" />
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: '#d4859a', mb: 2 }} />
          <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.5rem', mb: 1 }}>
            Your cart is empty
          </Typography>
          <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', mb: 4 }}>
            Browse our menu and add something delicious
          </Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ bgcolor: '#b03160', borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', px: 4, py: 1.5, '&:hover': { bgcolor: '#9e3a58' }, boxShadow: 'none' }}>
            Browse Menu
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <SEO title="Cart" />
      <Container maxWidth="md">
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.8rem', color: '#b03160', mb: 3 }}>
          Your Cart ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Items */}
          <Box sx={{ flex: 1 }}>
            {state.items.map((item) => (
              <Paper key={item.id} sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box component="img" src={item.image || '/images/placeholder.jpg'} alt={item.name} sx={{ width: 70, height: 70, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }} />
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.9rem', mb: 0.3 }}>{item.name}</Typography>
                  {item.customizations && item.customizations.length > 0 && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
                      {item.customizations.map(c => c.value).join(', ')}
                    </Typography>
                  )}
                  <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '0.9rem', mt: 0.5 }}>
                    £{getItemTotal(item).toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} sx={{ border: '1px solid #e0e0e0', width: 28, height: 28 }}>
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography sx={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} sx={{ border: '1px solid #e0e0e0', width: 28, height: 28 }}>
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>

                <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ color: '#999' }}>
                  <Delete sx={{ fontSize: 18 }} />
                </IconButton>
              </Paper>
            ))}
          </Box>

          {/* Summary */}
          <Paper sx={{ p: 3, width: { xs: '100%', md: 300 }, height: 'fit-content', position: { md: 'sticky' }, top: { md: 80 } }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2 }}>Order Summary</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>Subtotal</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>£{state.total.toFixed(2)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600 }}>Total</Typography>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, color: '#b03160', fontSize: '1.2rem' }}>
                £{state.total.toFixed(2)}
              </Typography>
            </Box>

            <Button component={Link} to="/checkout" variant="contained" fullWidth size="large"
              disabled={state.total < 10}
              sx={{ bgcolor: '#b03160', borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', py: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#9e3a58' }, '&.Mui-disabled': { bgcolor: '#e0e0e0' } }}>
              Proceed to Checkout
            </Button>

            {state.total < 10 && (
              <Typography sx={{ textAlign: 'center', mt: 1, fontSize: '0.8rem', color: '#d32f2f' }}>
                Minimum order £10.00 (add £{(10 - state.total).toFixed(2)} more)
              </Typography>
            )}

            <Button component={Link} to="/products" variant="text" fullWidth sx={{ mt: 1, textTransform: 'none', fontFamily: '"PT Serif"', color: '#666' }}>
              Continue Shopping
            </Button>

            <UpsellSuggestions />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Cart;
