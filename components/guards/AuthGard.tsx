import React, { ReactNode } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSession } from "../../providers/SessionProvider";

// Loading Spinner Component
const LoadingSpinner = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#8B5CF6" />
    <Text style={{ marginTop: 10, color: "#666" }}>Lade...</Text>
  </View>
);

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[AuthGuard] Redirecting to sign-in");
      router.replace("/(auth)/sign-in");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
