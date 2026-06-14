import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentsAPI, discountsAPI } from '../services/api';
import SquareCheckout from '../components/Checkout/SquareCheckout';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    deliveryMethod: 'pickup',
    address: { street: '', city: '', state: '', zipCode: '' },
    notes: '',
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [discountCode, setDiscountCode] = useState('');
  const [discountResult, setDiscountResult] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');

  const subtotal = cartState.total;
  const deliveryFee = formData.deliveryMethod === 'delivery' ? 3.99 : 0;
  const discount = discountResult?.discountAmount || 0;
  const tax = Math.round((subtotal - discount) * 0.2 * 100) / 100;
  const total = Math.round((subtotal - discount + deliveryFee + tax) * 100) / 100;

  const handleApplyDiscount = async () => {
    setDiscountError('');
    setDiscountResult(null);
    if (!discountCode.trim()) return;
    try {
      const res = await discountsAPI.validate(discountCode, subtotal);
      setDiscountResult(res.data);
    } catch (e: any) {
      setDiscountError(e.response?.data?.message || 'Invalid code');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const orderData = {
        items: cartState.items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || [],
        })),
        deliveryMethod: formData.deliveryMethod,
        deliveryAddress: formData.deliveryMethod === 'delivery' ? formData.address : undefined,
        guestInfo: !user ? {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        } : undefined,
        notes: formData.notes,
      };

      const response = await ordersAPI.create(orderData);
      setOrderId(response.data._id);
      setStep('payment');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    }
  };

  const handlePaymentSuccess = (result: any) => {
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (cartState.items.length === 0 && !orderId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Your cart is empty</Typography>
        <Button href="/products" sx={{ mt: 2 }}>Browse Menu</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' } }}>
          {step === 'details' && (
            <Paper sx={{ p: 3 }}>
              <form onSubmit={handleCreateOrder}>
                <Typography variant="h5" gutterBottom>
                  Contact Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 100%' }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Box>
                </Box>

                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <FormLabel component="legend">Collection Method</FormLabel>
                  <RadioGroup
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="pickup" control={<Radio />} label="Collection (Free)" />
                    <FormControlLabel value="delivery" control={<Radio />} label="Delivery (+£3.99)" />
                  </RadioGroup>
                </FormControl>

                {formData.deliveryMethod === 'delivery' && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        required
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                      <TextField
                        fullWidth
                        label="City"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%' } }}>
                      <TextField
                        fullWidth
                        label="Post Code"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Box>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Special Instructions (Optional)"
                  name="notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                  inputProps={{ maxLength: 500 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' } }}
                >
                  Continue to Payment
                </Button>
              </form>
            </Paper>
          )}

          {step === 'payment' && orderId && (
            <Paper sx={{ p: 3 }}>
              <SquareCheckout
                orderId={orderId}
                amount={total}
                customerEmail={formData.email}
                customerName={formData.name}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Paper>
          )}
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 33%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            
            {cartState.items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.name} x{item.quantity}</Typography>
                <Typography variant="body2">£{(item.price * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />

            {/* Discount Code */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  sx={{ flex: 1 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleApplyDiscount}
                  sx={{ borderColor: '#b03160', color: '#b03160', textTransform: 'none', borderRadius: '100px' }}
                >
                  Apply
                </Button>
              </Box>
              {discountError && <Typography sx={{ color: 'error.main', fontSize: '0.8rem', mt: 0.5 }}>{discountError}</Typography>}
              {discountResult && <Typography sx={{ color: '#4caf50', fontSize: '0.8rem', mt: 0.5 }}>✓ {discountResult.description || `${discountResult.value}${discountResult.type === 'percentage' ? '%' : '£'} off`}</Typography>}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>£{subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>VAT (20%):</Typography>
              <Typography>£{tax.toFixed(2)}</Typography>
            </Box>

            {discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: '#4caf50' }}>Discount:</Typography>
                <Typography sx={{ color: '#4caf50' }}>-£{discount.toFixed(2)}</Typography>
              </Box>
            )}
            
            {deliveryFee > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Delivery:</Typography>
                <Typography>£{deliveryFee.toFixed(2)}</Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" sx={{ color: '#b03160' }}>£{total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Checkout;
