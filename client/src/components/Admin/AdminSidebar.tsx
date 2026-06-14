import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LibraryBooks as LibraryIcon,
  Store as StoreIcon,
  RoomService as ServiceIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Discount as DiscountIcon,
  Tune as TuneIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const [openItems, setOpenItems] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Items & Services',
      icon: <InventoryIcon />,
      path: null,
      children: [
        { title: 'Items', icon: <InventoryIcon />, path: '/admin/items' },
        { title: 'Item Library', icon: <LibraryIcon />, path: '/admin/item-library' },
        { title: 'Channel Listings', icon: <StoreIcon />, path: '/admin/channels' },
        { title: 'Service Library', icon: <ServiceIcon />, path: '/admin/services' },
        { title: 'Image Library', icon: <ImageIcon />, path: '/admin/images' },
        { title: 'Modifiers', icon: <AddIcon />, path: '/admin/modifiers' },
        { title: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
        { title: 'Discounts', icon: <DiscountIcon />, path: '/admin/discounts' },
        { title: 'Options', icon: <TuneIcon />, path: '/admin/options' }
      ]
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          bgcolor: '#fff8f4',
          borderRight: '1px solid #d4859a'
        }
      }}
    >
      <Box sx={{ p: 2, bgcolor: '#b03160' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Creamy Chills Admin
        </Typography>
      </Box>

      <List>
        {menuItems.map((section) => (
          <React.Fragment key={section.title}>
            <ListItemButton onClick={() => setOpenItems(!openItems)}>
              <ListItemIcon sx={{ color: '#b03160' }}>
                {section.icon}
              </ListItemIcon>
              <ListItemText 
                primary={section.title}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              {openItems ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            
            <Collapse in={openItems} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.children?.map((item) => (
                  <ListItemButton
                    key={item.path}
                    sx={{ 
                      pl: 4,
                      bgcolor: location.pathname === item.path ? '#fcf5f6' : 'transparent',
                      borderLeft: location.pathname === item.path ? '3px solid #b03160' : 'none',
                      '&:hover': { bgcolor: '#fcf5f6' }
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon sx={{ color: '#b03160', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;
