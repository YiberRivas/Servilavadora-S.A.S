import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { paymentService } from '../../src/services/payment.service';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';

const STATUS_COLORS = {
  PENDIENTE: '#F59E0B',
  APROBADO: '#10B981',
  RECHAZADO: '#EF4444',
  CANCELADO: '#6B7280',
};

function DetailRow({ label, value, icon }) {
  return (
    <View style={styles.detailRow}>
      <Icon source={icon} size={20} color={colors.gray400} />
      <View style={styles.detailTextWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { pagoUuid } = useLocalSearchParams();
  const [pago, setPago] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPago = useCallback(async () => {
    try {
      setError(null);
      const response = await paymentService.getPayment(pagoUuid);
      setPago(response.data);
    } catch (err) {
      setError(err.message || 'Error al cargar pago');
    }
  }, [pagoUuid]);

  useEffect(() => {
    (async () => {
      await loadPago();
      setIsLoading(false);
    })();
  }, [loadPago]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const statusColor = pago?.estado_color || STATUS_COLORS[pago?.estado_codigo] || colors.gray400;

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Pago</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error || !pago) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Pago</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar</Text>
          <Text style={styles.emptyDesc}>{error || 'Pago no encontrado'}</Text>
          <TouchableOpacity onPress={loadPago} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
            <Text style={styles.emptyBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon source="arrow-left" size={24} color={colors.blue900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={[styles.amountCard, { backgroundColor: colors.blue900 }]}>
          <Text style={styles.amountLabel}>Valor del pago</Text>
          <Text style={styles.amountValue}>{formatCurrency(pago.valor)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{pago.estado_pago}</Text>
          </View>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.white }]}>
          <DetailRow label="Metodo de pago" value={pago.metodo_pago} icon="credit-card-outline" />
          <View style={styles.divider} />
          <DetailRow label="Fecha de pago" value={formatDate(pago.fecha_pago)} icon="calendar" />
          <View style={styles.divider} />
          <DetailRow label="Referencia" value={pago.referencia_externa} icon="file-document-outline" />
          <View style={styles.divider} />
          <DetailRow label="Descripcion" value={pago.descripcion} icon="text-box-outline" />
          <View style={styles.divider} />
          <DetailRow label="Observaciones" value={pago.observaciones} icon="note-text-outline" />
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.white }]}>
          <DetailRow label="Estado" value={pago.estado_pago} icon="flag-outline" />
          <View style={styles.divider} />
          <DetailRow label="Fecha de registro" value={formatDate(pago.created_at)} icon="clock-outline" />
          {pago.updated_at && (
            <>
              <View style={styles.divider} />
              <DetailRow label="Ultima actualizacion" value={formatDate(pago.updated_at)} icon="update" />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.blue900 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  amountCard: { padding: 24, borderRadius: radii.lg, alignItems: 'center', gap: 8, ...shadows.md },
  amountLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  amountValue: { fontFamily: 'Poppins_700Bold', fontSize: 32, color: colors.white },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginTop: 4 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.white },
  detailCard: { padding: 16, borderRadius: radii.lg, gap: 0, ...shadows.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  detailTextWrap: { flex: 1 },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray400 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.blue900, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.gray100, marginLeft: 32 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
