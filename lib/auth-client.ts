import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
 
export const authClient = createAuthClient({
    baseURL: "http://192.168.2.187:3000/api/auth", /* Base URL of Better Auth backend. */
    plugins: [
        expoClient({
            scheme: "tarot42",
            storagePrefix: "tarot42",
            storage: SecureStore,
        })
    ]
});