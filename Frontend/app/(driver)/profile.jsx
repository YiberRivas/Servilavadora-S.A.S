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
      { text: 'Cerrar sesion', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  const menuItems = [
    { icon: 'account-edit-outline', label: 'Editar perfil', onPress: () => {} },
    { icon: 'lock-outline', label: 'Cambiar contrasena', onPress: () => {} },
    { icon: 'credit-card-outline', label: 'Metodos de pago', onPress: () => router.push('/(modals)/payment-methods') },
    { icon: 'bell-outline', label: 'Configurar notificaciones', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Centro de ayuda', onPress: () => {} },
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
  scrollContent: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.blue900 },
  avatarSection: { alignItems: 'center', paddingVertical: 28, backgroundColor: colors.white, marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontFamily: 'Poppins_700Bold', fontSize: 32, color: colors.white },
  userName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.blue900 },
  userRole: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.accent, marginTop: 2 },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.gray500 || '#6B7280', marginTop: 4 },
  menuCard: { backgroundColor: colors.white, marginHorizontal: 20, borderRadius: radii.lg, ...shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.gray700 || '#374151', flex: 1, marginLeft: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, backgroundColor: colors.white, borderRadius: radii.lg, paddingVertical: 16, borderWidth: 1, borderColor: `${colors.error}30` },
  logoutText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.error },
});
