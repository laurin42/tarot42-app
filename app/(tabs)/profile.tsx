import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth-client"; // Corrected import for useAuth
import { authClient } from "../../lib/auth-client";

// You might need to redefine BetterAuthErrorWithType or import it if it's shared
interface BetterAuthErrorWithType extends Error {
  message: string;
  code?: string;
  httpStatus?: number;
}

export default function ProfileScreen() {
  const { data: sessionData, isPending } = useAuth(); // Get sessionData and isPending
  const router = useRouter();

  const user = sessionData?.user; // Derive user from sessionData

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace({ pathname: "/signIn" }); // Use object notation for path
    } catch (error) {
      const e = error as BetterAuthErrorWithType;
      console.error("Logout failed:", e.message, e.code);
      alert(`Logout failed: ${e.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authClient.deleteUser();
      alert("Account deletion successful. You will be logged out.");
      await authClient.signOut();
      router.replace({
        pathname: "/signIn",
        params: {
          accountDeleted: "Your account has been successfully deleted.",
        },
      });
    } catch (error) {
      const e = error as BetterAuthErrorWithType;
      console.error("Delete account failed:", e.message, e.code);
      if (e.code === "REQUIRES_RECENT_LOGIN") {
        alert(
          "This operation requires a recent login. Please sign out and sign back in."
        );
      } else {
        alert(`Delete account failed: ${e.message}`);
      }
    }
  };

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <Text>Welcome, {user.email || "User"}!</Text>
      ) : (
        <Text>Not logged in. Please sign in.</Text> // More informative message
      )}
      {user && ( // Only show buttons if user is logged in
        <>
          <View style={styles.buttonContainer}>
            <Button title="Logout" onPress={handleLogout} color="#FF6347" />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Delete Account"
              onPress={handleDeleteAccount}
              color="#FF0000"
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
    width: "80%",
  },
});
