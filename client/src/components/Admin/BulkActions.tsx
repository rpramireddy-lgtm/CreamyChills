import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Typography, Checkbox, Alert } from '@mui/material';
import { adminAPI, categoriesAPI } from '../../services/api';

interface Props {
  products: any[];
  categories: any[];
  onComplete: () => void;
}

const BulkActions: React.FC<Props> = ({ products, categories, onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState('');
  const [dialog, setDialog] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkPriceType, setBulkPriceType] = useState('percentage');
  const [bulkPriceValue, setBulkPriceValue] = useState(0);
  const [result, setResult] = useState('');

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === products.length) setSelected([]);
    else setSelected(products.map(p => p._id));
  };

  const handleExecute = async () => {
    try {
      if (action === 'stock-on') {
        await Promise.all(selected.map(id => adminAPI.updateProduct(id, { inStock: true })));
        setResult(`${selected.length} items marked in stock`);
      } else if (action === 'stock-off') {
        await Promise.all(selected.map(id => adminAPI.updateProduct(id, { inStock: false })));
        setResult(`${selected.length} items marked sold out`);
      } else if (action === 'category') {
        await Promise.all(selected.map(id => adminAPI.updateProduct(id, { category: bulkCategory })));
        setResult(`${selected.length} items moved to category`);
      } else if (action === 'price') {
        for (const id of selected) {
          const product = products.find(p => p._id === id);
          if (!product) continue;
          let newPrice = product.price;
          if (bulkPriceType === 'percentage') newPrice = product.price * (1 + bulkPriceValue / 100);
          else newPrice = product.price + bulkPriceValue;
          await adminAPI.updateProduct(id, { price: Math.round(newPrice * 100) / 100 });
        }
        setResult(`${selected.length} items price updated`);
      } else if (action === 'featured-on') {
        await Promise.all(selected.map(id => adminAPI.updateProduct(id, { featured: true })));
        setResult(`${selected.length} items featured`);
      } else if (action === 'featured-off') {
        await Promise.all(selected.map(id => adminAPI.updateProduct(id, { featured: false })));
        setResult(`${selected.length} items unfeatured`);
      } else if (action === 'delete') {
        if (!window.confirm(`Delete ${selected.length} items permanently?`)) return;
        await Promise.all(selected.map(id => adminAPI.deleteProduct(id)));
        setResult(`${selected.length} items deleted`);
      }
      setDialog(false);
      setSelected([]);
      onComplete();
    } catch (e) {
      setResult('Action failed');
    }
  };

  return (
    <Box>
      {/* Selection controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button size="small" onClick={selectAll} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>
          {selected.length === products.length ? 'Deselect All' : `Select All (${products.length})`}
        </Button>
        {selected.length > 0 && (
          <>
            <Typography sx={{ fontSize: '0.85rem', color: '#b03160', fontWeight: 500 }}>{selected.length} selected</Typography>
            <Button size="small" variant="outlined" onClick={() => { setAction('stock-on'); setDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Mark In Stock</Button>
            <Button size="small" variant="outlined" onClick={() => { setAction('stock-off'); setDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Mark Sold Out</Button>
            <Button size="small" variant="outlined" onClick={() => { setAction('category'); setDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Change Category</Button>
            <Button size="small" variant="outlined" onClick={() => { setAction('price'); setDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Adjust Price</Button>
            <Button size="small" variant="outlined" onClick={() => { setAction('featured-on'); setDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Feature</Button>
            <Button size="small" variant="outlined" color="error" onClick={() => { setAction('delete'); setDialog(true); }} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Delete</Button>
          </>
        )}
      </Box>

      {result && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setResult('')}>{result}</Alert>}

      {/* Checkboxes rendered in parent table - expose toggle function */}
      {products.map(p => (
        <input key={p._id} type="hidden" data-id={p._id} data-selected={selected.includes(p._id)} />
      ))}

      {/* Confirmation Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Bulk Action: {action}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Apply to {selected.length} items</Typography>
          {action === 'category' && (
            <TextField select fullWidth label="New Category" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)}>
              {categories.map((c: any) => <MenuItem key={c._id} value={c.slug}>{c.name}</MenuItem>)}
            </TextField>
          )}
          {action === 'price' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select label="Type" value={bulkPriceType} onChange={(e) => setBulkPriceType(e.target.value)} sx={{ width: 150 }}>
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="fixed">Fixed (£)</MenuItem>
              </TextField>
              <TextField label={bulkPriceType === 'percentage' ? '% change' : '£ change'} type="number" value={bulkPriceValue} onChange={(e) => setBulkPriceValue(parseFloat(e.target.value))} helperText="Use negative to decrease" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleExecute} sx={{ bgcolor: '#b03160', textTransform: 'none' }}>Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { BulkActions };
export const useBulkSelection = (products: any[]) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelected(prev => prev.length === products.length ? [] : products.map(p => p._id));
  const isSelected = (id: string) => selected.includes(id);
  return { selected, toggle, selectAll, isSelected, clear: () => setSelected([]) };
};

export default BulkActions;
