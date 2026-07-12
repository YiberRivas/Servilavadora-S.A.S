import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';

export default function EmptyState({ icon = 'inbox-outline', title, message }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={colors.onSurfaceVariant} />
      {title && (
        <Text variant="titleMedium" style={[styles.title, { color: colors.onBackground }]}>
          {title}
        </Text>
      )}
      {message && (
        <Text variant="bodyMedium" style={[styles.message, { color: colors.onSurfaceVariant }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
});
