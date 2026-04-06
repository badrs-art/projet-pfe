import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoutButton from '../../components/LogoutButton';
import { getTrajets } from '../../services/api';

export default function PassengerHome() {
  const router = useRouter();
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [trajets, setTrajets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const chercher = async () => {
    try {
      setLoading(true);
      const response = await getTrajets(depart, arrivee);
      setTrajets(response.data);

      if (response.data.length === 0) {
        Alert.alert('Info', 'Aucun trajet trouve !');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les trajets !');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Espace passager</Text>
        <Text style={styles.title}>Trouvez un trajet simple, vivant et rassurant</Text>
        <Text style={styles.subtitle}>
          Cherchez votre destination, appelez le chauffeur, puis attendez sa confirmation.
        </Text>
      </View>

      <View style={styles.searchCard}>
        <TextInput
          style={styles.input}
          placeholder="Ville de depart"
          placeholderTextColor="#94A3B8"
          value={depart}
          onChangeText={setDepart}
        />
        <TextInput
          style={styles.input}
          placeholder="Ville d arrivee"
          placeholderTextColor="#94A3B8"
          value={arrivee}
          onChangeText={setArrivee}
        />

        <TouchableOpacity style={styles.button} onPress={chercher} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Rechercher mon trajet</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={trajets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.routeBadge}>
                <Text style={styles.routeBadgeText}>Disponible</Text>
              </View>
              <Text style={styles.price}>{item.prix} DT</Text>
            </View>

            <Text style={styles.trajet}>{item.depart} {'->'} {item.arrivee}</Text>
            <Text style={styles.info}>{item.heure}</Text>
            <Text style={styles.info}>
              {item.places}/{item.placesInitiales || item.places} places restantes
            </Text>
            <Text style={styles.chauffeur}>Chauffeur: {item.chauffeur?.nom} {item.chauffeur?.prenom}</Text>
            <Text style={styles.chauffeur}>Tel: {item.chauffeur?.telephone}</Text>

            <TouchableOpacity
              style={[styles.reserveButton, item.places <= 0 && styles.reserveButtonDisabled]}
              disabled={item.places <= 0}
              onPress={() => router.push({
                pathname: '/(passenger)/booking',
                params: {
                  trajetId: item._id,
                  depart: item.depart,
                  arrivee: item.arrivee,
                  heure: item.heure,
                  prix: item.prix,
                  chauffeur: `${item.chauffeur?.nom} ${item.chauffeur?.prenom}`,
                  telephone: item.chauffeur?.telephone,
                  chauffeurId: item.chauffeur?._id,
                  places: item.places,
                },
              })}
            >
              <Text style={styles.reserveText}>{item.places <= 0 ? 'Complet' : 'Voir et appeler'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Faites une recherche pour afficher les trajets.</Text>}
        ListFooterComponent={<LogoutButton />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F1',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hero: {
    backgroundColor: '#7C2D12',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#FED7AA',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFEDD5',
    fontSize: 15,
    lineHeight: 22,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#7C2D12',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  input: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#431407',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeBadge: {
    backgroundColor: '#FFEDD5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  routeBadgeText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '800',
  },
  price: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },
  trajet: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  info: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 5,
  },
  chauffeur: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 4,
  },
  reserveButton: {
    backgroundColor: '#0F766E',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  reserveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  reserveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    marginTop: 40,
  },
});
