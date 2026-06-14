import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  Alert,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Phone
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);

  useEffect(() => {
    fetchReadyOrders();

    const s = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://staging.creamychills.com');
    s.emit('join-admin');
    
    s.on('new-order', () => {
      fetchReadyOrders();
    });

    s.on('order-update', () => {
      fetchReadyOrders();
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  const fetchReadyOrders = async () => {
    try {
      const res = await adminAPI.getOrders({ status: 'ready' });
      const deliveryOrders = (res.data.orders || []).filter((o: any) => o.deliveryMethod === 'delivery');
      setOrders(deliveryOrders);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickup = async (order: any) => {
    try {
      await adminAPI.updateOrder(order._id, { status: 'delivering' });
      setActiveDelivery(order);
      fetchReadyOrders();
    } catch (e) {
      // If 'delivering' isn't valid, use 'delivered' flow
      setActiveDelivery(order);
    }
  };

  const handleDelivered = async () => {
    if (!activeDelivery) return;
    try {
      await adminAPI.updateOrder(activeDelivery._id, { status: 'delivered' });
      setActiveDelivery(null);
      fetchReadyOrders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <LocalShipping sx={{ color: '#b03160', fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>
              Delivery Driver
            </Typography>
            <Typography variant="body2" color="text.secondary">{user?.name}</Typography>
          </Box>
        </Box>

        {/* Active Delivery */}
        {activeDelivery && (
          <Paper sx={{ p: 3, mb: 3, border: '2px solid #b03160', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50', animation: 'pulse 1s infinite' }} />
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Active Delivery</Typography>
            </Box>

            <Typography sx={{ fontWeight: 600, mb: 1 }}>{activeDelivery.orderNumber}</Typography>
            
            <Box sx={{ bgcolor: '#fcf5f6', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Deliver to:</Typography>
              <Typography variant="body2">
                {activeDelivery.deliveryAddress?.street}<br />
                {activeDelivery.deliveryAddress?.city} {activeDelivery.deliveryAddress?.zipCode}
              </Typography>
            </Box>

            <Box sx={{ bgcolor: '#fcf5f6', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Customer:</Typography>
              <Typography variant="body2">
                {activeDelivery.user?.name || activeDelivery.guestInfo?.name}
              </Typography>
              {(activeDelivery.user?.phone || activeDelivery.guestInfo?.phone) && (
                <Button
                  startIcon={<Phone />}
                  size="small"
                  href={`tel:${activeDelivery.user?.phone || activeDelivery.guestInfo?.phone}`}
                  sx={{ mt: 1, color: '#b03160' }}
                >
                  Call Customer
                </Button>
              )}
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {activeDelivery.items?.length} items • £{activeDelivery.total?.toFixed(2)}
              {activeDelivery.paymentStatus !== 'paid' && ' • CASH ON DELIVERY'}
            </Typography>

            {activeDelivery.notes && (
              <Alert severity="info" sx={{ mb: 2 }}>{activeDelivery.notes}</Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              startIcon={<CheckCircle />}
              onClick={handleDelivered}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, borderRadius: '100px', textTransform: 'none', py: 1.5 }}
            >
              Mark as Delivered
            </Button>
          </Paper>
        )}

        {/* Ready for Delivery */}
        <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, color: '#333' }}>
          Ready for Delivery ({orders.length})
        </Typography>

        {orders.length === 0 && !activeDelivery && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No deliveries waiting</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>New orders will appear here automatically</Typography>
          </Paper>
        )}

        {orders.map((order: any) => (
          <Card key={order._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>{order.orderNumber}</Typography>
                <Chip label="Ready" size="small" color="success" />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                {order.items?.length} items • £{order.total?.toFixed(2)}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={() => handlePickup(order)}
                disabled={!!activeDelivery}
                sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', textTransform: 'none' }}
              >
                Pick Up for Delivery
              </Button>
            </CardContent>
          </Card>
        ))}
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
};

export default DriverDashboard;
