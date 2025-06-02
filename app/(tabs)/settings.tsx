import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
  authClient,
  API_BASE_URL,
  SECURE_STORE_BEARER_TOKEN_KEY,
} from "../../lib/auth-client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

interface BetterAuthAPIError {
  message: string;
  code?: string;
  httpStatus?: number;
}

interface BetterAuthErrorWithType extends BetterAuthAPIError {
  message: string;
  code?: string;
  httpStatus?: number;
}

interface UserProfile {
  name?: string;
  email?: string;
  zodiacSign?: string;
  element?: string;
  personalGoals?: string;
  additionalDetails?: string;
  focusArea?: string;
  gender?: string;
  ageRange?: string;
  birthDateTime?: string;
  includeTime?: boolean;
}

interface UserGoal {
  id: string;
  goalText: string;
  createdAt: string;
  isAchieved: boolean;
}

const FOCUS_AREA_LABELS = {
  financial_career: "Finanzielle/berufliche Deutung",
  love_relationships: "Liebesleben",
  personal_development: "Persönliche Entwicklung",
};

const GENDER_LABELS = {
  male: "Männlich",
  female: "Weiblich",
  diverse: "Divers",
  prefer_not_to_say: "Keine Angabe",
};

export default function IchScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data: sessionData, isPending: isSessionLoading } =
    authClient.useSession();

  const fetchData = useCallback(
    async (callContext: string) => {
      console.log(`[settings.tsx] fetchData called from: ${callContext}`);

      if (isSessionLoading) {
        console.log(`[settings.tsx] session still loading. Returning early.`);
        return;
      }

      if (!sessionData?.user) {
        console.log(`[settings.tsx] No user data in session. Returning early.`);
        setIsLoadingProfile(false);
        setRefreshing(false);
        return;
      }

      const token = await SecureStore.getItemAsync(
        SECURE_STORE_BEARER_TOKEN_KEY
      );

      setIsLoadingProfile(true);
      setError(null);

      if (!token) {
        console.log(`[settings.tsx] No valid session token found.`);
        setError(
          "Kein gültiges Sitzungstoken gefunden. Bitte melde dich erneut an."
        );
        setIsLoadingProfile(false);
        setRefreshing(false);
        return;
      }

      try {
        // Fetch profile data
        const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          const profileErrorText = await profileResponse.text();
          throw new Error("Fehler beim Laden des Profils.");
        }

        const profileData = await profileResponse.json();
        setUserProfile({
          name: profileData.name || sessionData.user?.name || "Nutzer",
          email: profileData.email || sessionData.user?.email,
          zodiacSign: profileData.zodiacSign,
          element: profileData.element,
          personalGoals: profileData.personalGoals,
          additionalDetails: profileData.additionalDetails,
          focusArea: profileData.focusArea,
          gender: profileData.gender,
          ageRange: profileData.ageRange,
          birthDateTime: profileData.birthDateTime,
          includeTime: profileData.includeTime,
        });

        // Fetch goals data
        const goalsResponse = await fetch(`${API_BASE_URL}/api/goals`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setUserGoals(goalsData || []);
        }
      } catch (e: any) {
        console.error("Failed to fetch data:", e);
        setError(e.message || "Daten konnten nicht geladen werden.");
      } finally {
        setIsLoadingProfile(false);
        setRefreshing(false);
      }
    },
    [sessionData, API_BASE_URL, isSessionLoading]
  );

  useEffect(() => {
    if (!isSessionLoading) {
      fetchData("useEffect");
    } else {
      setIsLoadingProfile(true);
    }
  }, [fetchData, isSessionLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!isSessionLoading) {
        fetchData("useFocusEffect");
      } else {
        setIsLoadingProfile(true);
      }
    }, [isSessionLoading, fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData("onRefresh");
  }, [fetchData]);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signOut();
      await GoogleSignin.signOut();
      router.replace("/(auth)/sign-in" as any);
    } catch (e: any) {
      const err = e as BetterAuthErrorWithType;
      console.error("Logout failed:", err);
      setError(`Logout fehlgeschlagen: ${err.message || "Unbekannter Fehler"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Konto löschen",
      "Sind Sie sicher, dass Sie Ihr Konto dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setError(null);
            try {
              await authClient.deleteUser();
              await GoogleSignin.signOut();
              Alert.alert("Erfolg", "Ihr Konto wurde erfolgreich gelöscht.");
              router.replace("/(auth)/sign-in" as any);
            } catch (e: any) {
              const err = e as BetterAuthErrorWithType;
              console.error("Account deletion failed:", err);
              let errorMessage = "Kontolöschung fehlgeschlagen.";
              if (err.message) {
                errorMessage += ` ${err.message}`;
              }
              if (err.code === "requires-recent-login") {
                errorMessage =
                  "Diese Aktion erfordert eine kürzliche Anmeldung. Bitte melden Sie sich erneut an und versuchen Sie es erneut.";
              }
              setError(errorMessage);
              Alert.alert("Fehler", errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getProfileCompleteness = () => {
    if (!userProfile) return 0;
    const fields = [
      userProfile.zodiacSign,
      userProfile.element,
      userProfile.personalGoals,
      userProfile.focusArea,
      userProfile.gender,
      userProfile.ageRange,
      userProfile.birthDateTime,
    ];
    const filledFields = fields.filter(
      (field) => field && field.trim() !== ""
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const renderProfileCard = (
    title: string,
    icon: string,
    children: React.ReactNode,
    isEmpty = false
  ) => (
    <View style={styles.profileCard}>
      <View style={styles.cardHeader}>
        <Ionicons
          name={icon as any}
          size={20}
          color={isEmpty ? "#9CA3AF" : "#8B5CF6"}
        />
        <Text style={[styles.cardTitle, isEmpty && styles.emptyCardTitle]}>
          {title}
        </Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );

  if (isLoadingProfile && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Lade Profilinformationen...</Text>
      </View>
    );
  }

  const completeness = getProfileCompleteness();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#8B5CF6"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Willkommen zurück,</Text>
        <Text style={styles.nameText}>{userProfile?.name || "Nutzer"}! 👋</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Profile Completeness */}
      <View style={styles.completenessCard}>
        <View style={styles.completenessHeader}>
          <Text style={styles.completenessTitle}>Profil-Vollständigkeit</Text>
          <Text style={styles.completenessPercentage}>{completeness}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completeness}%` }]} />
        </View>
        <Text style={styles.completenessDescription}>
          {completeness === 100
            ? "Dein Profil ist vollständig! 🎉"
            : "Vervollständige dein Profil für personalisiertere Readings"}
        </Text>
      </View>

      {/* Basic Info */}
      {renderProfileCard(
        "Basis-Informationen",
        "person",
        <View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-Mail:</Text>
            <Text style={styles.infoValue}>
              {userProfile?.email || "Nicht angegeben"}
            </Text>
          </View>
          {userProfile?.birthDateTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {userProfile.includeTime ? "Geburt:" : "Geburtstag:"}
              </Text>
              <Text style={styles.infoValue}>{userProfile.birthDateTime}</Text>
            </View>
          )}
          {userProfile?.gender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Geschlecht:</Text>
              <Text style={styles.infoValue}>
                {GENDER_LABELS[
                  userProfile.gender as keyof typeof GENDER_LABELS
                ] || userProfile.gender}
              </Text>
            </View>
          )}
          {userProfile?.ageRange && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Altersbereich:</Text>
              <Text style={styles.infoValue}>{userProfile.ageRange}</Text>
            </View>
          )}
        </View>,
        !userProfile?.email
      )}

      {/* Astrological Info */}
      {renderProfileCard(
        "Astrologische Daten",
        "star",
        <View>
          {userProfile?.zodiacSign ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sternzeichen:</Text>
              <Text style={styles.infoValue}>{userProfile.zodiacSign}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Kein Sternzeichen ausgewählt</Text>
          )}
          {userProfile?.element ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Element:</Text>
              <Text style={styles.infoValue}>{userProfile.element}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Kein Element ausgewählt</Text>
          )}
        </View>,
        !userProfile?.zodiacSign && !userProfile?.element
      )}

      {/* Goals & Focus */}
      {renderProfileCard(
        "Ziele & Fokus",
        "target",
        <View>
          {userProfile?.personalGoals ? (
            <View style={styles.goalSection}>
              <Text style={styles.infoLabel}>Persönliches Ziel:</Text>
              <Text style={styles.goalText}>{userProfile.personalGoals}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Keine persönlichen Ziele definiert
            </Text>
          )}
          {userProfile?.focusArea && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fokusbereich:</Text>
              <Text style={styles.infoValue}>
                {FOCUS_AREA_LABELS[
                  userProfile.focusArea as keyof typeof FOCUS_AREA_LABELS
                ] || userProfile.focusArea}
              </Text>
            </View>
          )}
          {userProfile?.additionalDetails && (
            <View style={styles.goalSection}>
              <Text style={styles.infoLabel}>Zusätzliche Details:</Text>
              <Text style={styles.detailsText}>
                {userProfile.additionalDetails}
              </Text>
            </View>
          )}
        </View>,
        !userProfile?.personalGoals && !userProfile?.focusArea
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            console.log("[settings.tsx] Navigating to profile editing");
            router.push({ pathname: "/(ich)/zodiacSign" } as any);
          }}
        >
          <Ionicons name="create" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>
            Profil {completeness === 100 ? "bearbeiten" : "vervollständigen"}
          </Text>
        </TouchableOpacity>

        {userGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={styles.goalsSectionTitle}>Deine aktuellen Ziele:</Text>
            {userGoals.slice(0, 3).map((goal) => (
              <View key={goal.id} style={styles.goalItem}>
                <Ionicons
                  name={
                    goal.isAchieved ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={16}
                  color={goal.isAchieved ? "#10B981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.goalItemText,
                    goal.isAchieved && styles.achievedGoal,
                  ]}
                >
                  {goal.goalText}
                </Text>
              </View>
            ))}
            {userGoals.length > 3 && (
              <Text style={styles.moreGoalsText}>
                +{userGoals.length - 3} weitere Ziele
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.accountSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={20} color="#F59E0B" />
          <Text style={styles.logoutButtonText}>Ausloggen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={isLoading}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Konto löschen</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "#1E293B",
  },
  errorContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FEF2F2",
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
  },
  completenessCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completenessHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  completenessTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1E293B",
  },
  completenessPercentage: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#8B5CF6",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  completenessDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center" as const,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1E293B",
    marginLeft: 8,
  },
  emptyCardTitle: {
    color: "#9CA3AF",
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#64748B",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    flex: 2,
    textAlign: "right" as const,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic" as const,
  },
  goalSection: {
    marginBottom: 12,
  },
  goalText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginTop: 4,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#8B5CF6",
  },
  detailsText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginTop: 4,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    marginLeft: 8,
  },
  goalsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalsSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1E293B",
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  goalItemText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  achievedGoal: {
    textDecorationLine: "line-through" as const,
    color: "#9CA3AF",
  },
  moreGoalsText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
    textAlign: "center" as const,
    marginTop: 8,
  },
  accountSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  logoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FEF3C7",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  logoutButtonText: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "500" as const,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500" as const,
    marginLeft: 8,
  },
  loadingOverlay: {
    alignItems: "center" as const,
    marginTop: 16,
  },
});
