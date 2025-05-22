import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuth } from "../lib/auth-client";
import { View, Text, LogBox } from "react-native";

LogBox.ignoreLogs([
  "SerializableState: Cloned non-serializable state input was determined to be JUMP_TO.",
  "Sending `onAnimatedValueUpdate` with no listeners registered.",
]);

export default function RootLayout() {
  const { data: sessionData, isPending } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isPending) {
      console.log("RootLayout: Auth state is pending...");
      return; // Don't do anything while auth state is loading
    }

    const isUserLoggedIn = !!sessionData?.user;
    const currentRoute = segments.join("/") || "index"; // Fallback for root
    const isAuthRoute = segments[0] === "signIn" || segments[0] === "signUp";
    const isInAppTabs = segments[0] === "(tabs)";

    console.log(
      `RootLayout: Effect running. LoggedIn: ${isUserLoggedIn}, Pending: ${isPending}, Segments: ${segments.join(
        "/"
      )}`
    );

    if (!isUserLoggedIn) {
      // User is not logged in
      if (!isAuthRoute) {
        console.log(
          `RootLayout: User NOT logged in, NOT on auth route (${currentRoute}). Redirecting to /signIn`
        );
        router.replace("/signIn");
      } else {
        console.log(
          `RootLayout: User NOT logged in, IS on auth route (${currentRoute}). No redirect.`
        );
      }
    } else {
      // User is logged in
      if (isAuthRoute) {
        console.log(
          `RootLayout: User IS logged in, IS on auth route (${currentRoute}). Redirecting to /(tabs)`
        );
        router.replace({ pathname: "/(tabs)" } as any);
      } else if (
        !isInAppTabs &&
        segments.length > 0 &&
        segments[0] !== "_sitemap"
      ) {
        // If logged in, but somehow outside of (tabs) and not an auth route (e.g. a malformed URL, or at root)
        // This case might indicate trying to access root '/' directly when logged in.
        // Default to (tabs) if not already there or on a sitemap.
        console.log(
          `RootLayout: User IS logged in, NOT in (tabs) (${currentRoute}). Redirecting to /(tabs)`
        );
        router.replace({ pathname: "/(tabs)" } as any);
      } else {
        console.log(
          `RootLayout: User IS logged in, path (${currentRoute}) is fine. No redirect.`
        );
      }
    }
  }, [sessionData, isPending, segments, router]);

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading Authentication...</Text>
      </View>
    );
  }

  // This Stack navigator defines the main navigation structure.
  // The useEffect above will handle redirecting the user to the correct
  // part of the app (either (tabs) or signIn/signUp) based on their auth state.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      {/* You can add other global screens here, like modals, if needed */}
    </Stack>
  );
}
