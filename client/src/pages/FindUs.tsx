import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Phone, Email, AccessTime, LocationOn } from '@mui/icons-material';

const FindUs: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#b03160', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, color: 'white', mb: 2 }}
          >
            Find Us
          </Typography>
          <Typography sx={{ fontFamily: '"PT Serif", serif', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Visit us or order for collection
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6 }}>
          {/* Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
              <LocationOn sx={{ color: '#b03160', mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, mb: 0.5 }}>
                  Address
                </Typography>
                <Typography sx={{ fontFamily: '"PT Serif", serif', color: '#555', lineHeight: 1.6 }}>
                  60 East Main Street<br />
                  Broxburn<br />
                  EH52 5EE
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
              <AccessTime sx={{ color: '#b03160', mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, mb: 0.5 }}>
                  Opening Hours
                </Typography>
                <Typography sx={{ fontFamily: '"PT Serif", serif', color: '#555', lineHeight: 1.8 }}>
                  Monday – Thursday: 12pm – 10pm<br />
                  Friday – Saturday: 12pm – 11pm<br />
                  Sunday: 12pm – 10pm
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
              <Phone sx={{ color: '#b03160', mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, mb: 0.5 }}>
                  Contact
                </Typography>
                <Typography sx={{ fontFamily: '"PT Serif", serif', color: '#555' }}>
                  Call us for large orders and catering enquiries.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Map */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                height: 350,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e1a5b4',
              }}
            >
              <iframe
                title="Creamy Chills Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2232.5!2d-3.4655!3d55.9315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDU1JzUzLjQiTiAzwrAyNyc1NS44Ilc!5e0!3m2!1sen!2suk!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FindUs;
