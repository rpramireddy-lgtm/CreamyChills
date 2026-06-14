import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontFamily: '"Poppins"', fontWeight: 500, fontSize: '1.8rem', color: '#b03160' }}>
            Creamy Chills
          </Typography>
          <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', mt: 1 }}>
            Sign in to your account
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" name="email" type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth label="Password" name="password" type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required sx={{ mb: 3 }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', py: 1.5, boxShadow: 'none' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 3, fontFamily: '"PT Serif"', fontSize: '0.9rem', color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#b03160', textDecoration: 'none' }}>Create one</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
