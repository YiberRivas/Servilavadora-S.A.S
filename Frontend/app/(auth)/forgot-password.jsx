import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Snackbar, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AppInput from '../../src/components/ui/AppInput';
import AppButton from '../../src/components/ui/AppButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleSend = () => {
    if (!email) {
      setSnackbar({ visible: true, message: 'Ingresa tu correo electronico' });
      return;
    }
    // TODO: Conectar a endpoint de recuperacion cuando este disponible en backend
    setSnackbar({ visible: true, message: 'Esta funcionalidad no esta disponible aun. Contacta al administrador.' });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
            <Icon source="key-variant" size={36} color={colors.primary} />
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.onBackground }]}>
            Recuperar Contraseña
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
            {sent
              ? 'Te hemos enviado un correo con las instrucciones para recuperar tu contraseña.'
              : 'Ingresa tu correo electrónico y te enviaremos las instrucciones.'}
          </Text>
        </View>

        {!sent ? (
          <View style={styles.form}>
            <AppInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              icon="email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppButton title="Enviar instrucciones" onPress={handleSend} />
            <View style={styles.backLink}>
              <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }} onPress={() => router.back()}>
                Volver al inicio de sesión
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <AppButton title="Volver al inicio de sesión" onPress={() => router.replace('/(auth)/login')} />
          </View>
        )}
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
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontWeight: '700', marginBottom: 8 },
  form: { marginBottom: 32 },
  backLink: { alignItems: 'center', marginTop: 16 },
});
