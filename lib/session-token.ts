import * as SecureStore from "expo-secure-store";
import { SECURE_STORE_BEARER_TOKEN_KEY } from "./auth-client";

export async function getSessionToken() {
    try {
      console.log(`[getSessionToken] Attempting to get token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
      const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
      console.log(`[getSessionToken] Retrieved token:`, token ? token.substring(0,10) + "..." : null);
      return token;
    } catch (err) {
      console.error("Fehler beim Laden des Tokens:", err);
      return null;
    }
  }
  