// app/(tabs)/settings.tsx - Refaktorierte Version
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useProfileActions } from "../../hooks/useProfileActions";
import { getProfileCompleteness } from "../../utils/profileUtils";
import { styles } from "../../styles/settingsScreen";
import { Ionicons } from "@expo/vector-icons";

// Konstanten in separate Datei verschieben - constants/profileConstants.ts
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

  const {
    userProfile,
    userGoals,
    isLoading: isLoadingProfile,
    error,
    refreshing,
    onRefresh,
  } = useUserProfile();

  const {
    handleLogout,
    handleDeleteAccount,
    isActionLoading: isLoading,
  } = useProfileActions();

  // ✅ Diese Funktion kann später in ProfileCard Komponente
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

  const completeness = getProfileCompleteness(userProfile);

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
