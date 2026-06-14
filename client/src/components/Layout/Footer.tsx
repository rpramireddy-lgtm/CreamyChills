import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'grey.900',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Creamy Chills
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your favorite dessert destination. Fresh, delicious, and made with love.
            </Typography>
            <Box>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link component={RouterLink} to="/products" color="inherit" underline="hover">
                Products
              </Link>
              <Link component={RouterLink} to="/cart" color="inherit" underline="hover">
                Cart
              </Link>
            </Box>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/products" state={{ category: 'ice-cream' }} color="inherit" underline="hover">
                Ice Cream
              </Link>
              <Link component={RouterLink} to="/products" state={{ category: 'waffle' }} color="inherit" underline="hover">
                Waffles
              </Link>
              <Link component={RouterLink} to="/products" state={{ category: 'cake' }} color="inherit" underline="hover">
                Cakes
              </Link>
              <Link component={RouterLink} to="/products" state={{ category: 'milkshake' }} color="inherit" underline="hover">
                Milkshakes
              </Link>
            </Box>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📍 <Link 
                href="https://maps.google.com/?q=60+East+Main+Street,+Broxburn,+West+Lothian,+EH52+5EG" 
                target="_blank" 
                rel="noopener noreferrer"
                color="inherit" 
                underline="hover"
              >
                60 East Main Street, Broxburn, West Lothian, EH52 5EG
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📞 (555) 123-4567
            </Typography>
            <Typography variant="body2">
              ✉️ hello@creamychills.com
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" textAlign="center">
            © 2025 Creamy Chills. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;