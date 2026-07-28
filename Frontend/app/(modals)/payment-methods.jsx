import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { paymentService } from '../../src/services/payment.service';
import { colors, radii, shadows } from '../../src/theme';

const METHOD_ICONS = {
  Efectivo: 'cash',
  Nequi: 'cellphone',
  Daviplata: 'cellphone',
  'Transferencia bancaria': 'bank-transfer',
  default: 'credit-card-outline',
};

function MethodCard({ method, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const iconName = METHOD_ICONS[method.nombre] || METHOD_ICONS.default;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.card, { backgroundColor: colors.white }]}>
        <View style={[styles.cardIconWrap, { backgroundColor: colors.accentTint }]}>
          <Icon source={iconName} size={24} color={colors.accent} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{method.nombre}</Text>
          <Text style={styles.cardDesc}>{method.descripcion || 'Metodo de pago disponible'}</Text>
        </View>
        <Icon source="check-circle" size={20} color={colors.accent} />
      </View>
    </Animated.View>
  );
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadMethods = useCallback(async () => {
    try {
      setError(null);
      const response = await paymentService.getPaymentMethods();
      setMethods(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar metodos de pago');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadMethods();
      setIsLoading(false);
    })();
  }, [loadMethods]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMethods();
    setRefreshing(false);
  }, [loadMethods]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Metodos de Pago</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (error && methods.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Metodos de Pago</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.error + '15' }]}>
            <Icon source="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.emptyTitle}>Error al cargar</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity onPress={loadMethods} style={[styles.emptyBtn, { backgroundColor: colors.accent }]}>
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
        <Text style={styles.headerTitle}>Metodos de Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      {methods.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.gray50 }]}>
            <Icon source="credit-card-off-outline" size={48} color={colors.gray300} />
          </View>
          <Text style={styles.emptyTitle}>Sin metodos de pago</Text>
          <Text style={styles.emptyDesc}>No hay metodos de pago disponibles actualmente.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          <Text style={styles.sectionTitle}>Metodos disponibles</Text>
          {methods.map((method, index) => (
            <MethodCard key={method.uuid} method={method} index={index} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.blue900 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900, marginTop: 8, marginBottom: 4 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radii.lg, gap: 12, ...shadows.sm },
  cardIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.blue900 },
  cardDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, textAlign: 'center' },
  emptyDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
