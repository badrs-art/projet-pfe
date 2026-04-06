import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      <Stack.Screen name="forgotPassword" options={{ title: 'Mot de passe oublié' }} />
      <Stack.Screen name="verifyCode" options={{ title: 'Vérification' }} />
      <Stack.Screen name="changePassword" options={{ title: 'Nouveau mot de passe' }} />
    </Stack>
  );
}