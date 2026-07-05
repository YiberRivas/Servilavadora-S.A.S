import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon, useTheme } from 'react-native-paper';

export default function StatCard({ icon, value, label, color }) {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Icon source={icon} size={28} color={iconColor} />
        </View>
        <Text variant="headlineSmall" style={[styles.value, { color: colors.onSurface }]}>{value}</Text>
        <Text variant="bodySmall" style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontWeight: '700',
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
  },
});
