import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// theme factorryyyyyy
export function createAppTheme(mode: PaletteMode = 'light') {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: {
        default: isLight ? '#fafafa' : '#071019',
        paper: isLight ? '#ffffff' : '#0b1220',
      },
      text: {
        primary: isLight ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.92)',
      },
    },
    typography: {
      fontFamily: 'Roboto, -apple-system, "Segoe UI", Arial, sans-serif',
    },
    shape: { borderRadius: 8 },
  });
}

// Default light theme
const theme = createAppTheme('light');

export default theme;
