import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, IconButton, Avatar } from 'react-native-paper';

export default function CompanyCard({ company, onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress?.(company)} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <Image source={{ uri: company.image }} style={styles.image} />
          <View style={styles.info}>
            <Text variant="titleSmall" style={styles.name} numberOfLines={1}>{company.name}</Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={2}>
              {company.description}
            </Text>
            <View style={styles.ratingRow}>
              <IconButton icon="star" size={14} iconColor="#FFC145" style={styles.starIcon} />
              <Text variant="bodySmall" style={{ fontWeight: '600', color: colors.onSurface }}>{company.rating}</Text>
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
    borderRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    margin: 0,
    width: 20,
    height: 20,
  },
});
