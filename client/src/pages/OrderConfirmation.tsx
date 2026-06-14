import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: { name: string; image: string };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  deliveryMethod: string;
  estimatedDeliveryTime: string;
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h3" gutterBottom>
          Order Confirmed!
        </Typography>
        
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Thank you for your order
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order Number: <strong>{order.orderNumber}</strong>
          </Typography>
          
          <Chip
            label={order.status.toUpperCase()}
            color="primary"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Estimated {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Time:
          </Typography>
          <Typography variant="h6" color="primary">
            {new Date(order.estimatedDeliveryTime).toLocaleString()}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          
          {order.items.map((item, index) => (
            <Grid container key={index} spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <Typography>
                  {item.product.name} x {item.quantity}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography>
                  £{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          ))}
          
          <Box sx={{ borderTop: '1px solid #eee', pt: 2, mt: 2 }}>
            <Grid container>
              <Grid item xs={8}>
                <Typography variant="h6">Total:</Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="h6">£{order.total.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
          >
            Continue Shopping
          </Button>
          <Button
            component={Link}
            to="/profile"
            variant="outlined"
            size="large"
          >
            View Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;