import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton,
  Badge,
  Alert,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  CheckCircle,
  Cancel,
  OpenInNew
} from '@mui/icons-material';
import { adminAPI, categoriesAPI, modifiersAPI, discountsAPI, analyticsAPI, imagesAPI } from '../services/api';
import AdminItemsCRUD from './admin/AdminItemsCRUD';
import AdminCategoriesCRUD from './admin/AdminCategoriesCRUD';
import AdminModifiersCRUD from './admin/AdminModifiersCRUD';
import OrderDetail from '../components/Admin/OrderDetail';
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://staging.creamychills.com/api', withCredentials: true });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modifiers, setModifiers] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [discountDialog, setDiscountDialog] = useState(false);
  const [discountForm, setDiscountForm] = useState({ code: '', type: 'percentage', value: 10, minOrderAmount: 0, maxUses: 100, isActive: true, description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchStats(); fetchOrders(); 
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => { fetchStats(); if (tab === 1) fetchOrders(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === 1) fetchOrders();
    if (tab === 3) fetchCategories();
    if (tab === 4) fetchModifiers();
    if (tab === 5) fetchDiscounts();
    if (tab === 6) fetchAnalytics();
    if (tab === 7) fetchImages();
    if (tab === 8) fetchReviews();
    if (tab === 9) fetchUsers();
  }, [tab, analyticsPeriod]);

  const fetchStats = async () => { try { const res = await adminAPI.getStats(); setStats(res.data); } catch (e) {} finally { setLoading(false); } };
  const fetchOrders = async () => { try { const p: any = {}; if (statusFilter) p.status = statusFilter; const res = await adminAPI.getOrders(p); setOrders(res.data.orders || []); } catch (e) {} };
  const fetchCategories = async () => { try { const res = await categoriesAPI.getAll(); setCategories(res.data); } catch (e) {} };
  const fetchModifiers = async () => { try { const res = await modifiersAPI.getAll(); setModifiers(res.data); } catch (e) {} };
  const fetchDiscounts = async () => { try { const res = await discountsAPI.getAll(); setDiscounts(res.data); } catch (e) {} };
  const fetchImages = async () => { try { const res = await imagesAPI.getAll(); setImages(res.data.images || []); } catch (e) {} };
  const fetchReviews = async () => { try { const res = await api.get('/reviews/pending'); setReviews(res.data); } catch (e) {} };
  const fetchUsers = async () => { try { const res = await adminAPI.getUsers(); setUsers(res.data.users || []); } catch (e) {} };
  const fetchAnalytics = async () => {
    try {
      const [rev, top, peak, cust] = await Promise.all([
        analyticsAPI.getRevenue(analyticsPeriod), analyticsAPI.getTopProducts(10), analyticsAPI.getPeakHours(), analyticsAPI.getCustomers()
      ]);
      setAnalytics(rev.data); setTopProducts(top.data); setPeakHours(peak.data); setCustomerStats(cust.data);
    } catch (e) {}
  };

  const updateOrderStatus = async (id: string, status: string) => { try { await adminAPI.updateOrder(id, { status }); fetchOrders(); fetchStats(); } catch (e) {} };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try { if (e.target.files.length === 1) await imagesAPI.upload(e.target.files[0]); else await imagesAPI.uploadBulk(e.target.files); fetchImages(); } catch (e) {}
  };
  const handleDeleteImage = async (f: string) => { try { await imagesAPI.delete(f); fetchImages(); } catch (e) {} };
  const handleCreateDiscount = async () => { try { await discountsAPI.create(discountForm); setDiscountDialog(false); setDiscountForm({ code: '', type: 'percentage', value: 10, minOrderAmount: 0, maxUses: 100, isActive: true, description: '' }); fetchDiscounts(); } catch (e) {} };
  const handleDeleteDiscount = async (id: string) => { try { await discountsAPI.delete(id); fetchDiscounts(); } catch (e) {} };
  const handleApproveReview = async (id: string) => { try { await api.put(`/reviews/${id}/approve`); fetchReviews(); } catch (e) {} };
  const handleDeleteReview = async (id: string) => { try { await api.delete(`/reviews/${id}`); fetchReviews(); } catch (e) {} };

  const statusColor = (s: string): any => ({ pending: 'warning', confirmed: 'info', preparing: 'info', ready: 'success', delivered: 'success', cancelled: 'error' }[s] || 'default');

  const tabs = ['Dashboard', 'Orders', 'Menu Items', 'Categories', 'Modifiers', 'Discounts', 'Analytics', 'Images', 'Reviews', 'Customers', 'Quick Links'];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff8f4' }}>
      {/* Sidebar */}
      <Box sx={{ width: 200, bgcolor: '#b03160', py: 3, px: 2, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <Typography sx={{ color: 'white', fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1rem', mb: 3, px: 1 }}>Admin</Typography>
        {tabs.map((item, i) => (
          <Box key={item} onClick={() => setTab(i)} sx={{ py: 1.2, px: 1.5, mb: 0.3, borderRadius: 1, cursor: 'pointer', bgcolor: tab === i ? 'rgba(255,255,255,0.15)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <Typography sx={{ color: 'white', fontSize: '0.85rem' }}>{item}</Typography>
          </Box>
        ))}
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            {tabs.map(t => <Tab key={t} label={t} sx={{ fontSize: '0.7rem', minWidth: 'auto' }} />)}
          </Tabs>
        </Box>

        {/* 0: Dashboard */}
        {tab === 0 && stats && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Dashboard</Typography>
              <Button variant="contained" onClick={async () => {
                try {
                  const res = await api.post('/sync/pull');
                  alert('✅ Sync complete! Menu updated from Square POS.');
                  fetchStats();
                } catch (e: any) { alert('Sync failed: ' + (e.response?.data?.message || e.message)); }
              }} sx={{ bgcolor: '#b03160', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: '#9e3a58' } }}>
                🔄 Sync from Square
              </Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
              {[
                { l: "Today's Orders", v: stats.todayOrders },
                { l: "Today's Revenue", v: `£${stats.todayRevenue?.toFixed(2)}` },
                { l: 'Pending', v: stats.pendingOrders },
                { l: 'Total Revenue', v: `£${stats.totalRevenue?.toFixed(2)}` }
              ].map((s, i) => (
                <Card key={i}><CardContent><Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>{s.l}</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: '#b03160' }}>{s.v}</Typography></CardContent></Card>
              ))}
            </Box>
            <Paper sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 500, mb: 2 }}>Recent Orders</Typography>
              {stats.recentOrders?.slice(0, 8).map((o: any) => (
                <Box key={o._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f0e8e8' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{o.orderNumber} • £{o.total?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={o.status} size="small" color={statusColor(o.status)} />
                    {o.status === 'pending' && <Button size="small" onClick={() => updateOrderStatus(o._id, 'confirmed')} sx={{ fontSize: '0.7rem', bgcolor: '#b03160', color: 'white', '&:hover': { bgcolor: '#9e3a58' } }}>Confirm</Button>}
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>
        )}

        {/* 1: Orders */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Orders</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 120 }} label="Status">
                  <MenuItem value="">All</MenuItem>
                  {['pending','confirmed','preparing','ready','delivered','cancelled'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <Button size="small" onClick={fetchOrders} startIcon={<RefreshIcon />}>Refresh</Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead><TableRow sx={{ bgcolor: '#fcf5f6' }}><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Total</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
                <TableBody>
                  {orders.map((o: any) => (
                    <TableRow key={o._id} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#fcf5f6' } }} onClick={() => setSelectedOrder(o)}>
                      <TableCell sx={{ fontWeight: 500 }}>{o.orderNumber}</TableCell>
                      <TableCell>{o.user?.name || o.guestInfo?.name || '—'}</TableCell>
                      <TableCell>£{o.total?.toFixed(2)}</TableCell>
                      <TableCell><Chip label={o.deliveryMethod} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={o.status} size="small" color={statusColor(o.status)} /></TableCell>
                      <TableCell>
                        <TextField select size="small" value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)} sx={{ minWidth: 110 }}>
                          {['pending','confirmed','preparing','ready','delivered','cancelled'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>No orders</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>

            <OrderDetail
              order={selectedOrder}
              open={!!selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusChange={(id, status) => { updateOrderStatus(id, status); setSelectedOrder(null); }}
            />
          </Box>
        )}

        {/* 2: Menu Items CRUD */}
        {tab === 2 && <AdminItemsCRUD />}

        {/* 3: Categories */}
        {tab === 3 && <AdminCategoriesCRUD />}

        {/* 4: Modifiers */}
        {tab === 4 && <AdminModifiersCRUD />}

        {/* 5: Discounts */}
        {tab === 5 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Discounts</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDiscountDialog(true)} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Create</Button>
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead><TableRow sx={{ bgcolor: '#fcf5f6' }}><TableCell>Code</TableCell><TableCell>Type</TableCell><TableCell>Value</TableCell><TableCell>Min</TableCell><TableCell>Used</TableCell><TableCell>Active</TableCell><TableCell></TableCell></TableRow></TableHead>
                <TableBody>
                  {discounts.map((d: any) => (
                    <TableRow key={d._id}>
                      <TableCell sx={{ fontWeight: 600 }}>{d.code}</TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.type === 'percentage' ? `${d.value}%` : `£${d.value}`}</TableCell>
                      <TableCell>£{d.minOrderAmount?.toFixed(2)}</TableCell>
                      <TableCell>{d.usedCount}{d.maxUses ? `/${d.maxUses}` : ''}</TableCell>
                      <TableCell><Chip label={d.isActive ? 'Yes' : 'No'} size="small" color={d.isActive ? 'success' : 'default'} /></TableCell>
                      <TableCell><IconButton size="small" onClick={() => handleDeleteDiscount(d._id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                  {discounts.length === 0 && <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>No codes</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={discountDialog} onClose={() => setDiscountDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Create Discount</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField label="Code" value={discountForm.code} onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} />
                  <TextField label="Description" value={discountForm.description} onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })} />
                  <TextField select label="Type" value={discountForm.type} onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}><MenuItem value="percentage">Percentage</MenuItem><MenuItem value="fixed">Fixed (£)</MenuItem></TextField>
                  <TextField label="Value" type="number" value={discountForm.value} onChange={(e) => setDiscountForm({ ...discountForm, value: parseFloat(e.target.value) })} />
                  <TextField label="Min Order (£)" type="number" value={discountForm.minOrderAmount} onChange={(e) => setDiscountForm({ ...discountForm, minOrderAmount: parseFloat(e.target.value) })} />
                  <TextField label="Max Uses" type="number" value={discountForm.maxUses} onChange={(e) => setDiscountForm({ ...discountForm, maxUses: parseInt(e.target.value) })} />
                </Box>
              </DialogContent>
              <DialogActions><Button onClick={() => setDiscountDialog(false)}>Cancel</Button><Button variant="contained" onClick={handleCreateDiscount} sx={{ bgcolor: '#b03160' }}>Create</Button></DialogActions>
            </Dialog>
          </Box>
        )}

        {/* 6: Analytics */}
        {tab === 6 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Analytics</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['7d', '30d', '90d'].map(p => (
                  <Button key={p} size="small" variant={analyticsPeriod === p ? 'contained' : 'outlined'}
                    onClick={() => { setAnalyticsPeriod(p); }}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', ...(analyticsPeriod === p ? { bgcolor: '#b03160' } : { borderColor: '#b03160', color: '#b03160' }) }}>
                    {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                  </Button>
                ))}
              </Box>
            </Box>
            {analytics && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
                <Card><CardContent><Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>Revenue</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: '#b03160' }}>£{analytics.totalRevenue?.toFixed(2)}</Typography></CardContent></Card>
                <Card><CardContent><Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>Orders</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: '#b03160' }}>{analytics.totalOrders}</Typography></CardContent></Card>
                <Card><CardContent><Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>Avg Order</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: '#b03160' }}>£{analytics.avgOrderValue?.toFixed(2)}</Typography></CardContent></Card>
                <Card><CardContent><Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>Customers</Typography><Typography variant="h5" sx={{ fontWeight: 600, color: '#b03160' }}>{customerStats?.totalCustomers || 0}</Typography></CardContent></Card>
              </Box>
            )}
            {analytics?.dailyRevenue?.length > 0 && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography sx={{ fontWeight: 500, mb: 2 }}>Daily Revenue</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 120, overflow: 'auto' }}>
                  {analytics.dailyRevenue.map((d: any, i: number) => {
                    const max = Math.max(...analytics.dailyRevenue.map((x: any) => x.revenue));
                    return (<Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 25 }}>
                      <Typography sx={{ fontSize: '0.55rem', color: '#b03160' }}>£{d.revenue.toFixed(0)}</Typography>
                      <Box sx={{ width: 16, height: max > 0 ? (d.revenue / max) * 90 : 0, bgcolor: '#b03160', borderRadius: '2px 2px 0 0' }} />
                      <Typography sx={{ fontSize: '0.5rem', color: '#999' }}>{d._id.slice(8)}</Typography>
                    </Box>);
                  })}
                </Box>
              </Paper>
            )}
            {topProducts.length > 0 && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography sx={{ fontWeight: 500, mb: 1 }}>Top Products</Typography>
                {topProducts.map((p: any, i: number) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                    <Typography sx={{ fontSize: '0.85rem' }}>{i + 1}. {p.name}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>£{p.revenue?.toFixed(2)} ({p.totalSold} sold)</Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {peakHours.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 500, mb: 1 }}>Peak Hours</Typography>
                <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'flex-end', height: 80 }}>
                  {Array.from({ length: 24 }, (_, h) => {
                    const d = peakHours.find((p: any) => p._id === h);
                    const max = Math.max(...peakHours.map((p: any) => p.orders));
                    return (<Box key={h} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', height: d ? (d.orders / max) * 60 : 0, bgcolor: d && d.orders > max * 0.7 ? '#b03160' : '#d4859a', borderRadius: '2px 2px 0 0' }} />
                      <Typography sx={{ fontSize: '0.45rem', color: '#999' }}>{h}</Typography>
                    </Box>);
                  })}
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* 7: Images */}
        {tab === 7 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Images ({images.length})</Typography>
              <Button variant="contained" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Upload</Button>
              <input ref={fileInputRef} type="file" hidden accept="image/*" multiple onChange={handleImageUpload} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(5,1fr)' }, gap: 2 }}>
              {images.map((img: any) => (
                <Paper key={img.filename} sx={{ overflow: 'hidden' }}>
                  <Box component="img" src={`https://staging.creamychills.com${img.url}`} sx={{ width: '100%', height: 100, objectFit: 'cover' }} />
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{img.filename}</Typography>
                    <IconButton size="small" onClick={() => handleDeleteImage(img.filename)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                </Paper>
              ))}
              {images.length === 0 && <Paper sx={{ p: 3, textAlign: 'center', gridColumn: '1/-1' }}><Typography color="text.secondary">No images. Click Upload.</Typography></Paper>}
            </Box>
          </Box>
        )}

        {/* 8: Reviews */}
        {tab === 8 && (
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 3 }}>Pending Reviews ({reviews.length})</Typography>
            {reviews.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">No reviews pending approval</Typography></Paper>
            ) : (
              reviews.map((r: any) => (
                <Paper key={r._id} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>{r.product?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">by {r.user?.name} • {'⭐'.repeat(r.rating)}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" color="success" onClick={() => handleApproveReview(r._id)}><CheckCircle /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteReview(r._id)}><Cancel /></IconButton>
                    </Box>
                  </Box>
                  {r.comment && <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{r.comment}"</Typography>}
                </Paper>
              ))
            )}
          </Box>
        )}

        {/* 9: Customers */}
        {tab === 9 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Customers & Staff ({users.length})</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => window.open(`${process.env.REACT_APP_API_URL}/staff/orders/export`, '_blank')} sx={{ textTransform: 'none', borderColor: '#b03160', color: '#b03160' }}>Export Orders CSV</Button>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => {
                  const name = prompt('Staff name:');
                  const email = prompt('Email:');
                  const password = prompt('Password (min 8 chars, uppercase, lowercase, number, special):');
                  const role = prompt('Role (staff/driver/admin):');
                  if (name && email && password && role) {
                    api.post('/staff/users', { name, email, password, role }).then(() => fetchUsers()).catch((e: any) => alert(e.response?.data?.message || 'Failed'));
                  }
                }} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Add Staff</Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead><TableRow sx={{ bgcolor: '#fcf5f6' }}><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Joined</TableCell></TableRow></TableHead>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Chip label={u.role} size="small" color={u.role === 'admin' ? 'error' : 'default'} /></TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString('en-GB')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* 10: Quick Links */}
        {tab === 10 && (
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 3 }}>Staff Quick Links</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' }, gap: 2 }}>
              <Card sx={{ border: '2px solid #b03160' }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>🔄 Sync from Square POS</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Pull latest menu items, categories, modifiers and images from your Square POS into the website.</Typography>
                  <Button variant="contained" onClick={async () => {
                    try {
                      const res = await api.post('/sync/pull');
                      alert('Sync complete! ' + (res.data.message || ''));
                      fetchStats();
                    } catch (e: any) { alert('Sync failed: ' + (e.response?.data?.message || e.message)); }
                  }} sx={{ bgcolor: '#b03160', textTransform: 'none', borderRadius: '100px' }}>Sync Now</Button>
                </CardContent>
              </Card>
              <Card sx={{ cursor: 'pointer' }} onClick={() => window.open('/kitchen', '_blank')}>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>🍳 Kitchen Display</Typography>
                  <Typography variant="body2" color="text.secondary">Full-screen order view for kitchen staff. Shows active orders with sound alerts.</Typography>
                </CardContent>
              </Card>
              <Card sx={{ cursor: 'pointer' }} onClick={() => window.open('/driver', '_blank')}>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>🚗 Driver Dashboard</Typography>
                  <Typography variant="body2" color="text.secondary">Delivery driver view. Pick up ready orders, get customer details, mark delivered.</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>📊 Payment Reports</Typography>
                  <Typography variant="body2" color="text.secondary">Daily reconciliation available via API: /api/payments/reconcile/daily</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>🎁 Loyalty Programme</Typography>
                  <Typography variant="body2" color="text.secondary">4 tiers: Bronze → Silver → Gold → Platinum. 1 point per £1. 100pts = £1 off.</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>📧 Email Notifications</Typography>
                  <Typography variant="body2" color="text.secondary">Auto-sends on: Order confirmed, status updates, delivery ready. Configure SMTP in .env</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 500, fontSize: '1.1rem', mb: 1 }}>⏰ Opening Hours</Typography>
                  <Typography variant="body2" color="text.secondary">Mon-Thu: 12-10pm, Fri-Sat: 12-11pm, Sun: 12-10pm. Orders blocked when closed (production).</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
