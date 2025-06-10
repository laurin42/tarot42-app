import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useFonts } from "expo-font";
import { SessionProvider } from "../providers/SessionProvider";
import { useNavigationDecision } from "../hooks/navigation/useNavigationDecision";

function AppNavigator() {
  useNavigationDecision();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    FontAwesome: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SessionProvider>
      <AppNavigator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
      </Stack>
    </SessionProvider>
  );
}
