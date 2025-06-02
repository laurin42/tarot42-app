import { Stack, Redirect, useRouter } from "expo-router";
import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { authClient } from "../../lib/auth-client";

export default function IchStackNavigator() {
  const { data: sessionData, isPending: isSessionLoading } =
    authClient.useSession();
  const router = useRouter(); // Keep router if needed for other logic, or remove if only for Redirect

  console.log(
    "[(ich)/_layout.tsx] Rendering. isSessionLoading:",
    isSessionLoading,
    "sessionData (raw):",
    sessionData // Log raw sessionData first
  );
  // Avoid JSON.stringify(null) or JSON.stringify(undefined) causing issues in logs if sessionData is not an object yet
  if (typeof sessionData === "object" && sessionData !== null) {
    console.log(
      "[(ich)/_layout.tsx] sessionData (stringified):",
      JSON.stringify(sessionData)
    );
  } else {
    console.log(
      "[(ich)/_layout.tsx] sessionData is not an object or is null/undefined:",
      sessionData
    );
  }

  if (isSessionLoading) {
    console.log(
      "[(ich)/_layout.tsx] Condition: isSessionLoading is TRUE. Showing loading indicator."
    );
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={{ marginTop: 10 }}>Lade Profil-Setup...</Text>
      </View>
    );
  }

  // This point is reached ONLY if isSessionLoading is FALSE
  console.log("[(ich)/_layout.tsx] Condition: isSessionLoading is FALSE.");

  if (!sessionData) {
    // Check if sessionData object itself is null/undefined
    console.log(
      "[(ich)/_layout.tsx] Condition: !sessionData is TRUE (sessionData is null or undefined). Redirecting to sign-in."
    );
    return <Redirect href="/(auth)/sign-in" />;
  }

  // This point is reached ONLY if isSessionLoading is FALSE AND sessionData is TRUTHY
  console.log(
    "[(ich)/_layout.tsx] Condition: sessionData is TRUTHY. Value (stringified):",
    JSON.stringify(sessionData)
  );

  if (!sessionData.user) {
    // Check if user object within sessionData is null/undefined
    console.log(
      "[(ich)/_layout.tsx] Condition: !sessionData.user is TRUE (user object missing in sessionData). Redirecting to sign-in."
    );
    return <Redirect href="/(auth)/sign-in" />;
  }

  // This point is reached ONLY if isSessionLoading is FALSE AND sessionData is TRUTHY AND sessionData.user is TRUTHY
  console.log(
    "[(ich)/_layout.tsx] Conditions met: Session and user are valid. Rendering Stack."
  );
  return (
    <Stack>
      <Stack.Screen
        name="birthday"
        options={{ title: "Geburtstag & Sternzeichen" }}
      />
      <Stack.Screen name="element" options={{ title: "Elemente Auswahl" }} />
      <Stack.Screen name="details" options={{ title: "Ziele definieren" }} />
    </Stack>
  );
}
