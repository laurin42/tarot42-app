import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
 
// Use direct connections - no ngrok
const backendBaseURL = Platform.OS === 'web' 
    ? "http://localhost:3000/api/auth" 
    : "http://192.168.178.67:3000/api/auth";

const client = createAuthClient({
    baseURL: backendBaseURL, /* Base URL of Better Auth backend. */
    plugins: [
        expoClient({
            scheme: "tarot42",
            storagePrefix: "tarot42",
            storage: SecureStore,
        })
    ]
});

export const authClient = client;
export const useAuth = client.useSession; // Export useSession as useAuth