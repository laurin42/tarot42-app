import { Stack } from "expo-router";
import React from "react";
import { AuthGuard } from "../../components/guards/AuthGard";

export default function IchStackNavigator() {
  return (
    <AuthGuard>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{ title: "Willkommen bei Tarot42" }}
        />
        <Stack.Screen
          name="zodiacSign"
          options={{ title: "Geburtstag & Sternzeichen" }}
        />
        <Stack.Screen name="element" options={{ title: "Elemente Auswahl" }} />
        <Stack.Screen name="goals" options={{ title: "Ziele definieren" }} />
      </Stack>
    </AuthGuard>
  );
}
