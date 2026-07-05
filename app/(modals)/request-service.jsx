import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { services } from '../../src/constants/mockData';
import AppInput from '../../src/components/ui/AppInput';
import AppButton from '../../src/components/ui/AppButton';
import { formatCurrency } from '../../src/utils/formatters';

export default function RequestServiceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id, companyId } = useLocalSearchParams();

  const service = services.find((s) => s.id === Number(id));

  const [formData, setFormData] = useState({
    direccion: '',
    fecha: '',
    hora: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!formData.direccion || !formData.fecha || !formData.hora) {
      setSnackbar({ visible: true, message: 'Completa los campos obligatorios' });
      return;
    }

    setLoading(true);
    try {
      // Mock submit
      setTimeout(() => {
        setSnackbar({ visible: true, message: 'Servicio solicitado exitosamente' });
        setTimeout(() => router.back(), 1500);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>
        {service && (
          <View style={[styles.serviceCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <Text variant="titleMedium" style={[styles.serviceName, { color: colors.primary }]}>
              {service.name}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>{service.description}</Text>
            <Text variant="titleSmall" style={{ color: colors.primary, fontWeight: '700', marginTop: 4 }}>
              {formatCurrency(service.price)} / hora
            </Text>
          </View>
        )}

        <Text variant="headlineSmall" style={[styles.title, { color: colors.onBackground }]}>
          Solicitar Servicio
        </Text>

        <AppInput
          label="Dirección del servicio *"
          value={formData.direccion}
          onChangeText={(v) => updateField('direccion', v)}
          icon="map-marker"
        />
        <AppInput
          label="Fecha *"
          value={formData.fecha}
          onChangeText={(v) => updateField('fecha', v)}
          icon="calendar"
          placeholder="YYYY-MM-DD"
        />
        <AppInput
          label="Hora *"
          value={formData.hora}
          onChangeText={(v) => updateField('hora', v)}
          icon="clock-outline"
          placeholder="HH:MM"
        />
        <AppInput
          label="Observaciones (opcional)"
          value={formData.observaciones}
          onChangeText={(v) => updateField('observaciones', v)}
          icon="comment-outline"
          multiline
          numberOfLines={3}
        />

        <View style={styles.actions}>
          <AppButton title="Solicitar Cita" onPress={handleSubmit} loading={loading} disabled={loading} />
          <AppButton title="Cancelar" onPress={() => router.back()} mode="outlined" />
        </View>
      </ScrollView>

      <Snackbar visible={snackbar.visible} onDismiss={() => setSnackbar({ ...snackbar, visible: false })} duration={3000}>
        {snackbar.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  serviceName: { fontWeight: '700', marginBottom: 4 },
  title: { fontWeight: '700', marginBottom: 20 },
  actions: { marginTop: 24, gap: 12 },
});
