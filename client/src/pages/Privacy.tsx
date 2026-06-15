import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SEO from '../components/SEO';

const Privacy: React.FC = () => (
  <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', py: 6 }}>
    <SEO title="Privacy Policy" />
    <Container maxWidth="md">
      <Typography variant="h3" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 4 }}>Privacy Policy</Typography>
      
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>1. Information We Collect</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        When you place an order, we collect your name, email address, phone number, and delivery address. Payment information is processed securely by Square and we do not store card details.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>2. How We Use Your Information</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        We use your information to process orders, send order confirmations, provide delivery updates, and improve our services. We may send promotional emails if you opt in.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>3. Data Storage & Security</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        Your data is stored securely on encrypted servers. We use industry-standard security measures including HTTPS, password hashing, and rate limiting.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>4. Cookies</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        We use essential cookies to keep you logged in and store your cart. Analytics cookies (Google Analytics) help us understand how you use our site. You can decline non-essential cookies.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>5. Your Rights</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        Under GDPR, you have the right to access, correct, or delete your personal data. Contact us at privacy@creamychills.com to exercise these rights.
      </Typography>

      <Typography variant="h5" sx={{ fontFamily: '"Poppins"', fontWeight: 500, mb: 2, mt: 4 }}>6. Contact</Typography>
      <Typography sx={{ fontFamily: '"PT Serif"', lineHeight: 1.8, color: '#333', mb: 3 }}>
        Creamy Chills, 60 East Main Street, Broxburn, EH52 5EE
      </Typography>
    </Container>
  </Box>
);

export default Privacy;
