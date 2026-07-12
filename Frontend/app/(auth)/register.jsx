import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Snackbar, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AppInput from '../../src/components/ui/AppInput';
import AppButton from '../../src/components/ui/AppButton';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const [persona, setPersona] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    telefono: '',
    correo: '',
  });

  const [credenciales, setCredenciales] = useState({
    usuario: '',
    contrasena: '',
    confirmar: '',
  });

  const updatePersona = (field, value) => setPersona({ ...persona, [field]: value });
  const updateCredenciales = (field, value) => setCredenciales({ ...credenciales, [field]: value });

  const validateStep1 = () => {
    if (!persona.nombres || !persona.apellidos || !persona.correo || !persona.identificacion) {
      setSnackbar({ visible: true, message: 'Completa todos los campos' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!credenciales.usuario || !credenciales.contrasena || !credenciales.confirmar) {
      setSnackbar({ visible: true, message: 'Completa todos los campos' });
      return false;
    }
    if (credenciales.contrasena !== credenciales.confirmar) {
      setSnackbar({ visible: true, message: 'Las contraseñas no coinciden' });
      return false;
    }
    if (credenciales.contrasena.length < 6) {
      setSnackbar({ visible: true, message: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // Mock register
      setTimeout(() => {
        setSnackbar({ visible: true, message: 'Registro exitoso. Ahora inicia sesión.' });
        setTimeout(() => router.replace('/(auth)/login'), 1500);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.logoIcon}>🧺</Text>
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.onBackground }]}>
            Crear Cuenta
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            Únete a nuestra comunidad
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            Paso {step} de 2
          </Text>
          <ProgressBar progress={step === 1 ? 0.5 : 1} color={colors.primary} style={styles.progress} />
        </View>

        <View style={styles.form}>
          {step === 1 && (
            <>
              <AppInput label="Nombres" value={persona.nombres} onChangeText={(v) => updatePersona('nombres', v)} icon="account" />
              <AppInput label="Apellidos" value={persona.apellidos} onChangeText={(v) => updatePersona('apellidos', v)} icon="account" />
              <AppInput label="Identificación" value={persona.identificacion} onChangeText={(v) => updatePersona('identificacion', v)} icon="card-bulleted" keyboardType="numeric" />
              <AppInput label="Teléfono" value={persona.telefono} onChangeText={(v) => updatePersona('telefono', v)} icon="phone" keyboardType="phone-pad" />
              <AppInput label="Correo electrónico" value={persona.correo} onChangeText={(v) => updatePersona('correo', v)} icon="email" keyboardType="email-address" autoCapitalize="none" />
              <AppButton title="Siguiente" onPress={handleNext} />
            </>
          )}

          {step === 2 && (
            <>
              <AppInput label="Usuario" value={credenciales.usuario} onChangeText={(v) => updateCredenciales('usuario', v)} icon="account" autoCapitalize="none" />
              <AppInput label="Contraseña" value={credenciales.contrasena} onChangeText={(v) => updateCredenciales('contrasena', v)} icon="lock" secureTextEntry />
              <AppInput label="Confirmar contraseña" value={credenciales.confirmar} onChangeText={(v) => updateCredenciales('confirmar', v)} icon="lock-check" secureTextEntry />
              <View style={styles.buttonRow}>
                <AppButton title="Atrás" onPress={() => setStep(1)} mode="outlined" style={styles.halfButton} />
                <AppButton title="Registrarse" onPress={handleRegister} loading={loading} disabled={loading} style={styles.halfButton} />
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            ¿Ya tienes una cuenta?{' '}
            <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }} onPress={() => router.push('/(auth)/login')}>
              Inicia sesión aquí
            </Text>
          </Text>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 36 },
  title: { fontWeight: '700', marginBottom: 8 },
  progressContainer: { marginBottom: 24 },
  progress: { height: 6, borderRadius: 3, marginTop: 8 },
  form: { marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  halfButton: { flex: 1 },
  footer: { alignItems: 'center', paddingBottom: 32 },
});
