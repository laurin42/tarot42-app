import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { authClient } from "../lib/auth-client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type { User } from "better-auth";
import { APIError as BetterAuthAPIError } from "better-auth/api";

// Adjusted ClientErrorContext for more clarity
interface BetterAuthErrorWithType extends BetterAuthAPIError {
  message: string; // Ensure message is part of the type
  code?: string;
  httpStatus?: number; // Renamed from status to avoid conflict
}

// It seems the onError callback might provide an object with an error property
interface ErrorContextCallback {
  error: BetterAuthErrorWithType | Error | null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emailText: {
    fontSize: 18,
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const {
    data: sessionData,
    isPending: isSessionLoading,
    error: sessionError, // sessionError can be an Error object or a custom error from better-auth
  } = authClient.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionData) {
      setUser(sessionData.user);
    } else if (!isSessionLoading && !sessionData && !sessionError) {
      router.replace("/sign-in" as Href);
    }
  }, [sessionData, isSessionLoading, sessionError, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signOut();
    } catch (e: any) {
      setError(e.message || "Logout failed");
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Konto löschen",
      "Sind Sie sicher, dass Sie Ihr Konto endgültig löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setError(null);
            try {
              console.log(
                "[HomeScreen] Attempting to delete account via better-auth..."
              );
              await authClient.deleteUser(
                {},
                {
                  onSuccess: async () => {
                    console.log(
                      "[HomeScreen] Account deletion via better-auth successful."
                    );
                    try {
                      console.log(
                        "[HomeScreen] Attempting to revoke Google access..."
                      );
                      await GoogleSignin.revokeAccess();
                      console.log(
                        "[HomeScreen] Google access revoked successfully."
                      );
                      console.log(
                        "[HomeScreen] Attempting to sign out from Google..."
                      );
                      await GoogleSignin.signOut();
                      console.log(
                        "[HomeScreen] Signed out from Google successfully."
                      );
                      console.log(
                        "[HomeScreen] Attempting to sign out from authClient..."
                      );
                      await authClient.signOut(); // Explicitly sign out from better-auth
                      console.log(
                        "[HomeScreen] Signed out from authClient successfully."
                      );
                    } catch (logoutError: any) {
                      console.error(
                        "[HomeScreen] Error during Google or authClient sign out/revoke access:",
                        logoutError
                      );
                      // Even if logout fails, the primary account is deleted.
                      // The App.tsx should still redirect based on the (now likely invalid) session.
                      // setError might be useful here, but navigation state is primary.
                    }
                    // REMOVED: router.replace("/sign-in?accountDeleted=true" as Href);
                    // App.tsx will handle the redirection based on session state change.
                    // Set isLoading to false here if no further navigation is done by this component.
                    // However, the component will likely be unmounted by App.tsx.
                    // For safety, ensure loading state is managed if an error above occurs and doesn't navigate.
                    // If all signouts are successful, App.tsx will redirect.
                    // If there's an error during signout, the catch block for authClient.deleteUser
                    // or this inner catch block will handle setError and setIsLoading.
                  },
                  onError: (context: ErrorContextCallback) => {
                    console.error(
                      "[HomeScreen] Account deletion failed via authClient.deleteUser error callback:",
                      context.error
                    );
                    let message = "Kontolöschung fehlgeschlagen.";
                    if (context.error && context.error.message) {
                      message = context.error.message;
                    }
                    setError(message);
                    setIsLoading(false);
                  },
                }
              );
            } catch (e: any) {
              console.error(
                "[HomeScreen] Unexpected error during handleDeleteAccount:",
                e
              );
              setError(
                e.message ||
                  "Ein unerwarteter Fehler ist bei der Kontolöschung aufgetreten."
              );
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isSessionLoading || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (sessionError) {
    let displayMessage = "Unbekannter Session-Fehler.";
    if (
      typeof sessionError === "object" &&
      sessionError !== null &&
      "message" in sessionError &&
      typeof sessionError.message === "string"
    ) {
      displayMessage = sessionError.message;
    } else if (typeof sessionError === "string") {
      displayMessage = sessionError;
    }
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session-Fehler: {displayMessage}</Text>
        <Button
          title="Zum Login"
          onPress={() => router.replace("/sign-in" as Href)}
        />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>
          Keine Benutzerdaten gefunden oder Fehler. Bitte erneut anmelden.
        </Text>
        <Button
          title="Zum Login"
          onPress={() => router.replace("/sign-in" as Href)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen!</Text>
      <Text style={styles.emailText}>Eingeloggt als: {user.email}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button title="Logout" onPress={handleLogout} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Konto löschen" onPress={handleDeleteAccount} color="red" />
    </View>
  );
}
