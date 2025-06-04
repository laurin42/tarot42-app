import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useFonts } from "expo-font";
import { SessionProvider, useSession } from "../providers/SessionProvider";
import { useOnboarding } from "../hooks/useOnboarding";

// Routing Logic Component (inside SessionProvider)
function AppNavigator() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { shouldShowWelcome, isLoading: onboardingLoading } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait for both session and onboarding to load
    if (sessionLoading || onboardingLoading) {
      console.log("[AppNavigator] Loading...", {
        sessionLoading,
        onboardingLoading,
      });
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const currentRoute = segments.join("/") || "/";

    console.log("[AppNavigator] Routing decision:", {
      isAuthenticated,
      shouldShowWelcome,
      inAuthGroup,
      inOnboardingGroup,
      currentRoute,
    });

    if (isAuthenticated) {
      // User is signed in
      if (inAuthGroup) {
        // User logged in but in auth group
        if (shouldShowWelcome) {
          console.log("[AppNavigator] 🎉 NEW USER: Redirecting to welcome");
          router.replace("/(onboarding)/welcome");
        } else {
          console.log(
            "[AppNavigator] 👤 EXISTING USER: Redirecting to profile"
          );
          router.replace("/(tabs)/profile");
        }
      } else if (segments.length === 0 || currentRoute === "(tabs)") {
        // User at root
        if (shouldShowWelcome) {
          console.log(
            "[AppNavigator] 🎉 NEW USER AT ROOT: Redirecting to welcome"
          );
          router.replace("/(onboarding)/welcome");
        } else {
          console.log(
            "[AppNavigator] 👤 EXISTING USER AT ROOT: Redirecting to profile"
          );
          router.replace("/(tabs)/profile");
        }
      } else if (inOnboardingGroup && !shouldShowWelcome) {
        // User in onboarding but shouldn't be
        console.log(
          "[AppNavigator] ❌ User completed onboarding: Redirecting to profile"
        );
        router.replace("/(tabs)/profile");
      }
      // else: let user navigate freely
    } else {
      // User not signed in
      if (!inAuthGroup) {
        console.log(
          "[AppNavigator] 🔐 Not authenticated: Redirecting to sign-in"
        );
        router.replace("/(auth)/sign-in");
      }
    }
  }, [
    isAuthenticated,
    shouldShowWelcome,
    sessionLoading,
    onboardingLoading,
    segments,
    router,
  ]);

  return null; // This component only handles routing
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
