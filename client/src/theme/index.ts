import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#b03160',
      light: '#c66481',
      dark: '#9e3a58',
    },
    secondary: {
      main: '#d4859a',
      light: '#e1a5b4',
      dark: '#b03160',
    },
    background: {
      default: '#fff8f4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#696969',
    },
    info: {
      main: '#fcf5f6',
    },
    success: {
      main: '#98FB98',
    },
    warning: {
      main: '#FFB347',
    },
  },
  typography: {
    fontFamily: '"PT Serif", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '2.8rem',
      color: '#b03160',
    },
    h2: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '2.2rem',
      color: '#b03160',
    },
    h3: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '1.8rem',
      color: '#b03160',
    },
    h4: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      fontSize: '1.5rem',
      color: '#b03160',
    },
    button: {
      textTransform: 'none',
      fontWeight: 400,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 15,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          padding: '12px 28px',
          fontSize: '1rem',
          fontWeight: 400,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#b03160',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#9e3a58',
          },
        },
        containedSecondary: {
          backgroundColor: '#ffffff',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#ebebeb',
          },
        },
        outlinedPrimary: {
          borderColor: '#b03160',
          color: '#b03160',
          '&:hover': {
            borderColor: '#9e3a58',
            backgroundColor: 'rgba(176, 49, 96, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(176, 49, 96, 0.1)',
          transition: 'all 0.3s ease-in-out',
          border: '1px solid transparent',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 12px rgba(176, 49, 96, 0.15)',
            border: '1px solid #d4859a',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#b03160',
          boxShadow: '0 2px 8px rgba(176, 49, 96, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;