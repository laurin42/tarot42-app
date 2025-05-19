import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { authClient } from "../lib/auth-client";

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function HomeScreen() {
  const { data: session, error } = authClient.useSession();

  if (session === undefined) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Fehler beim Laden: {error.message}</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text>Kein eingeloggter User</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Logout fehlgeschlagen", error);
    }
  };

  const userName = session?.user?.name || session?.user?.email || "User";

  return (
    <View style={styles.centered}>
      <Text>Willkommen, {userName}!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
