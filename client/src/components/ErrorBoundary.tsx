import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ bgcolor: '#fff8f4', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>😰</Typography>
            <Typography variant="h4" sx={{ fontFamily: '"Poppins"', fontWeight: 500, color: '#b03160', mb: 2 }}>
              Something went wrong
            </Typography>
            <Typography sx={{ fontFamily: '"PT Serif"', color: '#666', mb: 4 }}>
              We're sorry, something unexpected happened. Please try refreshing the page.
            </Typography>
            <Button
              onClick={() => window.location.reload()}
              variant="contained"
              sx={{ bgcolor: '#b03160', '&:hover': { bgcolor: '#9e3a58' }, borderRadius: '100px', textTransform: 'none', fontFamily: '"PT Serif"', px: 4, boxShadow: 'none' }}
            >
              Refresh Page
            </Button>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
