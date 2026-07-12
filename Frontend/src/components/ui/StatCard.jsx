import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon, useTheme } from 'react-native-paper';
import { radii, shadows } from '../../theme';

export default function StatCard({ icon, value, label, color }) {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Icon source={icon} size={24} color={iconColor} />
        </View>
        <Text variant="headlineSmall" style={[styles.value, { color: colors.onBackground }]}>{value}</Text>
        <Text variant="bodySmall" style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  value: {
    fontWeight: '600',
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
  },
});
