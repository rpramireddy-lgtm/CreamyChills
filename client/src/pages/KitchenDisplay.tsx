import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Grid } from '@mui/material';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [audio] = useState(new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjyJxN/ntWQ/IkOFvNvhu2xEJUaGudnguHBIKEmItdfetXRMLEqIs9XdsndQMEyLsdPbr3lTMk6Mr9DZrHxWNVGNrM7WqH5ZN1OOqszTpYFcOVWQqMjQoIRgPVmSp8TNoIZiP1qUp8HLn4hjQFuWqL/Jm4RlQ1yZqrzHlYJoRl+brLnDkYFsR2GdqrTAjoBvR2KesA=='));

  useEffect(() => {
    fetchOrders();

    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://staging.creamychills.com');
    socket.emit('join-admin');
    
    socket.on('new-order', () => {
      audio.play().catch(() => {});
      fetchOrders();
    });

    socket.on('order-update', () => fetchOrders());

    const interval = setInterval(fetchOrders, 30000);
    return () => { socket.disconnect(); clearInterval(interval); };
  }, []);

  const fetchOrders = async () => {
    try {
      const [confirmed, preparing] = await Promise.all([
        adminAPI.getOrders({ status: 'confirmed' }),
        adminAPI.getOrders({ status: 'preparing' })
      ]);
      setOrders([
        ...(confirmed.data.orders || []),
        ...(preparing.data.orders || [])
      ]);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await adminAPI.updateOrder(orderId, { status });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const getTimeSince = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  return (
    <Box sx={{ bgcolor: '#1a1a2e', minHeight: '100vh', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white', fontFamily: '"Poppins"', fontWeight: 500 }}>
          🍳 Kitchen Display
        </Typography>
        <Chip label={`${orders.length} active`} sx={{ bgcolor: '#b03160', color: 'white', fontSize: '1rem' }} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {orders.map((order: any) => (
          <Card key={order._id} sx={{
            bgcolor: order.status === 'confirmed' ? '#fff3cd' : '#d4edda',
            border: order.status === 'confirmed' ? '2px solid #ffc107' : '2px solid #28a745',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>{order.orderNumber}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>{getTimeSince(order.createdAt)}</Typography>
              </Box>

              <Chip
                label={order.status.toUpperCase()}
                size="small"
                sx={{ mb: 2, bgcolor: order.status === 'confirmed' ? '#ffc107' : '#28a745', color: order.status === 'confirmed' ? '#000' : '#fff' }}
              />

              <Box sx={{ mb: 2 }}>
                {order.items?.map((item: any, i: number) => (
                  <Typography key={i} sx={{ fontSize: '0.9rem', fontWeight: 500, py: 0.3, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    {item.quantity}x {item.product?.name || 'Item'}
                  </Typography>
                ))}
              </Box>

              {order.notes && (
                <Typography sx={{ fontSize: '0.8rem', color: '#d32f2f', fontStyle: 'italic', mb: 1 }}>
                  ⚠️ {order.notes}
                </Typography>
              )}

              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                {order.deliveryMethod === 'pickup' ? '📦 Collection' : '🚗 Delivery'}
              </Typography>

              {order.status === 'confirmed' && (
                <Button fullWidth variant="contained" onClick={() => updateStatus(order._id, 'preparing')}
                  sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' }, textTransform: 'none', fontWeight: 600 }}>
                  Start Preparing
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button fullWidth variant="contained" onClick={() => updateStatus(order._id, 'ready')}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, textTransform: 'none', fontWeight: 600 }}>
                  Mark Ready
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <Box sx={{ gridColumn: '1/-1', textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem' }}>No active orders</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>New orders will appear here with a sound alert</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KitchenDisplay;
