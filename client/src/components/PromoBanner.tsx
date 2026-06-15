import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Typography, Box, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const PromoBanner: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('promoSeen');
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 3000); // Show after 3s
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('promoSeen', 'true');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Close />
        </IconButton>
        <Box sx={{ bgcolor: '#b03160', p: 4, textAlign: 'center', color: 'white' }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🍦</Typography>
          <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.4rem', mb: 1 }}>
            Welcome to Creamy Chills!
          </Typography>
          <Typography sx={{ fontFamily: '"PT Serif"', fontSize: '1rem', opacity: 0.9, mb: 2 }}>
            Get 10% off your first order
          </Typography>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 600, fontSize: '1.5rem', letterSpacing: 2 }}>
              WELCOME10
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{ bgcolor: 'white', color: '#b03160', borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', py: 1.5, '&:hover': { bgcolor: '#f0d6e0' }, boxShadow: 'none' }}
          >
            Start Ordering
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PromoBanner;
