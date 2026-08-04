import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { routesService } from '../../src/services/routes.service';
import { colors, radii, shadows } from '../../src/theme';

export default function GpsTabScreen() {
  const router = useRouter();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRutas = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const result = await routesService.getMyRoute();
      setRutas(result.data ? [result.data] : []);
    } catch (err) {
      setRutas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRutas();
  }, [loadRutas]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon source="map-marker-radius" size={22} color={colors.accent} />
        <Text style={styles.headerTitle}>Rastreo GPS</Text>
      </View>

      {rutas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon source="map-marker-off-outline" size={56} color={colors.gray300 || '#D1D5DB'} />
          <Text style={styles.emptyTitle}>Sin ruta activa</Text>
          <Text style={styles.emptyText}>No tienes una ruta GPS en curso. Las rutas se activan cuando tienes una asignacion activa.</Text>
        </View>
      ) : (
        <FlatList
          data={rutas}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRutas(true)} colors={[colors.accent]} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.rutaCard}
              onPress={() => router.push(`/(modals)/driver-navigation?uuid=${item.alquiler_uuid}`)}
              activeOpacity={0.7}
            >
              <View style={styles.rutaIcon}>
                <Icon source="map-marker-radius" size={28} color={colors.accent} />
              </View>
              <View style={styles.rutaInfo}>
                <Text style={styles.rutaTitle}>Ruta en curso</Text>
                <Text style={styles.rutaSubtitle}>Estado: {item.estado}</Text>
                {item.distancia_restante_metros > 0 && (
                  <Text style={styles.rutaDetail}>{(item.distancia_restante_metros / 1000).toFixed(1)} km restantes</Text>
                )}
              </View>
              <Icon source="chevron-right" size={20} color={colors.gray400} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 || '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, marginTop: 16 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500 || '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  listContent: { padding: 20, paddingBottom: 24 },
  rutaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.sm },
  rutaIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: `${colors.accent}15`, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  rutaInfo: { flex: 1 },
  rutaTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.blue900 },
  rutaSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray500 || '#6B7280', marginTop: 2 },
  rutaDetail: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.accent, marginTop: 4 },
});
