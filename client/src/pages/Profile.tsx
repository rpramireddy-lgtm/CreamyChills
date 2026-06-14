import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Profile & Order History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Profile management and order history features will be implemented here.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Profile;