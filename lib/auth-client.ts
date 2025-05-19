import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
 
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000/api/auth", /* Base URL of Better Auth backend. */
    plugins: [
        expoClient({
            scheme: "myapp",
            storagePrefix: "myapp",
            storage: SecureStore,
        })
    ]
});