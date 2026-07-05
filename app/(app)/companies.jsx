import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { companies } from '../../src/constants/mockData';
import CompanyCard from '../../src/components/ui/CompanyCard';
import EmptyState from '../../src/components/ui/EmptyState';

export default function CompaniesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePress = (company) => {
    router.push({ pathname: '/(modals)/company-detail', params: { id: company.id } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.onBackground }]}>
          Empresas
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Encuentra la empresa perfecta para ti
        </Text>
      </View>

      <Searchbar
        placeholder="Buscar empresas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        iconColor={colors.primary}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <CompanyCard company={item} onPress={handlePress} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="Sin resultados" message="No se encontraron empresas" />}
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
});
