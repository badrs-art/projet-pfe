import { Stack } from 'expo-router';

export default function PassengerLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Chercher un trajet' }} />
      <Stack.Screen name="booking" options={{ title: 'Réserver' }} />
    </Stack>
  );
}