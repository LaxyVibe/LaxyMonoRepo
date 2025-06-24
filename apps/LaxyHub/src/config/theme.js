// Common color palette and theme configuration for LaxyHub
import { createTheme } from '@mui/material/styles';

// Color palette based on project requirements
export const colors = {
  primary: {
    50: '#f0f9fa',
    100: '#a39ddd', 
    200: '#5fbcc4', // Primary/200 color for borders
    300: '#46b2bb',
    400: '#328188',
    500: '#215458', // Main primary color
    600: '#133033',
  },
  secondary: {
    100: '#fc6dcd',
    200: '#f9ad9b',
    300: '#f57c5f',
    400: '#f24b24',
    500: '#cb310c',
    600: '#a82209',
  },
  third: {
    100: '#fd4ee8',
    200: '#fd87ac',
    300: '#f2ba6f',
    400: '#ed9d33',
    500: '#cd8d12',
    600: '#90580d',
  },
  // Common UI colors
  background: {
    default: '#f5f5f7',
    paper: '#ffffff',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
};

// Create the Material-UI theme with our color palette
export const theme = createTheme({
  palette: {
    primary: {
      light: colors.primary[100],
      main: colors.primary[200], // Using 200 as main for better contrast
      dark: colors.primary[500],
      contrastText: '#ffffff',
    },
    secondary: {
      light: colors.secondary[100],
      main: colors.secondary[300],
      dark: colors.secondary[500],
      contrastText: '#ffffff',
    },
    background: colors.background,
    text: colors.text,
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    headerTitle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '32px',
      fontWeight: 900,
      color: '#3B7B7B',
      textAlign: 'center',
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    // Custom component for navigation buttons
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
  // Custom navigation button styles
  custom: {
    navigationButton: {
      width: 63,
      height: 63,
      borderRadius: '50%',
      border: `3px solid ${colors.primary[200]}`,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(95, 188, 196, 0.3)',
        backgroundColor: 'rgba(95, 188, 196, 0.05)',
      },
    },
  },
});

export default theme;
