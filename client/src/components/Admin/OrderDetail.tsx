import React, { useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Button, Chip, Divider, IconButton } from '@mui/material';
import { Print, Close } from '@mui/icons-material';

interface Props {
  order: any;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

const OrderDetail: React.FC<Props> = ({ order, open, onClose, onStatusChange }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=300,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Order ${order.orderNumber}</title>
      <style>
        body { font-family: monospace; font-size: 12px; padding: 10px; width: 280px; }
        h1 { font-size: 16px; text-align: center; margin: 5px 0; }
        h2 { font-size: 14px; margin: 10px 0 5px; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .center { text-align: center; }
      </style></head><body>
        <h1>CREAMY CHILLS</h1>
        <p class="center">60 East Main Street, Broxburn</p>
        <div class="line"></div>
        <h2>Order: ${order.orderNumber}</h2>
        <p>${new Date(order.createdAt).toLocaleString('en-GB')}</p>
        <p>${order.deliveryMethod === 'pickup' ? 'COLLECTION' : 'DELIVERY'}</p>
        ${order.deliveryMethod === 'delivery' ? `<p>${order.deliveryAddress?.street}, ${order.deliveryAddress?.city} ${order.deliveryAddress?.zipCode}</p>` : ''}
        <div class="line"></div>
        ${order.items?.map((item: any) => `<div class="item"><span>${item.quantity}x ${item.product?.name || 'Item'}</span><span>£${(item.price * item.quantity).toFixed(2)}</span></div>`).join('')}
        <div class="line"></div>
        <div class="item"><strong>TOTAL</strong><strong>£${order.total?.toFixed(2)}</strong></div>
        <div class="line"></div>
        <p>Customer: ${order.user?.name || order.guestInfo?.name || '—'}</p>
        ${order.user?.phone || order.guestInfo?.phone ? `<p>Phone: ${order.user?.phone || order.guestInfo?.phone}</p>` : ''}
        ${order.notes ? `<p>Notes: ${order.notes}</p>` : ''}
        <div class="line"></div>
        <p class="center">Thank you!</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const statusColor = (s: string): any => ({ pending: 'warning', confirmed: 'info', preparing: 'info', ready: 'success', delivered: 'success', cancelled: 'error' }[s] || 'default');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontWeight: 500 }}>{order.orderNumber}</Typography>
          <Typography variant="body2" color="text.secondary">{new Date(order.createdAt).toLocaleString('en-GB')}</Typography>
        </Box>
        <Box>
          <IconButton onClick={handlePrint} title="Print ticket"><Print /></IconButton>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent ref={printRef}>
        {/* Status */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Chip label={order.status} color={statusColor(order.status)} />
          <Chip label={order.deliveryMethod === 'pickup' ? 'Collection' : 'Delivery'} variant="outlined" />
          {order.paymentStatus && <Chip label={order.paymentStatus} size="small" variant="outlined" />}
        </Box>

        {/* Customer */}
        <Box sx={{ bgcolor: '#fcf5f6', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Customer</Typography>
          <Typography variant="body2">{order.user?.name || order.guestInfo?.name || '—'}</Typography>
          {(order.user?.email || order.guestInfo?.email) && <Typography variant="body2" color="text.secondary">{order.user?.email || order.guestInfo?.email}</Typography>}
          {(order.user?.phone || order.guestInfo?.phone) && <Typography variant="body2" color="text.secondary">{order.user?.phone || order.guestInfo?.phone}</Typography>}
        </Box>

        {/* Delivery address */}
        {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>Delivery Address</Typography>
            <Typography variant="body2">{order.deliveryAddress.street}</Typography>
            <Typography variant="body2">{order.deliveryAddress.city} {order.deliveryAddress.zipCode}</Typography>
          </Box>
        )}

        {/* Items */}
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ fontWeight: 500, mb: 1 }}>Items</Typography>
        {order.items?.map((item: any, i: number) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.quantity}x {item.product?.name || 'Item'}</Typography>
              {item.customizations?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {item.customizations.map((c: any) => c.value).join(', ')}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>£{(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Totals */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Subtotal</Typography>
          <Typography variant="body2">£{order.subtotal?.toFixed(2)}</Typography>
        </Box>
        {order.tax > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">VAT</Typography>
          <Typography variant="body2">£{order.tax?.toFixed(2)}</Typography>
        </Box>}
        {order.deliveryFee > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Delivery</Typography>
          <Typography variant="body2">£{order.deliveryFee?.toFixed(2)}</Typography>
        </Box>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>Total</Typography>
          <Typography sx={{ fontWeight: 600, color: '#b03160' }}>£{order.total?.toFixed(2)}</Typography>
        </Box>

        {/* Notes */}
        {order.notes && (
          <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, mt: 2 }}>
            <Typography sx={{ fontWeight: 500, fontSize: '0.85rem' }}>⚠️ Notes</Typography>
            <Typography variant="body2">{order.notes}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {order.status === 'pending' && <Button variant="contained" onClick={() => onStatusChange(order._id, 'confirmed')} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Confirm</Button>}
        {order.status === 'confirmed' && <Button variant="contained" onClick={() => onStatusChange(order._id, 'preparing')} sx={{ bgcolor: '#ff9800', textTransform: 'none' }}>Start Preparing</Button>}
        {order.status === 'preparing' && <Button variant="contained" onClick={() => onStatusChange(order._id, 'ready')} sx={{ bgcolor: '#4caf50', textTransform: 'none' }}>Mark Ready</Button>}
        {order.status === 'ready' && <Button variant="contained" onClick={() => onStatusChange(order._id, 'delivered')} sx={{ bgcolor: '#2196f3', textTransform: 'none' }}>Mark Delivered</Button>}
        <Button onClick={handlePrint} startIcon={<Print />} sx={{ textTransform: 'none' }}>Print</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetail;
