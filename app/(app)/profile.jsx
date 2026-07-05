import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Avatar, List, Switch, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import AppButton from '../../src/components/ui/AppButton';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: 'account-circle', title: 'Mi Perfil', onPress: () => {} },
    { icon: 'cog-outline', title: 'Configuración', onPress: () => {} },
    { icon: 'information-outline', title: 'Acerca de', onPress: () => {} },
    { icon: 'help-circle-outline', title: 'Ayuda', onPress: () => {} },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} color={colors.primary} />
        <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email || 'correo@email.com'}</Text>
      </View>

      <View style={styles.body}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <List.Item
                  title={item.title}
                  left={(props) => <List.Icon {...props} icon={item.icon} color={colors.primary} />}
                  onPress={item.onPress}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                />
                {index < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <List.Item
              title="Notificaciones"
              left={(props) => <List.Icon {...props} icon="bell-outline" color={colors.primary} />}
              right={() => (
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  color={colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        <View style={styles.logoutSection}>
          <AppButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            mode="outlined"
            color={colors.error}
            style={styles.logoutButton}
            labelStyle={{ color: colors.error }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    padding: 24,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
  },
  logoutSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: '#dc3545',
    borderRadius: 12,
  },
});
