import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563EB',
      },
      secondary: {
        main: '#f50057',
      },
      ...(mode === 'light'
        ? {
            text: {
              primary: '#1E293B',
              secondary: '#64748B',
              disabled: '#CBD5E1',
            },
            divider: '#E2E8F0',
            background: {
              default: '#F8FAFC',
              paper: '#FFFFFF',
            },
          }
        : {
            text: {
              primary: '#E2E8F0',
              secondary: '#94A3B8',
              disabled: '#475569',
            },
            divider: '#334155',
            background: {
              default: '#0F172A',
              paper: '#1E293B',
            },
          }),
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  });
