import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, useTheme, Chip, IconButton, Searchbar } from 'react-native-paper';
import { appointments } from '../../src/constants/mockData';
import { formatCurrency, getStatusColor, getStatusLabel } from '../../src/utils/formatters';
import EmptyState from '../../src/components/ui/EmptyState';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = appointments.filter((a) =>
    a.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleSmall" style={styles.serviceName}>{item.serviceName}</Text>
            <Chip
              style={{ backgroundColor: statusColor + '20' }}
              textStyle={{ color: statusColor, fontSize: 11, fontWeight: '600' }}
              compact
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <IconButton icon="calendar" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{item.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <IconButton icon="clock-outline" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{item.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <IconButton icon="map-marker" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>{item.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <IconButton icon="currency-usd" size={16} style={styles.detailIcon} />
              <Text variant="bodySmall" style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(item.price)}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.onBackground }]}>
          Historial
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Tus servicios anteriores
        </Text>
      </View>

      <Searchbar
        placeholder="Buscar servicios..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        iconColor={colors.primary}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="Sin historial" message="No tienes servicios registrados" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  title: { fontWeight: '700', marginBottom: 4 },
  searchbar: { marginHorizontal: 24, marginBottom: 16, borderRadius: 12, elevation: 2 },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceName: { fontWeight: '700', flex: 1, marginRight: 8 },
  details: { gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { margin: 0, width: 24 },
});
