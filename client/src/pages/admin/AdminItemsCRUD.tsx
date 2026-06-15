import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Switch, FormControlLabel,
  Alert, Tabs, Tab, Checkbox, FormGroup, Divider, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy, Search } from '@mui/icons-material';
import { productsAPI, categoriesAPI, adminAPI, modifiersAPI } from '../../services/api';

const ALLERGEN_OPTIONS = ['Dairy', 'Nuts', 'Gluten', 'Eggs', 'Soya', 'Vegan', 'Vegetarian'];

const AdminItemsCRUD: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dialogTab, setDialogTab] = useState(0);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'ice-cream',
    price: 0,
    image: '',
    inStock: true,
    featured: false,
    allergens: [] as string[],
    preparationTime: 10,
    sizes: [] as Array<{ name: string; price: number }>,
    customizations: [] as Array<{ name: string; options: string[]; additionalPrice: number }>,
    modifierGroupIds: [] as string[]
  });

  useEffect(() => { fetchProducts(); fetchCategories(); fetchModifiers(); }, []);

  const fetchProducts = async () => { try { const res = await productsAPI.getAll(); setProducts(res.data.products || []); } catch (e) {} };
  const fetchCategories = async () => { try { const res = await categoriesAPI.getAll(); setCategories(res.data || []); } catch (e) {} };
  const fetchModifiers = async () => { try { const res = await modifiersAPI.getAll(); setModifierGroups(res.data || []); } catch (e) {} };

  const filteredProducts = products
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpen = (product?: any) => {
    setDialogTab(0);
    setError('');
    if (product) {
      setEditing(product);
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'ice-cream',
        price: product.price || 0,
        image: product.image || '',
        inStock: product.inStock !== false,
        featured: product.featured || false,
        allergens: product.allergens || [],
        preparationTime: product.preparationTime || 10,
        sizes: product.sizes || [],
        customizations: product.customizations || [],
        modifierGroupIds: product.modifierGroupIds || []
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', category: 'ice-cream', price: 0, image: '', inStock: true, featured: false, allergens: [], preparationTime: 10, sizes: [], customizations: [], modifierGroupIds: [] });
    }
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
    try { await adminAPI.updateProduct(product._id, { inStock: !product.inStock }); fetchProducts(); } catch (e) {}
  };

  const handleDuplicate = async (product: any) => {
    try {
      const { _id, createdAt, updatedAt, __v, ...rest } = product;
      await adminAPI.createProduct({ ...rest, name: `${product.name} (Copy)` });
      fetchProducts();
    } catch (e) {}
  };

  const toggleAllergen = (allergen: string) => {
    const current = form.allergens;
    setForm({ ...form, allergens: current.includes(allergen) ? current.filter(a => a !== allergen) : [...current, allergen] });
  };

  const toggleModifierGroup = (groupId: string) => {
    const current = form.modifierGroupIds;
    setForm({ ...form, modifierGroupIds: current.includes(groupId) ? current.filter(id => id !== groupId) : [...current, groupId] });
  };

  // Sizes
  const addSize = () => setForm({ ...form, sizes: [...form.sizes, { name: '', price: 0 }] });
  const updateSize = (i: number, field: string, value: any) => {
    const sizes = [...form.sizes];
    (sizes[i] as any)[field] = field === 'price' ? parseFloat(value) || 0 : value;
    setForm({ ...form, sizes });
  };
  const removeSize = (i: number) => setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) });

  // Customizations (item-specific options)
  const addCustomization = () => setForm({ ...form, customizations: [...form.customizations, { name: '', options: [], additionalPrice: 0 }] });
  const updateCustomization = (i: number, field: string, value: any) => {
    const customizations = [...form.customizations];
    (customizations[i] as any)[field] = value;
    setForm({ ...form, customizations });
  };
  const removeCustomization = (i: number) => setForm({ ...form, customizations: form.customizations.filter((_, idx) => idx !== i) });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>
          Menu Items ({filteredProducts.length})
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>
          Add Item
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small" placeholder="Search items..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }}
          sx={{ flex: 1 }}
        />
        <TextField select size="small" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((c: any) => <MenuItem key={c._id} value={c.slug}>{c.name}</MenuItem>)}
        </TextField>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead><TableRow sx={{ bgcolor: '#fcf5f6' }}>
            <TableCell></TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell><TableCell>Allergens</TableCell><TableCell>Stock</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filteredProducts.map((p: any) => (
              <TableRow key={p._id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                <TableCell sx={{ width: 50 }}>
                  {p.image && <Box component="img" src={p.image} sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover' }} />}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{p.name}</Typography>
                  {p.featured && <Chip label="★" size="small" sx={{ ml: 0.5, fontSize: '0.6rem', height: 16, bgcolor: '#fff3e0' }} />}
                  {p.sizes?.length > 0 && <Chip label={`${p.sizes.length} sizes`} size="small" sx={{ ml: 0.5, fontSize: '0.6rem', height: 16 }} variant="outlined" />}
                </TableCell>
                <TableCell><Typography sx={{ fontSize: '0.8rem' }}>{p.category}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>£{p.price?.toFixed(2)}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                    {(p.allergens || []).map((a: string) => <Chip key={a} label={a} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />)}
                  </Box>
                </TableCell>
                <TableCell><Switch checked={p.inStock} size="small" onChange={() => handleToggleStock(p)} color="success" /></TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(p)} title="Edit"><Edit sx={{ fontSize: 16 }} /></IconButton>
                  <IconButton size="small" onClick={() => handleDuplicate(p)} title="Duplicate"><ContentCopy sx={{ fontSize: 16 }} /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(p._id)} title="Delete"><Delete sx={{ fontSize: 16 }} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog - Tabbed */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          {editing ? `Edit: ${form.name}` : 'Add New Item'}
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={dialogTab} onChange={(_, v) => setDialogTab(v)}>
            <Tab label="Basic Info" sx={{ textTransform: 'none' }} />
            <Tab label="Sizes & Options" sx={{ textTransform: 'none' }} />
            <Tab label="Modifiers" sx={{ textTransform: 'none' }} />
            <Tab label="Allergens & Info" sx={{ textTransform: 'none' }} />
          </Tabs>
        </Box>

        <DialogContent sx={{ minHeight: 350 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Tab 0: Basic Info */}
          {dialogTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
              <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} fullWidth />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} sx={{ flex: 1 }}>
                  {categories.map((c: any) => <MenuItem key={c._id} value={c.slug}>{c.name}</MenuItem>)}
                </TextField>
                <TextField label="Base Price (£)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} sx={{ width: 150 }} />
              </Box>
              <TextField label="Image Path" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/images/products/Category/Name.jpg" helperText="Path to product image in public/images/products/" />
              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControlLabel control={<Switch checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />} label="In Stock" />
                <FormControlLabel control={<Switch checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />} label="Featured on Homepage" />
              </Box>
            </Box>
          )}

          {/* Tab 1: Sizes & Options */}
          {dialogTab === 1 && (
            <Box sx={{ mt: 1 }}>
              {/* Sizes */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500 }}>Sizes / Variations</Typography>
                    <Typography variant="body2" color="text.secondary">Add different sizes with different prices (e.g. Regular/Large, Slice/Whole)</Typography>
                  </Box>
                  <Button size="small" startIcon={<Add />} onClick={addSize} sx={{ textTransform: 'none' }}>Add Size</Button>
                </Box>
                {form.sizes.map((size, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" label="Size Name" placeholder="e.g. Regular, Large, Slice" value={size.name} onChange={(e) => updateSize(i, 'name', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" label="Price (£)" type="number" value={size.price} onChange={(e) => updateSize(i, 'price', e.target.value)} sx={{ width: 120 }} />
                    <IconButton size="small" color="error" onClick={() => removeSize(i)}><Delete sx={{ fontSize: 18 }} /></IconButton>
                  </Box>
                ))}
                {form.sizes.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No sizes — item will show base price only</Typography>}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Item-specific customizations */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 500 }}>Item-Specific Options</Typography>
                    <Typography variant="body2" color="text.secondary">Custom choices only for this item (e.g. "Base: Waffle/Crepe", "Drizzle: Nutella/Biscoff")</Typography>
                  </Box>
                  <Button size="small" startIcon={<Add />} onClick={addCustomization} sx={{ textTransform: 'none' }}>Add Option</Button>
                </Box>
                {form.customizations.map((custom, i) => (
                  <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField size="small" label="Option Name" placeholder="e.g. Base, Drizzle, Milk Type" value={custom.name} onChange={(e) => updateCustomization(i, 'name', e.target.value)} sx={{ flex: 1 }} />
                      <TextField size="small" label="Extra £" type="number" value={custom.additionalPrice} onChange={(e) => updateCustomization(i, 'additionalPrice', parseFloat(e.target.value) || 0)} sx={{ width: 100 }} />
                      <IconButton size="small" color="error" onClick={() => removeCustomization(i)}><Delete sx={{ fontSize: 18 }} /></IconButton>
                    </Box>
                    <TextField
                      size="small" fullWidth
                      label="Options (comma separated)"
                      placeholder="e.g. Waffle, Crepe, Cookie Dough"
                      value={(custom.options || []).join(', ')}
                      onChange={(e) => updateCustomization(i, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    />
                  </Paper>
                ))}
                {form.customizations.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No item-specific options</Typography>}
              </Box>
            </Box>
          )}

          {/* Tab 2: Modifiers (link shared modifier groups) */}
          {dialogTab === 2 && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Link Modifier Groups</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select which modifier groups apply to this item. Customers will see these as add-on options (Extra Sauce, Extra Toppings, etc.)
              </Typography>

              {modifierGroups.length === 0 ? (
                <Alert severity="info">No modifier groups created yet. Go to the Modifiers tab to create some.</Alert>
              ) : (
                <FormGroup>
                  {modifierGroups.map((group: any) => (
                    <Paper key={group._id} sx={{ p: 2, mb: 1.5, border: form.modifierGroupIds.includes(group._id) ? '2px solid #b03160' : '1px solid #e0e0e0', cursor: 'pointer' }} onClick={() => toggleModifierGroup(group._id)}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox checked={form.modifierGroupIds.includes(group._id)} size="small" sx={{ p: 0 }} />
                            <Typography sx={{ fontWeight: 500 }}>{group.name}</Typography>
                            {group.isRequired && <Chip label="Required" size="small" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>{group.description}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">Max {group.maxSelection}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, ml: 3.5 }}>
                        {group.modifiers?.slice(0, 6).map((m: any, i: number) => (
                          <Chip key={i} label={`${m.name}${m.price > 0 ? ` +£${m.price.toFixed(2)}` : ''}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                        ))}
                        {group.modifiers?.length > 6 && <Chip label={`+${group.modifiers.length - 6} more`} size="small" sx={{ fontSize: '0.65rem' }} />}
                      </Box>
                    </Paper>
                  ))}
                </FormGroup>
              )}
            </Box>
          )}

          {/* Tab 3: Allergens & Info */}
          {dialogTab === 3 && (
            <Box sx={{ mt: 1 }}>
              {/* Allergens */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 500, mb: 1 }}>Allergens</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Select all allergens present in this item (UK food law requirement)</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {ALLERGEN_OPTIONS.map(allergen => (
                    <Chip
                      key={allergen}
                      label={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      variant={form.allergens.includes(allergen) ? 'filled' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: form.allergens.includes(allergen) ? '#b03160' : 'transparent',
                        color: form.allergens.includes(allergen) ? 'white' : '#333',
                        borderColor: '#d4859a',
                        '&:hover': { bgcolor: form.allergens.includes(allergen) ? '#9e3a58' : '#fcf5f6' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Preparation Time */}
              <Box>
                <Typography sx={{ fontWeight: 500, mb: 1 }}>Preparation Time</Typography>
                <TextField
                  type="number"
                  value={form.preparationTime}
                  onChange={(e) => setForm({ ...form, preparationTime: parseInt(e.target.value) || 5 })}
                  InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                  size="small"
                  sx={{ width: 200 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#b03160', textTransform: 'none', '&:hover': { bgcolor: '#9e3a58' } }}>
            {editing ? 'Save Changes' : 'Create Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminItemsCRUD;
