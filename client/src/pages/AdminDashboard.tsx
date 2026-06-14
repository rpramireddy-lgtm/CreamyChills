import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Business Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Admin dashboard with product management, order tracking, and analytics will be implemented here.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;