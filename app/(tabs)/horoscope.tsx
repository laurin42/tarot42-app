import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Href, useRouter } from "expo-router";
import { authClient } from "../../lib/auth-client"; // Adjusted path

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

export default function TabHomeScreen() {
  // Renamed component
  const router = useRouter();
  const {
    data: sessionData,
    isPending: isSessionLoading,
    error: sessionError,
  } = authClient.useSession();
  const [user, setUser] = useState<any | null>(null); // Using 'any' for user type for robustness here. Ideally, this type comes from authClient.
  const [isLoading, setIsLoading] = useState(false); // This is the general loading state for the screen.

  useEffect(() => {
    if (sessionData) {
      setUser(sessionData.user);
    } else if (!isSessionLoading && !sessionData && !sessionError) {
      // If sessionData is not available and loading is done, redirect to sign-in
      console.log("No session data found, redirecting to sign-in.");
      router.replace("/(auth)/sign-in");
    }
  }, [sessionData, isSessionLoading, sessionError, router]);

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
      typeof (sessionError as any).message === "string"
    ) {
      displayMessage = (sessionError as any).message;
    } else if (typeof sessionError === "string") {
      displayMessage = sessionError;
    }
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session-Fehler: {displayMessage}</Text>
        {/* Button to go to login might not be needed if root layout handles it */}
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>
          Keine Benutzerdaten gefunden oder Fehler. Bitte erneut anmelden.
        </Text>
        {/* Button to go to login might not be needed if root layout handles it */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen!</Text>
      <Text style={styles.emailText}>
        Eingeloggt als:{" "}
        {user && user.email ? user.email : "E-Mail nicht verfügbar"}
      </Text>
      {/* Removed error display: {error && <Text style={styles.errorText}>{error}</Text>} */}
      {/* Comments about removed buttons are fine */}
    </View>
  );
}
