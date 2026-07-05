import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
