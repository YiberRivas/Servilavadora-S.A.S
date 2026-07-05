import React from 'react';
import { Button, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function AppButton({ title, onPress, mode = 'contained', loading, disabled, style, icon, compact }) {
  const { colors } = useTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      compact={compact}
      contentStyle={styles.content}
      labelStyle={[styles.label, mode === 'contained' && { color: colors.onPrimary }]}
      style={[styles.button, style]}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 2,
  },
  content: {
    height: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
