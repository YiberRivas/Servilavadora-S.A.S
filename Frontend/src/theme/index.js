import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  white: '#FFFFFF',
  blue900: '#132A45',
  blue700: '#1F4E79',
  blue500: '#2D6CB5',
  blue100: '#E7F0FA',
  gray50: '#F7F9FB',
  gray100: '#EEF1F4',
  gray300: '#D7DEE6',
  gray400: '#8B94A3',
  gray600: '#5C6675',
  gray900: '#1B2430',
  accent: '#12A594',
  accentDark: '#0E8377',
  accentTint: '#E4F6F3',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  statusAvailable: '#00a085',
  statusUnavailable: '#ff5252',
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 24,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#132A45',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#132A45',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 4,
  },
  lg: {
    shadowColor: '#132A45',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.14,
    shadowRadius: 55,
    elevation: 8,
  },
};

const fontConfig = {
  displayLarge: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  displayMedium: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  displaySmall: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  headlineLarge: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  headlineMedium: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  headlineSmall: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  titleLarge: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600' },
  titleMedium: { fontFamily: 'Poppins_500Medium', fontWeight: '500' },
  titleSmall: { fontFamily: 'Poppins_500Medium', fontWeight: '500' },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  bodyMedium: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  bodySmall: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
  labelLarge: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  labelMedium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
  labelSmall: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.accent,
    primaryContainer: colors.accentTint,
    onPrimary: colors.white,
    secondary: colors.blue700,
    secondaryContainer: colors.blue100,
    tertiary: colors.blue500,
    background: colors.gray50,
    surface: colors.white,
    surfaceVariant: colors.gray50,
    error: colors.error,
    onBackground: colors.blue900,
    onSurface: colors.gray900,
    onSurfaceVariant: colors.gray600,
    outline: colors.gray100,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.white,
      level2: colors.white,
    },
  },
  roundness: radii.lg,
  fonts: fontConfig,
};

export default theme;
