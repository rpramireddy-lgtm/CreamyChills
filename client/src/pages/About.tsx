import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#b03160', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, color: 'white', mb: 2 }}
          >
            About Us
          </Typography>
          <Typography sx={{ fontFamily: '"PT Serif", serif', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Handcrafted desserts in the heart of Broxburn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          sx={{ fontFamily: '"PT Serif", serif', fontSize: '1.15rem', lineHeight: 2, color: '#333', mb: 4 }}
        >
          Creamy Chills is a family-run dessert shop located on East Main Street, Broxburn. We specialise in premium ice cream, handcrafted waffles, loaded cookie dough, crepes, milkshakes, sundaes and so much more.
        </Typography>

        <Typography
          sx={{ fontFamily: '"PT Serif", serif', fontSize: '1.15rem', lineHeight: 2, color: '#333', mb: 4 }}
        >
          Every item on our menu is made fresh to order using only the finest ingredients. From our signature Belgian waffles drizzled with Nutella to our famous Dubai Chocolate Milkshake — we believe dessert should be an experience, not just a treat.
        </Typography>

        <Typography
          sx={{ fontFamily: '"PT Serif", serif', fontSize: '1.15rem', lineHeight: 2, color: '#333', mb: 6 }}
        >
          Whether you're popping in for a quick scoop or ordering for a celebration, we're here to make every visit special.
        </Typography>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#b03160',
              color: 'white',
              borderRadius: '100px',
              px: 5,
              py: 1.5,
              fontFamily: '"PT Serif", serif',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#9e3a58', boxShadow: 'none' },
            }}
          >
            View Our Menu
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
