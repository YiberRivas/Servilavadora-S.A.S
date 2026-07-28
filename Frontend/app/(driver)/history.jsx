import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { repartidorService } from '../../src/services/repartidor.service';
import { colors, radii, shadows } from '../../src/theme';

function HistoryCard({ item }) {
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Icon source="domain" size={16} color={colors.accent} />
          <Text style={styles.empresaText} numberOfLines={1}>{item.empresa}</Text>
        </View>
        <View style={styles.doneBadge}>
          <Icon source="check-circle" size={14} color={colors.success || '#10B981'} />
          <Text style={styles.doneText}>Finalizado</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon source="account-outline" size={14} color={colors.gray500 || '#6B7280'} />
          <Text style={styles.infoText} numberOfLines={1}>{item.cliente}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon source="map-marker-outline" size={14} color={colors.gray500 || '#6B7280'} />
          <Text style={styles.infoText} numberOfLines={2}>{item.direccion}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Icon source="clock-outline" size={13} color={colors.gray400} />
          <Text style={styles.footerText}>{formatDuration(item.duracionSegundos)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon source="road-variant" size={13} color={colors.gray400} />
          <Text style={styles.footerText}>{item.kilometros} km</Text>
        </View>
        {item.valorTotal > 0 && (
          <View style={styles.footerItem}>
            <Text style={styles.footerValue}>${item.valorTotal.toLocaleString()}</Text>
          </View>
        )}
      </View>

      {item.fechaInicio && (
        <Text style={styles.dateText}>
          {new Date(item.fechaInicio).toLocaleDateString()} - {item.fechaFin ? new Date(item.fechaFin).toLocaleTimeString() : ''}
        </Text>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const result = await repartidorService.historial({ page: 1, per_page: 50 });
      setHistory(result.data?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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
        <Text style={styles.headerTitle}>Historial de Entregas</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => <HistoryCard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} colors={[colors.accent]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon source="history" size={48} color={colors.gray300 || '#D1D5DB'} />
            <Text style={styles.emptyText}>No hay entregas finalizadas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 || '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },
  listContent: { padding: 20, paddingBottom: 24 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  empresaText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, flex: 1 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${colors.success || '#10B981'}18`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  doneText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.success || '#10B981' },
  cardBody: { gap: 6, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 || '#4B5563', flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: 10 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray500 || '#6B7280' },
  footerValue: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: colors.blue900 },
  dateText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray400, marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 64 },
  emptyText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.gray400, marginTop: 12 },
});
