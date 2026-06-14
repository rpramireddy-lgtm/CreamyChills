import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, loyaltyAPI } from '../services/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    fetchLoyalty();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchLoyalty = async () => {
    try {
      const res = await loyaltyAPI.getStatus();
      setLoyalty(res.data);
    } catch (e) { console.error(e); }
  };

  const statusColor = (status: string): any => {
    const colors: any = { pending: 'warning', confirmed: 'info', preparing: 'info', ready: 'success', delivered: 'success', cancelled: 'error' };
    return colors[status] || 'default';
  };

  const tierColors: any = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2' };

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>
              {user?.name}
            </Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666' }}>{user?.email}</Typography>
          </Box>
          <Button onClick={logout} variant="outlined" sx={{ borderColor: '#b03160', color: '#b03160', borderRadius: '100px', textTransform: 'none' }}>
            Logout
          </Button>
        </Box>

        {/* Loyalty Card */}
        {loyalty && (
          <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #b03160, #9e3a58)', color: 'white', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.1rem' }}>Loyalty Rewards</Typography>
              <Chip
                label={loyalty.tier.toUpperCase()}
                size="small"
                sx={{ bgcolor: tierColors[loyalty.tier], color: loyalty.tier === 'gold' ? '#333' : '#fff', fontWeight: 600 }}
              />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>{loyalty.points} pts</Typography>
            <Typography sx={{ fontSize: '0.85rem', opacity: 0.8, mb: 2 }}>
              {loyalty.pointsToNextTier > 0 ? `${loyalty.pointsToNextTier} points to next tier` : 'Maximum tier reached!'}
            </Typography>
            {loyalty.pointsToNextTier > 0 && (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, ((loyalty.totalEarned) / (loyalty.totalEarned + loyalty.pointsToNextTier)) * 100)}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>Multiplier</Typography>
                <Typography sx={{ fontWeight: 600 }}>{loyalty.benefits?.multiplier}x</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>Total Earned</Typography>
                <Typography sx={{ fontWeight: 600 }}>{loyalty.totalEarned} pts</Typography>
              </Box>
              {loyalty.points >= 100 && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>Redeemable</Typography>
                  <Typography sx={{ fontWeight: 600 }}>£{Math.floor(loyalty.points / 100)} off</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Orders" sx={{ textTransform: 'none', fontFamily: '"PT Serif"' }} />
          <Tab label="Rewards History" sx={{ textTransform: 'none', fontFamily: '"PT Serif"' }} />
        </Tabs>

        {/* Orders Tab */}
        {tab === 0 && (
          <Box>
            {orders.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No orders yet</Typography>
                <Button href="/products" sx={{ mt: 2, color: '#b03160' }}>Browse Menu</Button>
              </Paper>
            ) : (
              orders.map((order: any) => (
                <Card key={order._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 500 }}>{order.orderNumber}</Typography>
                      <Chip label={order.status} size="small" color={statusColor(order.status)} />
                    </Box>

                    {/* Order Tracking Steps */}
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                      {['pending', 'confirmed', 'preparing', 'ready', order.deliveryMethod === 'delivery' ? 'delivered' : 'collected'].map((step, i) => {
                        const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
                        const currentIndex = steps.indexOf(order.status);
                        const isComplete = i <= currentIndex;
                        return (
                          <Box key={step} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: isComplete ? '#b03160' : '#e0e0e0' }} />
                        );
                      })}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#999', mb: 2 }}>
                      <Typography sx={{ fontSize: '0.75rem' }}>Placed</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }}>Confirmed</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }}>Preparing</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }}>Ready</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }}>{order.deliveryMethod === 'delivery' ? 'Delivered' : 'Collected'}</Typography>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    {order.items?.map((item: any, i: number) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2">{item.product?.name || 'Item'} x{item.quantity}</Typography>
                        <Typography variant="body2">£{(item.price * item.quantity).toFixed(2)}</Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 500 }}>Total</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#b03160' }}>£{order.total?.toFixed(2)}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' • '}{order.deliveryMethod === 'pickup' ? 'Collection' : 'Delivery'}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Rewards History Tab */}
        {tab === 1 && (
          <Box>
            {loyalty?.recentHistory?.length > 0 ? (
              loyalty.recentHistory.map((entry: any, i: number) => (
                <Paper key={i} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.9rem' }}>{entry.description}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(entry.createdAt).toLocaleDateString('en-GB')}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: entry.type === 'earned' ? '#4caf50' : '#b03160' }}>
                    {entry.type === 'earned' ? '+' : ''}{entry.points} pts
                  </Typography>
                </Paper>
              ))
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No rewards history yet. Place an order to earn points!</Typography>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Profile;
