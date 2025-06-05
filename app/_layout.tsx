// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useFonts } from "expo-font";
import { SessionProvider, useSession } from "../providers/SessionProvider";
import { useOnboarding } from "../hooks/onboarding/useOnboarding";

// Routing Logic Component (inside SessionProvider)
function AppNavigator() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  // Hole isOnboardingCompleted (umbenannt zu actualOnboardingCompleted für Klarheit)
  // UND shouldShowWelcome separat vom useOnboarding Hook
  const {
    isOnboardingCompleted: actualOnboardingCompleted,
    shouldShowWelcome,
    isLoading: onboardingLoading,
  } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Warte, bis Session und Onboarding-Status geladen sind
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
      actualOnboardingCompleted, // Logge den tatsächlichen Abschluss-Status
      shouldShowWelcome, // Für spezielle Welcome-Logik
      inAuthGroup,
      inOnboardingGroup,
      currentRoute,
    });

    if (isAuthenticated) {
      // Benutzer ist angemeldet
      if (inAuthGroup) {
        // Benutzer ist in der Auth-Gruppe (z.B. kommt gerade vom Login)
        if (!actualOnboardingCompleted) {
          // Onboarding ist NICHT abgeschlossen
          console.log(
            "[AppNavigator] Authenticated, Onboarding INCOMPLETE: Redirecting to welcome"
          );
          // Leite zum Welcome-Screen oder zum ersten Schritt des Onboardings
          // shouldShowWelcome könnte hier verwendet werden, um zu entscheiden, ob /welcome oder ein anderer Screen gezeigt wird
          router.replace(
            shouldShowWelcome
              ? "/(onboarding)/welcome"
              : "/(onboarding)/zodiacSign"
          ); // Beispiel
        } else {
          // Onboarding IST abgeschlossen
          console.log(
            "[AppNavigator] Authenticated, Onboarding COMPLETE: Redirecting to profile"
          );
          router.replace("/(tabs)/profile");
        }
      } else if (inOnboardingGroup) {
        // Benutzer befindet sich BEREITS in einer Onboarding-Route
        if (actualOnboardingCompleted) {
          // Und das Onboarding wird JETZT als abgeschlossen erkannt
          console.log(
            "[AppNavigator] ✅ User in onboarding, now COMPLETE: Redirecting to profile"
          );
          router.replace("/(tabs)/profile");
        }
        // ANSONSTEN: Benutzer ist in der Onboarding-Gruppe und Onboarding ist NICHT abgeschlossen.
        // -> Hier passiert nichts, der Benutzer darf im Onboarding-Flow bleiben und navigieren.
      } else if (
        segments.length === 0 ||
        currentRoute === "/" ||
        currentRoute === "(tabs)"
      ) {
        // Benutzer ist am Root der App ('/') oder bereits im (tabs)-Bereich
        if (!actualOnboardingCompleted) {
          // Onboarding ist aber noch nicht abgeschlossen
          console.log(
            "[AppNavigator] User at root/tabs but Onboarding INCOMPLETE: Redirecting to welcome/onboarding"
          );
          router.replace(
            shouldShowWelcome
              ? "/(onboarding)/welcome"
              : "/(onboarding)/zodiacSign"
          ); // Beispiel
        } else if (segments.length === 0 || currentRoute === "/") {
          // Benutzer ist am Root UND Onboarding ist abgeschlossen
          console.log(
            "[AppNavigator] User at root and Onboarding COMPLETE: Redirecting to profile"
          );
          router.replace("/(tabs)/profile");
        }
        // Sonst: Benutzer ist in (tabs) und Onboarding ist abgeschlossen -> alles gut, bleibe dort.
      }
      // Hier könnten weitere `else if`-Bedingungen für andere Routen-Gruppen stehen, falls nötig
    } else {
      // Benutzer ist NICHT angemeldet
      if (!inAuthGroup) {
        // Und befindet sich nicht bereits in der Auth-Gruppe
        console.log(
          "[AppNavigator] 🔐 Not authenticated: Redirecting to sign-in"
        );
        router.replace("/(auth)/sign-in");
      }
    }
  }, [
    isAuthenticated,
    actualOnboardingCompleted, // Als Hauptkriterium für "abgeschlossen"
    shouldShowWelcome, // Für die initiale Welcome-Logik
    sessionLoading,
    onboardingLoading,
    segments,
    router,
  ]);

  return null; // Diese Komponente rendert keine UI, sie kümmert sich nur um die Navigation
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
