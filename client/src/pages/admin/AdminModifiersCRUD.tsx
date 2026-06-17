import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Chip, Divider } from '@mui/material';
import { Add, Edit, Delete, ContentCopy } from '@mui/icons-material';
import { modifiersAPI, productsAPI } from '../../services/api';

const AdminModifiersCRUD: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', description: '', isRequired: false, minSelection: 0, maxSelection: 3, isActive: true,
    modifiers: [] as Array<{ name: string; price: number }>
  });

  useEffect(() => { fetch(); fetchUsage(); }, []);
  const fetch = async () => { try { const res = await modifiersAPI.getAll(); setGroups(res.data); } catch (e) {} };

  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const fetchUsage = async () => {
    try {
      const res = await productsAPI.getAll();
      const counts: Record<string, number> = {};
      (res.data.products || []).forEach((p: any) => {
        (p.modifierGroupIds || []).forEach((id: string) => { counts[id] = (counts[id] || 0) + 1; });
      });
      setUsageCounts(counts);
    } catch (e) {}
  };

  const handleDuplicate = async (group: any) => {
    try {
      const { _id, createdAt, updatedAt, __v, ...rest } = group;
      await modifiersAPI.create({ ...rest, name: `${group.name} (Copy)`, modifiers: group.modifiers.map((m: any) => ({ name: m.name, price: m.price, groupName: `${group.name} (Copy)` })) });
      fetch();
    } catch (e) {}
  };

  const handleOpen = (group?: any) => {
    if (group) {
      setEditing(group);
      setForm({
        name: group.name, description: group.description || '', isRequired: group.isRequired,
        minSelection: group.minSelection || 0, maxSelection: group.maxSelection || 3,
        isActive: group.isActive !== false,
        modifiers: (group.modifiers || []).map((m: any) => ({ name: m.name, price: m.price || 0 }))
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', isRequired: false, minSelection: 0, maxSelection: 3, isActive: true, modifiers: [] });
    }
    setDialog(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, modifiers: form.modifiers.map((m, i) => ({ ...m, groupName: form.name, sortOrder: i })) };
      if (editing) { await modifiersAPI.update(editing._id, data); }
      else { await modifiersAPI.create(data); }
      setDialog(false); fetch();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this modifier group? This will remove it from all linked items.')) return;
    try { await modifiersAPI.delete(id); fetch(); } catch (e) {}
  };

  const addModifier = () => setForm({ ...form, modifiers: [...form.modifiers, { name: '', price: 0 }] });
  const updateModifier = (i: number, field: string, value: any) => {
    const mods = [...form.modifiers];
    (mods[i] as any)[field] = field === 'price' ? parseFloat(value) || 0 : value;
    setForm({ ...form, modifiers: mods });
  };
  const removeModifier = (i: number) => setForm({ ...form, modifiers: form.modifiers.filter((_, idx) => idx !== i) });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160' }}>Modifier Groups ({groups.length})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Add Group</Button>
      </Box>

      {groups.map((g: any) => (
        <Paper key={g._id} sx={{ p: 2.5, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: '1.05rem' }}>{g.name}</Typography>
                {g.isRequired && <Chip label="Required" size="small" color="error" sx={{ fontSize: '0.65rem', height: 20 }} />}
                <Chip label={`Max ${g.maxSelection}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">{g.description} • Used by {usageCounts[g._id] || 0} items</Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={() => handleOpen(g)}><Edit sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small" onClick={() => handleDuplicate(g)} title="Duplicate"><ContentCopy sx={{ fontSize: 18 }} /></IconButton>
              <IconButton size="small" onClick={() => handleDelete(g._id)}><Delete sx={{ fontSize: 18 }} /></IconButton>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {g.modifiers?.map((m: any, i: number) => (
              <Chip key={i} label={`${m.name}${m.price > 0 ? ` +£${m.price.toFixed(2)}` : ''}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
            ))}
          </Box>
        </Paper>
      ))}

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? `Edit: ${form.name}` : 'Add Modifier Group'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Group Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Extra Sauce, Toppings, Size" required />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to customers" />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField label="Min Selection" type="number" value={form.minSelection} onChange={(e) => setForm({ ...form, minSelection: parseInt(e.target.value) || 0 })} sx={{ width: 130 }} />
              <TextField label="Max Selection" type="number" value={form.maxSelection} onChange={(e) => setForm({ ...form, maxSelection: parseInt(e.target.value) || 1 })} sx={{ width: 130 }} />
              <FormControlLabel control={<Switch checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} />} label="Required" />
              <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Active" />
            </Box>

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 500 }}>Modifiers ({form.modifiers.length})</Typography>
                <Button size="small" startIcon={<Add />} onClick={addModifier} sx={{ textTransform: 'none' }}>Add Modifier</Button>
              </Box>
              {form.modifiers.map((mod, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField size="small" label="Name" placeholder="e.g. Nutella, Vanilla Scoop" value={mod.name} onChange={(e) => updateModifier(i, 'name', e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Extra £" type="number" value={mod.price} onChange={(e) => updateModifier(i, 'price', e.target.value)} sx={{ width: 100 }} />
                  <IconButton size="small" color="error" onClick={() => removeModifier(i)}><Delete sx={{ fontSize: 16 }} /></IconButton>
                </Box>
              ))}
              {form.modifiers.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No modifiers yet — click "Add Modifier" above</Typography>}
            </Box>
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

export default AdminModifiersCRUD;
