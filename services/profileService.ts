import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SECURE_STORE_BEARER_TOKEN_KEY } from '../constants/profileConstants'; 
import { ProfileData, UpdateUserProfilePayload } from '../types/profile'; 


export async function fetchUserProfile(): Promise<ProfileData | null> {
  const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
  if (!token) {
    console.log("[profileService] No auth token found for fetching profile.");
    return null; 
  }

  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    console.log("[profileService] No existing profile found (404).");
    return null; // Kein Profil vorhanden ist ein gültiger Fall.
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Fehler beim Laden des Profils.');
  }
  return response.json();
}

export async function updateUserProfile(profileData: UpdateUserProfilePayload): Promise<any> { // Rückgabetyp anpassen
  const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
  if (!token) {
    throw new Error('Authentifizierungstoken nicht gefunden für Profil-Update.');
  }

  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Fehler beim Speichern des Profils.');
  }
  return response.json(); 
}