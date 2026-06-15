import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      bgcolor: 'white', borderTop: '1px solid #e0e0e0', p: 2,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center', justifyContent: 'center', gap: 2
    }}>
      <Typography sx={{ fontFamily: '"PT Serif"', fontSize: '0.85rem', color: '#555', textAlign: 'center' }}>
        We use cookies to improve your experience. By continuing, you agree to our{' '}
        <a href="/privacy" style={{ color: '#b03160' }}>Privacy Policy</a>.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button size="small" onClick={handleDecline} sx={{ textTransform: 'none', color: '#666' }}>Decline</Button>
        <Button size="small" variant="contained" onClick={handleAccept} sx={{ bgcolor: '#b03160', textTransform: 'none', borderRadius: '100px', '&:hover': { bgcolor: '#9e3a58' } }}>Accept</Button>
      </Box>
    </Box>
  );
};

export default CookieConsent;
