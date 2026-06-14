import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Switch, FormControlLabel, Alert
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy } from '@mui/icons-material';
import { productsAPI, categoriesAPI, adminAPI } from '../../services/api';

const AdminItemsCRUD: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', category: 'ice-cream', price: 0, image: '', inStock: true, featured: false,
    sizes: [] as Array<{ name: string; price: number }>
  });

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    try { const res = await productsAPI.getAll(); setProducts(res.data.products || []); } catch (e) {}
  };

  const fetchCategories = async () => {
    try { const res = await categoriesAPI.getAll(); setCategories(res.data || []); } catch (e) {}
  };

  const handleOpen = (product?: any) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name, description: product.description, category: product.category,
        price: product.price, image: product.image || '', inStock: product.inStock,
        featured: product.featured || false, sizes: product.sizes || []
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', category: 'ice-cream', price: 0, image: '', inStock: true, featured: false, sizes: [] });
    }
    setError('');
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    try {
      if (editing) {
        await adminAPI.updateProduct(editing._id, form);
      } else {
        await adminAPI.createProduct(form);
      }
      setDialog(false);
      fetchProducts();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try { await adminAPI.deleteProduct(id); fetchProducts(); } catch (e) {}
  };

  const handleToggleStock = async (product: any) => {
    try {
      await adminAPI.updateProduct(product._id, { inStock: !product.inStock });
      fetchProducts();
    } catch (e) {}
  };

  const handleDuplicate = async (product: any) => {
    try {
      const { _id, ...rest } = product;
      await adminAPI.createProduct({ ...rest, name: `${product.name} (Copy)` });
      fetchProducts();
    } catch (e) {}
  };

  const addSize = () => {
    setForm({ ...form, sizes: [...form.sizes, { name: '', price: 0 }] });
  };

  const updateSize = (index: number, field: string, value: any) => {
    const sizes = [...form.sizes];
    (sizes[index] as any)[field] = field === 'price' ? parseFloat(value) : value;
    setForm({ ...form, sizes });
  };

  const removeSize = (index: number) => {
    setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== index) });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>
          Menu Items ({products.length})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>
          Add Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#fcf5f6' }}>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>In Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell>
                  {p.image && <Box component="img" src={p.image} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{p.name}</Typography>
                  {p.featured && <Chip label="Featured" size="small" sx={{ ml: 1, fontSize: '0.65rem' }} />}
                </TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>£{p.price?.toFixed(2)}</TableCell>
                <TableCell>
                  <Switch checked={p.inStock} size="small" onChange={() => handleToggleStock(p)} color="success" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(p)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDuplicate(p)}><ContentCopy fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(p._id)}><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
            <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.length > 0
                ? categories.map((c: any) => <MenuItem key={c._id} value={c.slug}>{c.name}</MenuItem>)
                : ['ice-cream','waffle','milkshake','cake','drink'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)
              }
            </TextField>
            <TextField label="Base Price (£)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
            <TextField label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/images/products/..." />
            <FormControlLabel control={<Switch checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />} label="In Stock" />
            <FormControlLabel control={<Switch checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />} label="Featured" />

            {/* Sizes */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>Sizes (optional)</Typography>
                <Button size="small" onClick={addSize}>+ Add Size</Button>
              </Box>
              {form.sizes.map((size, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" placeholder="Size name" value={size.name} onChange={(e) => updateSize(i, 'name', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" placeholder="Price" type="number" value={size.price} onChange={(e) => updateSize(i, 'price', e.target.value)} sx={{ width: 100 }} />
                  <Button size="small" color="error" onClick={() => removeSize(i)}>×</Button>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#b03160' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminItemsCRUD;
