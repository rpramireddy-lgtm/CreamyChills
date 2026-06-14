import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#b03160',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, formData);
      } else {
        await axios.post('/api/categories', formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#b03160',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#b03160',
      isActive: true,
      sortOrder: 0
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, color: '#b03160' }}>
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' } }}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#fcf5f6' }}>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Sort Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category: any) => (
              <TableRow key={category._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: category.color
                      }}
                    />
                    {category.name}
                  </Box>
                </TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.sortOrder}</TableCell>
                <TableCell>
                  {category.isActive ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(category)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category._id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Slug"
              fullWidth
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Color"
              type="color"
              fullWidth
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <TextField
              label="Sort Order"
              type="number"
              fullWidth
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#b03160' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCategories;
