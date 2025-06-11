import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { DeviceEventEmitter } from "react-native";


const backendBaseURL = Platform.OS === 'web'
    ? "http://localhost:3000/api/auth"
    : "http://192.168.178.67:3000/api/auth";

// API_URL for non-auth endpoints
export const API_BASE_URL = Platform.OS === 'web'
    ? "http://localhost:3000"
    : "http://192.168.178.67:3000";

// Make this key exportable to ensure consistency across the app
export const SECURE_STORE_BEARER_TOKEN_KEY = 'tarot42.bearerAuthToken';

const signalUnauthorizedAccess = () => {
    console.log('[auth-client] Signaling unauthorized access to the app.');
    // Sende ein globales Event. Der SessionProvider wird darauf hören.
    DeviceEventEmitter.emit('auth-token-invalid', {});
}

export const authClient = createAuthClient({
    baseURL: backendBaseURL,
    plugins: [
        expoClient({ // For OAuth handling if needed, and potentially other Expo-specific integrations
            scheme: "tarot42",
            storagePrefix: "tarot42", // Recommended by expoClient
            storage: SecureStore, // expoClient can use SecureStore for its needs
        }),
    ],
    fetchOptions: {
        auth: {
           type: "Bearer",
           token: async () => {
                console.log(`[authClient] Attempting to get token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
                const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
                console.log('[authClient fetchOptions.auth.token] Retrieved token:', token ? token.substring(0,10) + "..." : null);
                return token || ""; // Must return string, so empty string if null
           }
        },
        onSuccess: async (ctx) => {
            // This will be called for any successful request made by authClient itself (e.g. signIn, signUp, getSession).
            const authToken = ctx.response?.headers?.get("set-auth-token");
            if (authToken) {
                console.log(`[authClient] Attempting to set token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
                await SecureStore.setItemAsync(SECURE_STORE_BEARER_TOKEN_KEY, authToken);
                console.log('[authClient fetchOptions.onSuccess] Stored token from "set-auth-token" header:', authToken.substring(0, 30) + "...");
            }
        },
        onError: async (ctx) => {
            // This will be called for any failed request made by authClient itself.
            if (ctx.response?.status === 401) {
                console.log(`[authClient] Attempting to get token (before delete) with key: ${SECURE_STORE_BEARER_TOKEN_KEY} due to 401`);
                const currentToken = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
                if (currentToken) { // Only clear if a token was present
                    console.log(`[authClient] Attempting to delete token with key: ${SECURE_STORE_BEARER_TOKEN_KEY} due to 401`);
                    await SecureStore.deleteItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
                    console.log('[authClient fetchOptions.onError] Cleared token due to 401 on authClient request.');
                    signalUnauthorizedAccess();
                }
            }

        }
    }
});

// Helper function to explicitly get the stored token if needed outside authClient's direct calls
export const getStoredBearerToken = async (): Promise<string | null> => {
    console.log(`[getStoredBearerToken] Attempting to get token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
    const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
    console.log(`[getStoredBearerToken] Retrieved token:`, token ? token.substring(0,10) + "..." : null);
    return token;
};

// Helper function to explicitly clear the token (e.g., on user-initiated logout)
export const clearStoredBearerToken = async (): Promise<void> => {
    console.log(`[clearStoredBearerToken] Attempting to get token (before delete) with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
    const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
    if (token) {
        console.log(`[clearStoredBearerToken] Attempting to delete token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
        await SecureStore.deleteItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
        console.log('[clearStoredBearerToken] Token cleared from SecureStore.');
    }
    try {
        await authClient.signOut({ fetchOptions: { onSuccess: () => console.log("Signed out from authClient after clearing token.")}});
    } catch (e) {
        console.warn("Error signing out from authClient during token clear:", e);
    }
};


export const fetchProtectedData = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getStoredBearerToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    console.log(`[fetchProtectedData] Fetching ${API_BASE_URL}${endpoint} with token: ${token ? 'Present' : 'Absent'}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle 401 for these custom fetch calls specifically if needed
    if (!response.ok && response.status === 401 && token) {
        console.log(`[fetchProtectedData] Received 401 for ${endpoint}. Token might be invalid/expired.`);
        signalUnauthorizedAccess();
    }
    return response;
};

export const storeTokenFromHeaders = async (headers: Headers) => {
    const authToken = headers.get("set-auth-token");
    if (authToken) {
        console.log(`[storeTokenFromHeaders] Attempting to set token with key: ${SECURE_STORE_BEARER_TOKEN_KEY}`);
        await SecureStore.setItemAsync(SECURE_STORE_BEARER_TOKEN_KEY, authToken);
        console.log('[storeTokenFromHeaders] Explicitly stored token via "set-auth-token" header:', authToken.substring(0,30) + "...");
    } else {
        console.log('[storeTokenFromHeaders] "set-auth-token" header not found for explicit storage.');
    }
};