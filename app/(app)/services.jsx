import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, Chip, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { services } from '../../src/constants/mockData';
import ServiceCard from '../../src/components/ui/ServiceCard';
import EmptyState from '../../src/components/ui/EmptyState';

export default function ServicesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const allStatuses = ['all', 'Disponible', 'En mantenimiento'];
  const filtered = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handlePress = (service) => {
    router.push({ pathname: '/(modals)/request-service', params: { id: service.id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.onBackground }]}>
          Lavadoras
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Descubre nuestras lavadoras disponibles
        </Text>
      </View>

      <Searchbar
        placeholder="Buscar lavadoras..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        iconColor={colors.primary}
      />

      <View style={styles.filters}>
        {allStatuses.map((status) => (
          <Chip
            key={status}
            selected={filter === status}
            onPress={() => setFilter(status)}
            style={styles.chip}
            selectedColor={colors.primary}
            compact
          >
            {status === 'all' ? 'Todas' : status}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={handlePress} onBook={handlePress} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="Sin resultados" message="No se encontraron lavadoras" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  title: { fontWeight: '700', marginBottom: 4 },
  searchbar: { marginHorizontal: 24, marginBottom: 8, borderRadius: 12, elevation: 2 },
  filters: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8, flexWrap: 'wrap' },
  chip: { borderRadius: 20 },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
});
