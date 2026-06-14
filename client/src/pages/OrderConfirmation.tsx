import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Button, Chip, Divider } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const response = await ordersAPI.getById(orderId);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Box sx={{ textAlign: 'center', py: 8 }}><Typography>Loading...</Typography></Box>;
  if (!order) return <Box sx={{ textAlign: 'center', py: 8 }}><Typography>Order not found</Typography></Box>;

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
          
          <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.8rem', color: '#b03160', mb: 1 }}>
            Order Confirmed!
          </Typography>
          
          <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', mb: 3 }}>
            Thank you for your order
          </Typography>
          
          <Box sx={{ bgcolor: '#fcf5f6', borderRadius: 2, p: 3, mb: 3 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Order Number</Typography>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, fontSize: '1.5rem', color: '#b03160' }}>
              {order.orderNumber}
            </Typography>
          </Box>

          {order.estimatedDeliveryTime && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                Estimated {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Collection'}
              </Typography>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.2rem' }}>
                {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {order.items?.map((item: any, i: number) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2">{item.product?.name || 'Item'} x{item.quantity}</Typography>
              <Typography variant="body2">£{(item.price * item.quantity).toFixed(2)}</Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography sx={{ fontWeight: 600, color: '#b03160' }}>£{order.total?.toFixed(2)}</Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#fcf5f6', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {order.deliveryMethod === 'pickup' ? '📍 Collection from 60 East Main Street, Broxburn' : `🚗 Delivering to ${order.deliveryAddress?.street}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              component={Link}
              to={`/track/${orderId}`}
              variant="contained"
              sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', px: 4, boxShadow: 'none' }}
            >
              Track Order
            </Button>
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              sx={{ borderColor: '#b03160', color: '#b03160', borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', px: 4 }}
            >
              Order More
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OrderConfirmation;
