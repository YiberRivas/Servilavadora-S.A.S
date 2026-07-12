import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="company-detail" />
      <Stack.Screen name="request-service" />
    </Stack>
  );
}
