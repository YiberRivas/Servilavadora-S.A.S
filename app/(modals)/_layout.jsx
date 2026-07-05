import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ModalsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontWeight: '700' },
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="company-detail" options={{ title: 'Detalle Empresa' }} />
      <Stack.Screen name="request-service" options={{ title: 'Solicitar Servicio' }} />
    </Stack>
  );
}
