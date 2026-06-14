import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Archive as ArchiveIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axios from 'axios';

const AdminItems = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [selectedCategory, selectedChannel, searchQuery]);

  const fetchItems = async () => {
    try {
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedChannel !== 'all') params.channel = selectedChannel;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get('/api/items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDuplicate = async (itemId: string) => {
    try {
      await axios.post(`/api/items/${itemId}/duplicate`);
      fetchItems();
    } catch (error) {
      console.error('Error duplicating item:', error);
    }
  };

  const handleArchive = async (itemId: string) => {
    try {
      await axios.put(`/api/items/${itemId}/archive`);
      fetchItems();
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleToggleSoldOut = async (itemId: string) => {
    try {
      await axios.put(`/api/items/${itemId}/soldout`);
      fetchItems();
    } catch (error) {
      console.error('Error toggling sold out:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, color: '#b03160' }}>
          Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' } }}
        >
          Add Item
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search items..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#b03160' }} />
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <TextField
          select
          size="small"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((cat: any) => (
            <MenuItem key={cat._id} value={cat._id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All Channels</MenuItem>
          <MenuItem value="website">Website</MenuItem>
          <MenuItem value="pos">POS</MenuItem>
          <MenuItem value="justEat">Just Eat</MenuItem>
          <MenuItem value="uberEats">Uber Eats</MenuItem>
          <MenuItem value="deliveroo">Deliveroo</MenuItem>
          <MenuItem value="scoffable">Scoffable</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={2}>
        {items.map((item: any) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
            <Card sx={{ 
              height: '100%',
              '&:hover': { boxShadow: 3 },
              opacity: item.isSoldOut ? 0.6 : 1
            }}>
              {item.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                />
              )}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, item)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.description?.substring(0, 60)}...
                </Typography>

                <Typography variant="h6" sx={{ color: '#b03160', mb: 1 }}>
                  £{item.basePrice?.toFixed(2)}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {item.isSoldOut && (
                    <Chip label="Sold Out" size="small" color="error" />
                  )}
                  {!item.isActive && (
                    <Chip label="Inactive" size="small" />
                  )}
                  {item.isFeatured && (
                    <Chip label="Featured" size="small" color="primary" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDuplicate(selectedItem?._id);
          handleMenuClose();
        }}>
          <CopyIcon sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleSoldOut(selectedItem?._id);
          handleMenuClose();
        }}>
          Mark as {selectedItem?.isSoldOut ? 'Available' : 'Sold Out'}
        </MenuItem>
        <MenuItem onClick={() => {
          handleArchive(selectedItem?._id);
          handleMenuClose();
        }}>
          <ArchiveIcon sx={{ mr: 1 }} /> Archive
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminItems;
