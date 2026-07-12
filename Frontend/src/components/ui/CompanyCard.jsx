import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { radii, shadows } from '../../theme';

export default function CompanyCard({ company, onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress?.(company)} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Image source={{ uri: company.image }} style={styles.image} />
          <View style={styles.info}>
            <Text variant="titleSmall" style={[styles.name, { color: colors.onBackground }]} numberOfLines={1}>
              {company.name}
            </Text>
            <Text variant="bodySmall" style={[styles.description, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
              {company.description}
            </Text>
            <View style={styles.ratingRow}>
              <IconButton icon="star" size={14} iconColor={colors.primary} style={styles.starIcon} />
              <Text variant="bodySmall" style={[styles.rating, { color: colors.onBackground }]}>{company.rating}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    marginRight: 14,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    lineHeight: 18,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    margin: 0,
    width: 20,
    height: 20,
  },
  rating: {
    fontWeight: '600',
    fontSize: 13,
  },
});
