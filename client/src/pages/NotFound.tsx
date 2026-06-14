import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: '5rem', mb: 1 }}>🍦</Typography>
        <Typography variant="h3" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', mb: 4 }}>
          Looks like this page melted away. Let's get you back to something delicious.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', px: 4, py: 1.5, boxShadow: 'none' }}
        >
          Back to Home
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound;
