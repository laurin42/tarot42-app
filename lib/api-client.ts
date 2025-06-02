import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, SECURE_STORE_BEARER_TOKEN_KEY } from "./auth-client";

export async function authorizedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  console.log(`[authorizedFetch] Attempting to get token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
  const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
  console.log(`[authorizedFetch] Retrieved token for endpoint ${endpoint}:`, token ? token.substring(0,10) + "..." : null);
  if (!token) throw new Error("Kein Token vorhanden. Bitte neu einloggen.");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
