import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { radii } from '../../theme';

const VARIANT_CONFIG = {
  primary: { mode: 'contained' },
  outline: { mode: 'outlined' },
  ghost: { mode: 'text' },
  white: { mode: 'contained' },
};

export default function AppButton({ title, onPress, variant = 'primary', loading, disabled, icon, fullWidth, style, labelStyle }) {
  const { colors } = useTheme();
  const config = VARIANT_CONFIG[variant];

  const variantColors = () => {
    switch (variant) {
      case 'primary':
        return { buttonColor: colors.primary, textColor: colors.onPrimary };
      case 'outline':
        return { textColor: colors.onBackground };
      case 'ghost':
        return { textColor: colors.onBackground };
      case 'white':
        return { buttonColor: colors.white, textColor: '#1F4E79' };
      default:
        return { buttonColor: colors.primary, textColor: colors.onPrimary };
    }
  };

  const { buttonColor, textColor } = variantColors();

  return (
    <Button
      mode={config.mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      buttonColor={buttonColor}
      textColor={textColor}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        variant === 'outline' && { borderColor: colors.outline },
        style,
      ]}
      contentStyle={styles.content}
      labelStyle={[styles.label, { color: textColor }, labelStyle]}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    height: 48,
    paddingHorizontal: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
