import { MD3LightTheme } from 'react-native-paper';

const colors = {
  primary: '#00C6B3',
  primaryDark: '#62b1c5',
  primaryLight: '#4DEDD5',
  secondary: '#FF7B7B',
  accent: '#FFC145',
  dark: '#1a1a2e',
  darker: '#16213e',
  light: '#f8f9fa',
  lightBlue: '#E6F7FF',
  text: '#0a0909',
  textLight: '#6c757d',
  white: '#ffffff',
  background: '#f8f9fa',
  surface: '#ffffff',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  sidebarAdmin: '#17a2b8',
  sidebarClient: '#0b1e30',
};

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondary,
    tertiary: colors.accent,
    background: colors.light,
    surface: colors.white,
    surfaceVariant: colors.light,
    error: colors.error,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.text,
    onSurface: colors.text,
    onSurfaceVariant: colors.textLight,
    outline: '#e0e0e0',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.white,
      level2: colors.white,
    },
  },
  roundness: 12,
  fonts: {
    ...MD3LightTheme.fonts,
  },
};

export { colors, theme };
export default theme;
