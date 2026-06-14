import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state: cartState } = useCart();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Find Us', path: '/find-us' },
    { label: 'Track Order', path: '/profile' },
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: '#b03160', 
        boxShadow: '0 2px 8px rgba(176, 49, 96, 0.2)' 
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1.5,
            }}
          >
            <Typography
              sx={{
                color: 'white',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                letterSpacing: '-0.01em',
              }}
            >
              Creamy Chills
            </Typography>
          </Box>
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5, mr: 3 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{ 
                  color: 'white',
                  fontFamily: '"PT Serif", serif',
                  fontWeight: 400,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  px: 2,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    opacity: 0.8,
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#ffffff',
              color: '#000000',
              borderRadius: '100px',
              fontFamily: '"PT Serif", serif',
              fontWeight: 400,
              fontSize: '0.85rem',
              textTransform: 'none',
              px: 2.5,
              boxShadow: 'none',
              display: { xs: 'none', sm: 'flex' },
              '&:hover': { bgcolor: '#ebebeb', boxShadow: 'none' },
            }}
          >
            Order Now
          </Button>

          {user && (
            <>
              <IconButton onClick={handleProfileMenuOpen} sx={{ color: 'white' }}>
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  Profile
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                    Admin
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}

          <IconButton
            component={Link}
            to="/cart"
            sx={{ color: 'white' }}
          >
            <Badge 
              badgeContent={cartState.items.length} 
              sx={{ 
                '& .MuiBadge-badge': { 
                  bgcolor: 'white', 
                  color: '#b03160',
                  fontWeight: 600 
                } 
              }}
            >
              <ShoppingCart />
            </Badge>
          </IconButton>

          {isMobile && (
            <IconButton onClick={handleMobileMenuOpen} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                handleMobileMenuClose();
              }}
              sx={{ fontFamily: '"PT Serif", serif' }}
            >
              {item.label}
            </MenuItem>
          ))}
          {!user && (
            <MenuItem onClick={() => { navigate('/login'); handleMobileMenuClose(); }}>
              Login
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
