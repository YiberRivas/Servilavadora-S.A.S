import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { repartidorService } from '../../src/services/repartidor.service';
import { colors, radii, shadows } from '../../src/theme';

function AssignmentCard({ item, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const estadoColor = {
    ASIGNADO: colors.warning || '#F59E0B',
    EN_CAMINO: colors.accent,
    ENTREGADO: colors.success || '#10B981',
    EN_CURSO: colors.info || '#3B82F6',
    PENDIENTE: colors.gray400,
  }[item.estado] || colors.gray400;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Icon source="domain" size={18} color={colors.accent} />
            <Text style={styles.empresaText} numberOfLines={1}>{item.empresa}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${estadoColor}18` }]}>
            <Text style={[styles.badgeText, { color: estadoColor }]}>{item.estadoNombre || item.estado}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon source="account-outline" size={16} color={colors.gray500 || '#6B7280'} />
            <Text style={styles.infoText} numberOfLines={1}>{item.cliente}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon source="map-marker-outline" size={16} color={colors.gray500 || '#6B7280'} />
            <Text style={styles.infoText} numberOfLines={2}>{item.direccion}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {item.fechaInicio && (
            <View style={styles.footerItem}>
              <Icon source="clock-outline" size={14} color={colors.gray400} />
              <Text style={styles.footerText}>{new Date(item.fechaInicio).toLocaleDateString()}</Text>
            </View>
          )}
          {item.valorTotal > 0 && (
            <View style={styles.footerItem}>
              <Text style={styles.footerText}>${item.valorTotal.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AssignmentsScreen() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(null);

  const loadAssignments = useCallback(async (isRefresh = false, newPage = 1) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const result = await repartidorService.asignaciones({ page: newPage, per_page: 20, estado: filter });
      setAssignments(result.data?.items || []);
      setTotalPages(result.data?.total_pages || 1);
      setPage(newPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const filters = [
    { label: 'Todos', value: null },
    { label: 'Pendientes', value: 'ASIGNADO' },
    { label: 'En curso', value: 'EN_CURSO' },
    { label: 'Entregados', value: 'ENTREGADO' },
  ];

  if (loading && assignments.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Icon source="arrow-left" size={24} color={colors.blue900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Asignaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <AssignmentCard
            item={item}
            onPress={() => router.push(`/(modals)/driver-navigation?uuid=${item.uuid}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAssignments(true)} colors={[colors.accent]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon source="clipboard-check-outline" size={48} color={colors.gray300 || '#D1D5DB'} />
            <Text style={styles.emptyText}>No hay asignaciones</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 || '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radii.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 || '#E5E7EB' },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray600 || '#4B5563' },
  filterTextActive: { color: colors.white },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  empresaText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  cardBody: { gap: 6, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 || '#4B5563', flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: 10 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray500 || '#6B7280' },
  empty: { alignItems: 'center', paddingTop: 64 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.gray400, marginTop: 12 },
});
