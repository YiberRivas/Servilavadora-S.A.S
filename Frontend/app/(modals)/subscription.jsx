import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { paymentService } from '../../src/services/payment.service';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';

const PLAN_COLORS = {
  Basico: '#6B7280',
  Profesional: colors.accent,
  Premium: '#8B5CF6',
};

function PlanCard({ plan, index, onSelect, isSelected }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const accentColor = PLAN_COLORS[plan.nombre] || colors.accent;
  const borderColor = isSelected ? accentColor : colors.white;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelect(plan)}
        style={[styles.planCard, { backgroundColor: colors.white, borderColor, borderWidth: isSelected ? 2 : 1 }]}
      >
        {plan.nombre === 'Premium' && (
          <View style={[styles.popularBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
        <Text style={[styles.planName, { color: accentColor }]}>{plan.nombre}</Text>
        <Text style={styles.planDesc}>{plan.descripcion || 'Plan ideal para tu negocio'}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.planPrice}>{formatCurrency(plan.precio)}</Text>
          <Text style={styles.planPeriod}>/{plan.duracion_dias} dias</Text>
        </View>
        <View style={styles.planFeatures}>
          {(plan.features || []).map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Icon source="check-circle" size={16} color={accentColor} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.selectBtn, { backgroundColor: isSelected ? accentColor : colors.gray50 }]}>
          <Text style={[styles.selectBtnText, { color: isSelected ? colors.white : colors.blue900 }]}>
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [plansRes, subRes] = await Promise.all([
        paymentService.getSubscriptionPlans(),
        paymentService.getSubscriptions().catch(() => ({ data: [] })),
      ]);
      setPlans(plansRes.data || []);
      const active = (subRes.data || []).find((s) => s.activo && s.estado_codigo === 'ACTIVA');
      if (active) setCurrentPlan(active);
    } catch (err) {
      setError(err.message || 'Error al cargar planes');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadData();
      setIsLoading(false);
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCreate = useCallback(async () => {
    if (!selectedPlan) return;
    setIsCreating(true);
    try {
      await paymentService.createSubscription({ plan_uuid: selectedPlan.uuid });
      router.back();
    } catch (err) {
      setError(err.message || 'Error al crear suscripcion');
    } finally {
      setIsCreating(false);
    }
  }, [selectedPlan, router]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planes y Suscripcion</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
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
        <Text style={styles.headerTitle}>Planes y Suscripcion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {currentPlan && (
          <View style={[styles.currentCard, { backgroundColor: colors.accentTint }]}>
            <Icon source="check-decagram" size={24} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLabel}>Tu plan actual</Text>
              <Text style={styles.currentName}>{currentPlan.plan_nombre || 'Activo'}</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '10' }]}>
            <Icon source="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {plans.map((plan, index) => (
          <PlanCard
            key={plan.uuid}
            plan={plan}
            index={index}
            onSelect={setSelectedPlan}
            isSelected={selectedPlan?.uuid === plan.uuid}
          />
        ))}

        {selectedPlan && (
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.accent, opacity: isCreating ? 0.6 : 1 }]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.createBtnText}>Suscribirse a {selectedPlan.nombre}</Text>
            )}
          </TouchableOpacity>
        )}
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
  currentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radii.lg, gap: 12 },
  currentLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray500 },
  currentName: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.accent, marginTop: 2 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: radii.md, gap: 8 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.error, flex: 1 },
  planCard: { padding: 20, borderRadius: radii.lg, position: 'relative', overflow: 'hidden', ...shadows.md },
  popularBadge: { position: 'absolute', top: 12, right: -28, transform: [{ rotate: '45deg' }], paddingHorizontal: 32, paddingVertical: 4 },
  popularText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.white },
  planName: { fontFamily: 'Poppins_700Bold', fontSize: 22 },
  planDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12, gap: 4 },
  planPrice: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.blue900 },
  planPeriod: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray400 },
  planFeatures: { marginTop: 12, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray600 },
  selectBtn: { marginTop: 16, paddingVertical: 12, borderRadius: radii.md, alignItems: 'center' },
  selectBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  createBtn: { paddingVertical: 16, borderRadius: radii.md, alignItems: 'center', marginTop: 8 },
  createBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.white },
});
