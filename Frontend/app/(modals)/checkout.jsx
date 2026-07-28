import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Text, Icon, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { paymentService } from '../../src/services/payment.service';
import { formatCurrency } from '../../src/utils/formatters';
import { colors, radii, shadows } from '../../src/theme';

function MethodOption({ method, isSelected, onSelect, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }).start();
  }, []);

  const iconMap = {
    Efectivo: 'cash',
    Nequi: 'cellphone',
    Daviplata: 'cellphone',
    'Transferencia bancaria': 'bank-transfer-in',
    default: 'credit-card-outline',
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelect(method)}
        style={[styles.methodOption, { backgroundColor: colors.white, borderColor: isSelected ? colors.accent : colors.gray100, borderWidth: isSelected ? 2 : 1 }]}
      >
        <Icon source={iconMap[method.nombre] || iconMap.default} size={28} color={isSelected ? colors.accent : colors.gray400} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.methodName, { color: isSelected ? colors.accent : colors.blue900 }]}>{method.nombre}</Text>
          <Text style={styles.methodDesc}>{method.descripcion || 'Metodo de pago'}</Text>
        </View>
        <Icon source={isSelected ? 'radiobox-marked' : 'radiobox-blank'} size={22} color={isSelected ? colors.accent : colors.gray300} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { alquilerUuid, monto } = useLocalSearchParams();
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
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

  const handlePay = useCallback(async () => {
    if (!selectedMethod || !alquilerUuid) return;
    setIsPaying(true);
    setError(null);
    try {
      await paymentService.createPayment({
        alquiler_uuid: alquilerUuid,
        metodo_pago_uuid: selectedMethod.uuid,
        valor: parseFloat(monto) || 0,
        referencia_externa: referencia || undefined,
        descripcion: descripcion || undefined,
      });
      router.replace({ pathname: '/(modals)/payment-detail', params: { pagoUuid: 'latest' } });
    } catch (err) {
      setError(err.message || 'Error al procesar pago');
    } finally {
      setIsPaying(false);
    }
  }, [selectedMethod, alquilerUuid, monto, referencia, descripcion, router]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={colors.blue900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagar</Text>
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
        <Text style={styles.headerTitle}>Pagar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={[styles.amountCard, { backgroundColor: colors.blue900 }]}>
          <Text style={styles.amountLabel}>Total a pagar</Text>
          <Text style={styles.amountValue}>{formatCurrency(parseFloat(monto) || 0)}</Text>
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '10' }]}>
            <Icon source="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Metodo de pago</Text>
        {methods.map((method, index) => (
          <MethodOption key={method.uuid} method={method} isSelected={selectedMethod?.uuid === method.uuid} onSelect={setSelectedMethod} index={index} />
        ))}

        {selectedMethod && (
          <View style={[styles.formCard, { backgroundColor: colors.white }]}>
            <Text style={styles.formLabel}>Referencia (opcional)</Text>
            <TextInput
              mode="outlined"
              placeholder="Ej: #12345"
              value={referencia}
              onChangeText={setReferencia}
              outlineColor={colors.gray200}
              activeOutlineColor={colors.accent}
              style={styles.input}
              contentStyle={styles.inputContent}
            />
            <Text style={styles.formLabel}>Descripcion (opcional)</Text>
            <TextInput
              mode="outlined"
              placeholder="Nota sobre el pago..."
              value={descripcion}
              onChangeText={setDescripcion}
              outlineColor={colors.gray200}
              activeOutlineColor={colors.accent}
              style={styles.input}
              contentStyle={styles.inputContent}
            />
          </View>
        )}

        {selectedMethod && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: colors.accent, opacity: isPaying ? 0.6 : 1 }]}
            onPress={handlePay}
            disabled={isPaying}
          >
            {isPaying ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.payBtnText}>Confirmar Pago</Text>
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
  amountCard: { padding: 24, borderRadius: radii.lg, alignItems: 'center', ...shadows.md },
  amountLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  amountValue: { fontFamily: 'Poppins_700Bold', fontSize: 32, color: colors.white, marginTop: 4 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: radii.md, gap: 8 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.error, flex: 1 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.blue900 },
  methodOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radii.lg, gap: 12 },
  methodName: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  methodDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.gray500, marginTop: 2 },
  formCard: { padding: 16, borderRadius: radii.lg, gap: 8, ...shadows.sm },
  formLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.blue900, marginTop: 4 },
  input: { backgroundColor: colors.white },
  inputContent: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  payBtn: { paddingVertical: 16, borderRadius: radii.md, alignItems: 'center', marginTop: 8 },
  payBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.white },
});
