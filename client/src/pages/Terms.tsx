import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SEO from '../components/SEO';

const Terms: React.FC = () => (
  <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 6 }}>
    <SEO title="Terms & Conditions" />
    <Container maxWidth="md">
      <Typography variant="h3" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 4 }}>Terms & Conditions</Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>1. Orders</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        All orders are subject to availability. We reserve the right to refuse or cancel orders. Prices are in GBP and include VAT where applicable. Orders can be cancelled within 5 minutes of placement.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>2. Delivery</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        We deliver within a 5-mile radius of Broxburn. Delivery times are estimates and not guaranteed. A delivery fee applies based on distance. Collection is free from 60 East Main Street, Broxburn.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>3. Allergens</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        Our products may contain allergens including nuts, dairy, gluten, eggs, and soya. All allergen information is provided on a best-efforts basis. If you have severe allergies, please contact us before ordering.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>4. Refunds</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        If you are unsatisfied with your order, please contact us within 24 hours. Refunds are issued at our discretion and may be full or partial depending on the issue.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>5. Loyalty Programme</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        Points are earned on qualifying orders. We reserve the right to modify the loyalty programme at any time. Points have no cash value and cannot be transferred.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>6. Contact</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        Creamy Chills, 60 East Main Street, Broxburn, EH52 5EE
      </Typography>
    </Container>
  </Box>
);

export default Terms;
