import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LogoutButton from '../../components/LogoutButton';
import { decideReservationRequest, deleteTrajet, getTrajets, updatePlaces } from '../../services/api';

export default function DriverHome() {
  const router = useRouter();
  const [trajets, setTrajets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const chargerTrajets = useCallback(async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr || '{}');
      const response = await getTrajets('', '', true);
      const mesTrajets = response.data.filter((trajet: any) => trajet.chauffeur?._id === user.id);
      setTrajets(mesTrajets);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les trajets !');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      chargerTrajets();
      const interval = setInterval(chargerTrajets, 5000);
      return () => clearInterval(interval);
    }, [chargerTrajets])
  );

  const handleDelete = async (id: string) => {
    Alert.alert('Confirmation', 'Supprimer ce trajet ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await deleteTrajet(id, token);
            setTrajets((prev) => prev.filter((trajet) => trajet._id !== id));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer !');
          }
        },
      },
    ]);
  };

  const handleDecision = async (trajetId: string, passagerId: string, decision: 'accept' | 'reject') => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await decideReservationRequest(trajetId, passagerId, decision, token);
      setTrajets((prev) => prev.map((trajet) => (trajet._id === trajetId ? response.data.trajet : trajet)));

      if (decision === 'accept') {
        const emailStatus = response.data.emailStatus;
        if (emailStatus?.sent) {
          Alert.alert('Confirme', 'Passager confirme et ticket envoye par email.');
        } else {
          Alert.alert('Confirme', 'Passager confirme. Email non envoye: ' + (emailStatus?.reason || 'configuration manquante'));
        }
      } else {
        Alert.alert('Refuse', 'La demande a ete refusee.');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de traiter la demande.');
    }
  };

  const handlePlaces = async (trajetId: string, action: 'increase' | 'decrease') => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await updatePlaces(trajetId, action, token);
      setTrajets((prev) => prev.map((trajet) => (trajet._id === trajetId ? response.data.trajet : trajet)));
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de modifier les places.');
    }
  };

  const renderDemande = (trajetId: string, demande: any) => (
    <View key={`${trajetId}-${demande.passager}`} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>{demande.nom} {demande.prenom}</Text>
        <Text style={[styles.requestBadge, demande.status === 'pending' ? styles.pending : demande.status === 'confirmed' ? styles.confirmed : styles.rejected]}>
          {demande.status}
        </Text>
      </View>
      <Text style={styles.requestMeta}>{demande.telephone || 'Telephone indisponible'}</Text>
      <Text style={styles.requestMeta}>{demande.email || 'Email indisponible'}</Text>

      {demande.status === 'pending' ? (
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.rejectButton} onPress={() => handleDecision(trajetId, demande.passager, 'reject')}>
            <Text style={styles.rejectButtonText}>- Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={() => handleDecision(trajetId, demande.passager, 'accept')}>
            <Text style={styles.confirmButtonText}>+ Confirmer</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Espace chauffeur</Text>
        <Text style={styles.title}>Gerez vos demandes et vos places en direct</Text>
        <Text style={styles.subtitle}>
          Chaque passager vous appelle d abord. Ensuite vous confirmez ou refusez selon votre decision.
        </Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(driver)/addTrip')}>
        <Text style={styles.addButtonText}>Publier un nouveau trajet</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#1E88E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={trajets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const demandes = (item.demandes || []).filter((demande: any) => demande.status === 'pending');
            const confirmed = (item.demandes || []).filter((demande: any) => demande.status === 'confirmed').length;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.trajet}>{item.depart} {'->'} {item.arrivee}</Text>
                    <Text style={styles.info}>{item.heure}  |  {item.prix} DT</Text>
                  </View>
                  <Text style={[styles.statusPill, item.statut === 'actif' ? styles.actif : styles.complet]}>
                    {item.statut}
                  </Text>
                </View>

                <View style={styles.placesPanel}>
                  <Text style={styles.placesLabel}>Places restantes</Text>
                  <View style={styles.placesControls}>
                    <TouchableOpacity style={styles.placeButtonMuted} onPress={() => handlePlaces(item._id, 'decrease')}>
                      <Text style={styles.placeButtonMutedText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.placesValue}>{item.places}</Text>
                    <TouchableOpacity style={styles.placeButton} onPress={() => handlePlaces(item._id, 'increase')}>
                      <Text style={styles.placeButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <Text style={styles.statText}>Places initiales: {item.placesInitiales || item.places}</Text>
                  <Text style={styles.statText}>Confirmes: {confirmed}</Text>
                  <Text style={styles.statText}>Demandes: {demandes.length}</Text>
                </View>

                <Text style={styles.sectionTitle}>Demandes en attente</Text>
                {demandes.length > 0 ? (
                  <View style={styles.requestList}>{demandes.map((demande: any) => renderDemande(item._id, demande))}</View>
                ) : (
                  <Text style={styles.emptyInline}>Aucune demande en attente pour ce trajet.</Text>
                )}

                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
                  <Text style={styles.deleteText}>Supprimer le trajet</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>Aucun trajet publie pour l instant.</Text>}
          ListFooterComponent={<LogoutButton />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hero: {
    backgroundColor: '#0B1F3A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#93C5FD',
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
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  addButtonText: {
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
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  trajet: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  info: {
    color: '#475569',
    fontSize: 14,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '800',
    overflow: 'hidden',
  },
  actif: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  complet: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  placesPanel: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  placesLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 10,
  },
  placesControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  placeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonMuted: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: -2,
  },
  placeButtonMutedText: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: '800',
    marginTop: -2,
  },
  placesValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 48,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statText: {
    fontSize: 13,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  requestList: {
    gap: 10,
  },
  requestCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  requestBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  confirmed: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  rejected: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  requestMeta: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#B91C1C',
    fontWeight: '800',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  emptyInline: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '800',
  },
  empty: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    marginTop: 40,
  },
});
