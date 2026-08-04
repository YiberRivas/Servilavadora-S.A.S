import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { profileService } from '../../src/services/profile.service';
import { colors, radii, shadows } from '../../src/theme';

export default function DriverProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const userName = profile?.nombre_completo || user?.nombre_completo || '';
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = useCallback(async () => {
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
  }, [signOut, router]);

  const menuItems = [
    { icon: 'account-edit-outline', label: 'Editar perfil', onPress: () => Alert.alert('Proximamente', 'La edicion de perfil estara disponible pronto.') },
    { icon: 'lock-outline', label: 'Cambiar contrasena', onPress: () => Alert.alert('Proximamente', 'Funcionalidad proximamente disponible.') },
    { icon: 'credit-card-outline', label: 'Metodos de pago', onPress: () => router.push('/(modals)/payment-methods') },
    { icon: 'bell-outline', label: 'Configurar notificaciones', onPress: () => Alert.alert('Proximamente', 'Configuracion de notificaciones proximamente disponible.') },
    { icon: 'help-circle-outline', label: 'Centro de ayuda', onPress: () => Alert.alert('Centro de ayuda', 'Accede a guias y tutoriales.') },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} colors={[colors.accent]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userRole}>Repartidor</Text>
        {profile?.correo && <Text style={styles.userEmail}>{profile.correo}</Text>}
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Icon source={item.icon} size={20} color={colors.gray500 || '#6B7280'} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Icon source="chevron-right" size={18} color={colors.gray300 || '#D1D5DB'} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Icon source="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 || '#F9FAFB' },
  scrollContent: { paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 10, backgroundColor: colors.white },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900 },
  avatarSection: { alignItems: 'center', paddingVertical: 18, backgroundColor: colors.white, marginBottom: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarText: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.white },
  userName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.blue900 },
  userRole: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.accent, marginTop: 1 },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.gray500 || '#6B7280', marginTop: 2 },
  menuCard: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: radii.lg, ...shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.gray700 || '#374151', flex: 1, marginLeft: 10 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, marginTop: 14, backgroundColor: colors.white, borderRadius: radii.lg, paddingVertical: 12, borderWidth: 1, borderColor: `${colors.error}30` },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.error },
});
