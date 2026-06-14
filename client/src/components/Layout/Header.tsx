import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Home,
  Restaurant,
  AccountCircle,
  Close,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  const { user, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Menu', path: '/products', icon: <Restaurant /> },
  ];

  const cartItemCount = cartState.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2, color: '#2c3e50' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              mr: { md: 4 },
            }}
          >
            <img
              src="/images/creamychills.jpeg"
              alt="Creamy Chills Logo"
              style={{
                height: '60px',
                width: 'auto',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      color: '#e74c3c',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Cart Button */}
            <IconButton
              component={Link}
              to="/cart"
              sx={{
                color: '#2c3e50',
                '&:hover': {
                  bgcolor: '#f8f9fa',
                  color: '#e74c3c',
                },
              }}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* User Menu */}
            {user ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    color: '#2c3e50',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      color: '#e74c3c',
                    },
                  }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      minWidth: 180,
                    },
                  }}
                >
                  <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose} component={Link} to="/orders">
                    My Orders
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: '#e74c3c',
                      color: '#e74c3c',
                      '&:hover': {
                        borderColor: '#c0392b',
                        bgcolor: '#e74c3c',
                        color: 'white',
                      },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      bgcolor: '#e74c3c',
                      '&:hover': { bgcolor: '#c0392b' },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#f8f9fa',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img
            src="/images/creamychills.jpeg"
            alt="Creamy Chills Logo"
            style={{
              height: '50px',
              width: 'auto',
              borderRadius: '6px',
            }}
          />
          <IconButton onClick={toggleMobileMenu}>
            <Close />
          </IconButton>
        </Box>
        
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              onClick={toggleMobileMenu}
              sx={{
                '&:hover': {
                  bgcolor: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#e74c3c' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: '#2c3e50',
                }}
              />
            </ListItem>
          ))}
          
          {!user && (
            <>
              <ListItem
                component={Link}
                to="/login"
                onClick={toggleMobileMenu}
                sx={{ '&:hover': { bgcolor: 'white' } }}
              >
                <ListItemIcon sx={{ color: '#e74c3c' }}>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText 
                  primary="Login"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: '#2c3e50',
                  }}
                />
              </ListItem>
              <ListItem
                component={Link}
                to="/register"
                onClick={toggleMobileMenu}
                sx={{ '&:hover': { bgcolor: 'white' } }}
              >
                <ListItemIcon sx={{ color: '#e74c3c' }}>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText 
                  primary="Sign Up"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: '#2c3e50',
                  }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Header;