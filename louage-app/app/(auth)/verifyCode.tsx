import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { verifyCode } from '../../services/api';

export default function VerifyCode() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Erreur', 'Veuillez entrer le code !');
      return;
    }

    try {
      setLoading(true);
      await verifyCode(email as string, code);
      router.push({ pathname: '/(auth)/changePassword' as any, params: { email, code } });
    } catch {
      Alert.alert('Erreur', 'Code incorrect ou expire !');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Verification</Text>
        <Text style={styles.title}>Entrez le code recu par email</Text>
        <Text style={styles.subtitle}>Un code a 6 chiffres a ete envoye sur {email}.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Code</Text>
        <TextInput
          style={styles.input}
          placeholder="------"
          placeholderTextColor="#94A3B8"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
        />

        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verifier le code</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4FF',
    padding: 20,
    justifyContent: 'center',
  },
  hero: {
    backgroundColor: '#1E3A8A',
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#BFDBFE',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#DBEAFE',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    color: '#0F172A',
    letterSpacing: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  linkText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
});
