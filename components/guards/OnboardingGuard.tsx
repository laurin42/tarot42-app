import React, { ReactNode } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSession } from "../../providers/SessionProvider";
import { useOnboarding } from "../../hooks/useOnboarding";

// Loading Spinner Component
const LoadingSpinner = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#8B5CF6" />
    <Text style={{ marginTop: 10, color: "#666" }}>Prüfe Onboarding...</Text>
  </View>
);

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSession();
  const { shouldShowWelcome, isLoading } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading && shouldShowWelcome) {
      console.log("[OnboardingGuard] Redirecting to welcome");
      router.replace("/(onboarding)/welcome");
    }
  }, [isAuthenticated, shouldShowWelcome, isLoading]);

  if (isLoading) return <LoadingSpinner />;

  return <>{children}</>;
}
