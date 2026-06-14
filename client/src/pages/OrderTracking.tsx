import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepConnector
} from '@mui/material';
import { io } from 'socket.io-client';
import { ordersAPI } from '../services/api';

const steps = ['Order Placed', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
const statusToStep: any = { pending: 0, confirmed: 1, preparing: 2, ready: 3, delivered: 4, collected: 4 };

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      
      const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://staging.creamychills.com');
      socket.emit('track-order', orderId);
      
      socket.on('order-status', (data: any) => {
        setOrder((prev: any) => prev ? { ...prev, status: data.status } : prev);
      });

      return () => { socket.disconnect(); };
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await ordersAPI.getById(orderId!);
      setOrder(res.data);
    } catch (e: any) {
      setError('Order not found');
    }
  };

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">{error}</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading order...</Typography>
      </Container>
    );
  }

  const activeStep = statusToStep[order.status] ?? 0;
  const isCancelled = order.status === 'cancelled';

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 1 }}>
              Order Tracking
            </Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666' }}>
              {order.orderNumber}
            </Typography>
          </Box>

          {isCancelled ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Chip label="CANCELLED" color="error" sx={{ fontSize: '1rem', py: 2, px: 3 }} />
              <Typography sx={{ mt: 2, color: '#666' }}>This order has been cancelled.</Typography>
            </Box>
          ) : (
            <>
              {/* Live indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', animation: 'pulse 1.5s infinite' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#4caf50' }}>Live tracking</Typography>
              </Box>

              {/* Progress Stepper */}
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label, i) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          '&.Mui-active': { color: '#b03160' },
                          '&.Mui-completed': { color: '#b03160' }
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '0.75rem', fontFamily: '"PT Serif"' }}>{label}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Status Message */}
              <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#fcf5f6', borderRadius: 2, mb: 3 }}>
                <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>
                  {activeStep === 0 && '🕐'}
                  {activeStep === 1 && '✅'}
                  {activeStep === 2 && '👨‍🍳'}
                  {activeStep === 3 && '🎉'}
                  {activeStep === 4 && '🚀'}
                </Typography>
                <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>
                  {activeStep === 0 && 'Waiting for confirmation'}
                  {activeStep === 1 && 'Order confirmed!'}
                  {activeStep === 2 && 'Being prepared now'}
                  {activeStep === 3 && 'Ready for collection!'}
                  {activeStep === 4 && 'Delivered!'}
                </Typography>
                {order.estimatedDeliveryTime && activeStep < 4 && (
                  <Typography sx={{ fontSize: '0.85rem', color: '#666', mt: 1 }}>
                    Estimated: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
              </Box>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Order Details */}
          <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2 }}>Order Details</Typography>
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
              {order.deliveryMethod === 'pickup' ? '📍 Collection from 60 East Main Street, Broxburn' : `🚗 Delivery to ${order.deliveryAddress?.street}`}
            </Typography>
          </Box>
        </Paper>
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

export default OrderTracking;
