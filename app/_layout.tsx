import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { authClient } from "../lib/auth-client"; // Adjust path as needed
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    FontAwesome: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
    // If you have other fonts, add them here, e.g.:
    // 'Inter-Black': require('../../assets/fonts/Inter-Black.otf'),
  });
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      // offlineAccess: true, // [Android] if you want to enable offline access
      // accountName: '', //
      // iosClientId: '<FROM DEVELOPER CONSOLE>', //
    });
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    console.log(
      "[RootLayout] useEffect triggered. isPending:",
      isPending,
      "Segments:",
      segments.join("/") || "/", // Handle empty segments array for root
      "Session exists:",
      !!session,
      "Error:",
      error ? error.message : null,
      "Fonts loaded:",
      fontsLoaded, // Log font status
      "Font error:",
      fontError ? fontError.message : null // Log font error
    );

    if (isPending || !fontsLoaded) {
      // Wait for fonts to load as well
      console.log(
        "[RootLayout] Session pending or fonts not loaded, returning."
      );
      if (!fontsLoaded && fontError) {
        console.error("[RootLayout] Font loading error:", fontError);
      }
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const currentRoute = segments.join("/") || "/"; // Default to '/' if segments is empty

    if (session && !error) {
      // User is signed in
      console.log(
        `[RootLayout] User is SIGNED IN. Current route: ${currentRoute}`
      );
      if (inAuthGroup) {
        console.log(
          "[RootLayout] User signed in, but in (auth) group. Redirecting to /(tabs)/settings."
        );
        router.replace("/(tabs)/settings");
      } else if (segments.length === 0 || currentRoute === "(tabs)") {
        // If at the very root, or if the route is just "(tabs)" (which can happen initially)
        console.log(
          `[RootLayout] User signed in, at app root or just (tabs). Redirecting to /(tabs)/settings. Current route: ${currentRoute}`
        );
        router.replace("/(tabs)/settings");
      } else {
        console.log(
          `[RootLayout] User signed in, NOT in (auth) group and not at root/generic (tabs). Allowing navigation. Current route: ${currentRoute}`
        );
      }
    } else {
      // User is not signed in (or error fetching session)
      console.log(
        `[RootLayout] User is SIGNED OUT (or error in session). Current route: ${currentRoute}`
      );
      if (!inAuthGroup) {
        console.log(
          "[RootLayout] User signed out, and NOT in (auth) group. Redirecting to /(auth)/sign-in."
        );
        router.replace("/(auth)/sign-in");
      } else {
        console.log(
          "[RootLayout] User signed out, already in (auth) group. No redirect needed."
        );
      }
    }
  }, [session, isPending, error, segments, router, fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    // This can be a very brief state or if fonts are genuinely not loading.
    // You might want to return a loading indicator here if it becomes noticeable.
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(ich)" /> {/* Ensure (ich) group is registered */}
      {/* Add other top-level groups if any, e.g., <Stack.Screen name="modal" /> */}
    </Stack>
  );
}
