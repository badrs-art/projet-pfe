import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getApiErrorMessage, register } from '../../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('passager');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nom || !prenom || !telephone || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs !');
      return;
    }

    try {
      setLoading(true);
      await register({ nom, prenom, telephone, email, password, role });
      Alert.alert('Succes', 'Compte cree avec succes !', [
        { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
      ]);
    } catch (error) {
      Alert.alert('Erreur', getApiErrorMessage(error, 'Email deja utilise ou erreur serveur !'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Bienvenue</Text>
        <Text style={styles.title}>Creez votre espace en quelques secondes</Text>
        <Text style={styles.subtitle}>Choisissez votre role et rejoignez une application plus vivante et plus claire.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nom</Text>
        <TextInput style={styles.input} placeholder="Votre nom" placeholderTextColor="#94A3B8" value={nom} onChangeText={setNom} />

        <Text style={styles.label}>Prenom</Text>
        <TextInput style={styles.input} placeholder="Votre prenom" placeholderTextColor="#94A3B8" value={prenom} onChangeText={setPrenom} />

        <Text style={styles.label}>Telephone</Text>
        <TextInput style={styles.input} placeholder="Votre numero" placeholderTextColor="#94A3B8" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Votre email" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput style={styles.input} placeholder="Choisissez un mot de passe" placeholderTextColor="#94A3B8" value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Je suis</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === 'passager' && styles.rolePassenger]} onPress={() => setRole('passager')}>
            <Text style={[styles.roleText, role === 'passager' && styles.roleTextActive]}>Passager</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === 'chauffeur' && styles.roleDriver]} onPress={() => setRole('chauffeur')}>
            <Text style={[styles.roleText, role === 'chauffeur' && styles.roleTextActive]}>Chauffeur</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Creer mon compte</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>J ai deja un compte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EEF4FF',
    padding: 20,
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
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  rolePassenger: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  roleDriver: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  roleText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
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
