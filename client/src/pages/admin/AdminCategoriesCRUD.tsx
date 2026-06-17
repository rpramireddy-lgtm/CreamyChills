import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Chip } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { categoriesAPI } from '../../services/api';

const AdminCategoriesCRUD: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#b03160', isActive: true, sortOrder: 0 });

  useEffect(() => { fetch(); }, []);
  const fetch = async () => { try { const res = await categoriesAPI.getAll(); setCategories(res.data); } catch (e) {} };

  const handleOpen = (cat?: any) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color || '#b03160', isActive: cat.isActive, sortOrder: cat.sortOrder || 0 });
    } else {
      setEditing(null);
      setForm({ name: '', slug: '', description: '', color: '#b03160', isActive: true, sortOrder: 0 });
    }
    setDialog(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      if (editing) { await categoriesAPI.update(editing._id, data); }
      else { await categoriesAPI.create(data); }
      setDialog(false); fetch();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoriesAPI.delete(id); fetch(); } catch (e) {}
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Categories ({categories.length})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Add Category</Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {categories.map((c: any) => (
          <Paper key={c._id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c.color || '#b03160' }} />
              <Box>
                <Typography sx={{ fontWeight: 500 }}>{c.name}</Typography>
                <Typography variant="body2" color="text.secondary">{c.slug} • Order: {c.sortOrder}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={c.isActive ? 'Active' : 'Inactive'} size="small" color={c.isActive ? 'success' : 'default'} />
              <IconButton size="small" onClick={() => handleOpen(c)}><Edit sx={{ fontSize: 16 }} /></IconButton>
              <IconButton size="small" onClick={() => handleDelete(c._id)}><Delete sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" helperText="URL-friendly identifier (e.g. ice-cream, cookie-dough)" />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} sx={{ width: 120 }} />
              <TextField label="Color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} sx={{ width: 120 }} />
            </Box>
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active (visible to customers)" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategoriesCRUD;
