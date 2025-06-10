import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "../../lib/auth-client";
import { useOnboarding } from "../../hooks//onboarding/useOnboarding";

export default function WelcomeScreen() {
  const router = useRouter();
  const { data: sessionData, isPending: isSessionLoading } =
    authClient.useSession();
  const { completeOnboarding } = useOnboarding();

  useFocusEffect(
    React.useCallback(() => {
      if (!isSessionLoading && !sessionData?.user) {
        router.replace("/(auth)/sign-in");
      }
    }, [sessionData, isSessionLoading, router])
  );

  const handleStart = () => {
    router.push("/(onboarding)/zodiacSign");
  };

  const handleSkip = async () => {
    try {
      console.log(
        "[WelcomeScreen] User chose to skip onboarding - marking as completed"
      );

      // Markiere das Onboarding als abgeschlossen
      await completeOnboarding();

      console.log(
        "[WelcomeScreen] Onboarding marked as completed, navigating to profile"
      );

      // Navigiere zum Profil
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("[WelcomeScreen] Error completing onboarding:", error);

      // Fallback: Navigiere trotzdem zum Profil
      router.replace("/(tabs)/profile");
    }
  };

  if (isSessionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Lade...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={64} color="#8B5CF6" />
        </View>

        <Text style={styles.title}>Willkommen bei Tarot42!</Text>

        <Text style={styles.subtitle}>
          Lass uns dein persönliches Profil einrichten, um dir die besten und
          personalisiertesten Tarot-Readings zu bieten.
        </Text>

        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Ionicons name="star" size={20} color="#8B5CF6" />
            <Text style={styles.featureText}>Personalisierte Deutungen</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flag" size={20} color="#8B5CF6" />
            <Text style={styles.featureText}>Zielgerichtete Readings</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={20} color="#8B5CF6" />
            <Text style={styles.featureText}>Bessere Einsichten</Text>
          </View>
        </View>

        <Text style={styles.timeInfo}>Dauert nur 2-3 Minuten</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Los geht's! ✨</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Später einrichten</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
  loadingText: {
    color: "#E0E0E0",
    marginTop: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#AEAEAE",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  featureList: {
    alignItems: "flex-start",
    marginBottom: 32,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#E0E0E0",
    marginLeft: 12,
  },
  timeInfo: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  buttonContainer: {
    gap: 12,
  },
  startButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});
