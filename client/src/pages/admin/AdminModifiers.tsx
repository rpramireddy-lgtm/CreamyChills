import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminModifiers = () => {
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    modifiers: [],
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchModifierGroups();
  }, []);

  const fetchModifierGroups = async () => {
    try {
      const response = await axios.get('/api/modifiers');
      setModifierGroups(response.data);
    } catch (error) {
      console.error('Error fetching modifier groups:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingGroup) {
        await axios.put(`/api/modifiers/${editingGroup._id}`, formData);
      } else {
        await axios.post('/api/modifiers', formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchModifierGroups();
    } catch (error) {
      console.error('Error saving modifier group:', error);
    }
  };

  const handleEdit = (group: any) => {
    setEditingGroup(group);
    setFormData(group);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this modifier group?')) {
      try {
        await axios.delete(`/api/modifiers/${id}`);
        fetchModifierGroups();
      } catch (error) {
        console.error('Error deleting modifier group:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      modifiers: [],
      isActive: true,
      sortOrder: 0
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, color: '#b03160' }}>
          Modifiers
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
          Add Modifier Group
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {modifierGroups.map((group: any) => (
          <Card key={group._id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {group.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {group.description}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    {group.isRequired && (
                      <Chip label="Required" size="small" color="error" />
                    )}
                    <Chip 
                      label={`Max: ${group.maxSelection}`} 
                      size="small" 
                    />
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={() => handleEdit(group)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(group._id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <List dense>
                {group.modifiers?.map((modifier: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={modifier.name}
                      secondary={modifier.price > 0 ? `+£${modifier.price.toFixed(2)}` : 'Free'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGroup ? 'Edit Modifier Group' : 'Add Modifier Group'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Group Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Selection"
                type="number"
                value={formData.minSelection}
                onChange={(e) => setFormData({ ...formData, minSelection: parseInt(e.target.value) })}
              />
              <TextField
                label="Max Selection"
                type="number"
                value={formData.maxSelection}
                onChange={(e) => setFormData({ ...formData, maxSelection: parseInt(e.target.value) })}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                />
              }
              label="Required"
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

export default AdminModifiers;
