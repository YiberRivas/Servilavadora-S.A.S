import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, useTheme, IconButton } from 'react-native-paper';
import { formatCurrency, getStatusColor, getStatusLabel } from '../../utils/formatters';
import AppButton from './AppButton';

export default function ServiceCard({ service, onPress, onBook }) {
  const { colors } = useTheme();
  const statusColor = getStatusColor(service.status?.toLowerCase());

  return (
    <TouchableOpacity onPress={() => onPress?.(service)} activeOpacity={0.7}>
      <Card style={[styles.card, { backgroundColor: colors.surface, borderTopColor: colors.primary }]}>
        <Card.Cover source={{ uri: service.image }} style={styles.image} />
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.name} numberOfLines={1}>{service.name}</Text>
            <Chip
              style={[styles.chip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor, fontSize: 11, fontWeight: '600' }}
              compact
            >
              {getStatusLabel(service.status?.toLowerCase())}
            </Chip>
          </View>
          <Text variant="bodySmall" style={[styles.description, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
            {service.description}
          </Text>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <IconButton icon="map-marker" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
                {service.location}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <IconButton icon="archive" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>Cap: {service.capacity}</Text>
            </View>
            <View style={styles.detailItem}>
              <IconButton icon="currency-usd" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.primary, fontWeight: '700' }}>
                {formatCurrency(service.price)} / hora
              </Text>
            </View>
          </View>
        </Card.Content>
        {onBook && (
          <Card.Actions style={styles.actions}>
            <AppButton mode="contained" compact onPress={() => onBook(service)} title="Reservar" />
          </Card.Actions>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    borderTopWidth: 4,
    elevation: 3,
  },
  image: {
    height: 180,
  },
  content: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  chip: {
    borderRadius: 20,
    height: 26,
  },
  description: {
    marginBottom: 12,
  },
  details: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    margin: 0,
    width: 24,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
