import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { styles } from "../../styles/ElementScreen";
import { FontAwesome } from "@expo/vector-icons";
import { authClient } from "../../lib/auth-client";

const ELEMENTS = [
  { name: "Feuer", icon: "fire", color: "#FF6B6B" },
  { name: "Wasser", icon: "tint", color: "#4ECDC4" },
  { name: "Luft", icon: "leaf", color: "#F7FFF7" },
  { name: "Erde", icon: "globe", color: "#FFE66D" },
];

export default function ElementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { zodiacSign } = params;

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: sessionData, isPending: isSessionStillLoading } =
    authClient.useSession();

  useFocusEffect(
    React.useCallback(() => {
      console.log("ElementScreen focused");
      console.log("Received zodiacSign:", zodiacSign);
      if (!isSessionStillLoading && !sessionData?.user) {
        console.log("ElementScreen: No user session, redirecting to sign-in.");
        router.replace("/(auth)/sign-in");
      }
    }, [sessionData, isSessionStillLoading, router, zodiacSign])
  );

  const handleSelectElement = (elementName: string) => {
    setSelectedElement(elementName);
  };

  const saveElementToBackend = async (element: string) => {
    if (!sessionData?.user) {
      throw new Error("Keine gültige Sitzung gefunden");
    }

    try {
      // Get current session token from authClient
      const sessionToken = sessionData.session?.token;
      if (!sessionToken) {
        throw new Error("Kein Session-Token gefunden");
      }

      // Use the same base URL that works for GET requests
      const baseUrl =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.178.67:3000";
      const url = `${baseUrl}/api/profile`;

      console.log("[ElementScreen] Attempting to save element:", {
        element,
        url,
        sessionToken: sessionToken.substring(0, 10) + "...",
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          selectedElement: element,
        }),
      });

      console.log("[ElementScreen] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server Error: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("[ElementScreen] Element erfolgreich gespeichert:", result);
      return result;
    } catch (error) {
      console.error(
        "[ElementScreen] Fehler beim Speichern des Elements:",
        error
      );
      throw error;
    }
  };

  const handleNext = async () => {
    if (!selectedElement) {
      Alert.alert("Auswahl fehlt", "Bitte wähle ein Element aus.");
      return;
    }

    setIsLoading(true);
    try {
      await saveElementToBackend(selectedElement);

      console.log(
        `[ElementScreen] Element gespeichert. Navigating to details screen with zodiac: ${zodiacSign}, element: ${selectedElement}`
      );

      router.push({
        pathname: "/(ich)/details",
        params: { zodiacSign, selectedElement },
      } as any);
    } catch (error: any) {
      console.error("Fehler beim Speichern des Elements:", error);
      Alert.alert(
        "Fehler",
        error.message ||
          "Fehler beim Speichern des Elements. Bitte versuche es erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    console.log(
      `[ElementScreen] Skip pressed. Navigating to details screen, with zodiac: ${zodiacSign}`
    );
    router.push({
      pathname: "/(ich)/details",
      params: { zodiacSign },
    } as any);
  };

  const handleBack = () => {
    console.log("[ElementScreen] Back pressed. Navigating to /zodiacSign.");
    router.back();
  };

  if (isSessionStillLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={{ marginTop: 10 }}>Lade Sitzungsdaten...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>Schritt 2/3</Text>
      </View>
      <Text style={styles.title}>Dein Element</Text>
      <Text style={styles.subtitle}>
        Wähle das Element, das dich am meisten anspricht.
      </Text>

      <View style={styles.gridContainer}>
        {ELEMENTS.map((element) => (
          <TouchableOpacity
            key={element.name}
            style={[
              styles.elementButton,
              { backgroundColor: element.color },
              selectedElement === element.name && styles.selectedElementButton,
            ]}
            onPress={() => handleSelectElement(element.name)}
            disabled={isLoading}
          >
            <FontAwesome
              name={element.icon as any}
              size={40}
              color={selectedElement === element.name ? "#FFF" : "#4A403D"}
            />
            <Text
              style={[
                styles.elementText,
                selectedElement === element.name && styles.selectedElementText,
              ]}
            >
              {element.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.button, styles.skipButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Zurück</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          style={[styles.button, styles.skipButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Überspringen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.button, styles.nextButton]}
          disabled={!selectedElement || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Weiter</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
