import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Divider,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, getItemTotal } = useCart();

  const subtotal = state.total;
  const total = subtotal;

  if (state.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Add some delicious desserts to get started!
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          size="large"
        >
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' } }}>
          {state.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 25%' } }}>
                    <Box
                      component="img"
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      sx={{
                        width: '100%',
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Base price: £{item.price.toFixed(2)}
                    </Typography>
                    {item.customizations && item.customizations.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {item.customizations.map((custom, index) => {
                          let displayText = '';
                          if (custom.name === 'Container') {
                            displayText = `🥤 Served in: ${custom.value}`;
                          } else if (custom.name === 'Extra Scoops') {
                            displayText = `🍦 ${custom.value}`;
                          } else if (custom.name === 'Topping') {
                            displayText = `🍓 Extra: ${custom.value}`;
                          } else if (custom.name === 'Size') {
                            displayText = `📏 Size: ${custom.value}`;
                          } else {
                            displayText = `${custom.name}: ${custom.value}`;
                          }
                          
                          return (
                            <Typography key={index} variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                              {displayText}
                              {custom.additionalPrice > 0 && (
                                <Typography component="span" sx={{ color: 'success.main', fontWeight: 600, ml: 1 }}>
                                  (+£{custom.additionalPrice.toFixed(2)})
                                </Typography>
                              )}
                            </Typography>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 25%' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        size="small"
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0;
                          updateQuantity(item.id, qty);
                        }}
                        size="small"
                        sx={{ width: 60 }}
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                      />
                      <IconButton
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        size="small"
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 17%' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6">
                        £{getItemTotal(item).toFixed(2)}
                      </Typography>
                      <IconButton
                        onClick={() => removeFromCart(item.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>£{subtotal.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">£{total.toFixed(2)}</Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                to="/checkout"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 2 }}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                fullWidth
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default Cart;