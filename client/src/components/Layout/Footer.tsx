import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#b03160', color: 'white', py: 5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
          {/* Brand */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.3rem', mb: 1 }}>
              Creamy Chills
            </Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6 }}>
              Premium handcrafted desserts in Broxburn.
            </Typography>
          </Box>

          {/* Links */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.9rem', mb: 1.5 }}>Menu</Typography>
            {[
              { label: 'Order Online', path: '/products' },
              { label: 'About Us', path: '/about' },
              { label: 'Find Us', path: '/find-us' },
              { label: 'My Account', path: '/profile' },
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms & Conditions', path: '/terms' },
            ].map(link => (
              <Typography key={link.path} component={Link} to={link.path} sx={{ display: 'block', fontFamily: '"PT Serif"', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', mb: 0.5, '&:hover': { color: 'white' } }}>
                {link.label}
              </Typography>
            ))}
          </Box>

          {/* Hours */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.9rem', mb: 1.5 }}>Opening Hours</Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.8 }}>
              Mon – Thu: 12pm – 10pm<br />
              Fri – Sat: 12pm – 11pm<br />
              Sun: 12pm – 10pm
            </Typography>
          </Box>

          {/* Contact */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.9rem', mb: 1.5 }}>Visit Us</Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.8 }}>
              60 East Main Street<br />
              Broxburn, EH52 5EE
            </Typography>
            {/* Social */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
              <Typography component="a" href="https://www.instagram.com/creamychills" target="_blank" rel="noopener" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'white' } }}>
                Instagram
              </Typography>
              <Typography component="a" href="https://www.facebook.com/creamychills" target="_blank" rel="noopener" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'white' } }}>
                Facebook
              </Typography>
              <Typography component="a" href="https://www.tiktok.com/@creamychills" target="_blank" rel="noopener" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'white' } }}>
                TikTok
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', pt: 3, textAlign: 'center' }}>
          <Typography sx={{ fontFamily: '"PT Serif"', fontSize: '0.8rem', opacity: 0.5 }}>
            © {new Date().getFullYear()} Creamy Chills. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
