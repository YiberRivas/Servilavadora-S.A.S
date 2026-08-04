import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { colors, radii, shadows } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesion', 'Estas seguro que deseas cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>
      <View style={styles.body}>
        <View style={[styles.avatar, { backgroundColor: colors.accent + '15' }]}>
          <Icon source="account" size={40} color={colors.accent} />
        </View>
        <Text style={styles.name}>{user?.nombre || 'Administrador'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <Text style={styles.role}>ADMIN_EMPRESA</Text>
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.error }]} onPress={handleLogout}>
          <Icon source="logout" size={20} color={colors.white} />
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 4 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, color: colors.blue900, letterSpacing: -0.4 },
  body: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900, marginBottom: 4 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.gray600, marginBottom: 4 },
  role: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.accent, marginBottom: 32 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 24, borderRadius: radii.full },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
});
