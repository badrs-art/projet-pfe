import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const FALLBACK_IP = '10.245.101.180';

const normalizeApiUrl = (value) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.endsWith('/api') ? trimmedValue : `${trimmedValue.replace(/\/+$/, '')}/api`;
};

const getExpoHost = () => {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    Constants.manifest?.debuggerHost,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate.split(':')[0];
    }
  }

  return null;
};

const resolveApiUrl = () => {
  const explicitUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl);
  if (explicitUrl) {
    return explicitUrl;
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  return `http://${FALLBACK_IP}:5000/api`;
};

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Le serveur met trop de temps a repondre.';
  }

  if (error?.message === 'Network Error') {
    return `Serveur inaccessible. Verifiez que le backend tourne bien sur ${API_URL}.`;
  }

  return fallbackMessage;
};

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

export const getTrajets = (depart, arrivee, includeInactive = false) =>
  api.get('/trajets', { params: { depart, arrivee, includeInactive } });

export const addTrajet = (data, token) =>
  api.post('/trajets', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const submitReservationRequest = (id, token) =>
  api.post(
    `/trajets/${id}/demander`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const decideReservationRequest = (trajetId, passagerId, decision, token) =>
  api.patch(
    `/trajets/${trajetId}/demandes/${passagerId}`,
    { decision },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const updatePlaces = (trajetId, action, token) =>
  api.patch(
    `/trajets/${trajetId}/places`,
    { action },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const deleteTrajet = (id, token) =>
  api.delete(`/trajets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendCode = (email) => api.post('/reset/send-code', { email });
export const verifyCode = (email, code) => api.post('/reset/verify-code', { email, code });
export const changePassword = (email, code, newPassword) =>
  api.post('/reset/change-password', { email, code, newPassword });

export const addAvis = (data, token) =>
  api.post('/avis', data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAvis = (chauffeurId) => api.get(`/avis/${chauffeurId}`);
