import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../../styles/goalsScreen";

import {
  GENDER_OPTIONS,
  AGE_RANGES,
  FOCUS_AREAS,
  API_BASE_URL,
  SECURE_STORE_BEARER_TOKEN_KEY,
} from "../../constants/profileConstants";

import { useProfileFormCache } from "../../hooks/forms/useProfileFormCache";
import { useSession } from "../../providers/SessionProvider";
import { useBirthdayPicker } from "../../hooks/forms/useBirthdayPicker";
import { validateForm } from "../../utils/formValidation";
import type { FormData, FormCache } from "../../types/profile";

export default function goalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    zodiacSign?: string;
    element?: string;
  }>();

  const sessionContext = useSession();
  const userId = sessionContext?.session?.user?.id;

  const [personalGoal, setPersonalGoal] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>("");

  const [selectedFocusArea, setSelectedFocusArea] = useState<string>("");

  const birthdayPicker = useBirthdayPicker();

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { zodiacSign: pZodiacSign, element: pElement } = useLocalSearchParams<{
    // Destrukturieren und ggf. umbenennen
    zodiacSign?: string;
    element?: string;
  }>();

  const { saveFormCache, loadFormCache, clearFormCache } = useProfileFormCache(
    userId || ""
  );

  const loadExistingProfile = useCallback(async () => {
    if (!userId) {
      console.log("[goalsScreen] No userId, cannot load existing profile.");
      return;
    }
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync(
        SECURE_STORE_BEARER_TOKEN_KEY
      );
      if (!token) {
        Alert.alert("Fehler", "Authentifizierungstoken nicht gefunden.");
        setIsLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.log("[goalsScreen] No existing profile found (404).");
          return;
        }
        throw new Error("Fehler beim Laden des Profils.");
      }
      const profileData = await response.json();
      if (profileData) {
        setPersonalGoal(profileData.personalGoals || "");
        setAdditionalDetails(profileData.additionalDetails || "");
        setSelectedFocusArea(profileData.focusArea || "");
        setSelectedGender(profileData.gender || "");
        setSelectedAgeRange(profileData.ageRange || "");

        if (profileData.birthDateTime) {
          const dateTimeString = profileData.birthDateTime.toString();
          let dateInput = "";
          let timeInput = "";

          if (profileData.includeTime) {
            const parts = dateTimeString.split(" ");
            dateInput = parts[0] || "";
            timeInput = parts.length > 1 ? parts.slice(1).join(" ") : "";
            birthdayPicker.handleManualTimeInput(timeInput);
          } else {
            dateInput = dateTimeString;
            birthdayPicker.handleManualTimeInput("");
          }
          birthdayPicker.handleManualDateInput(dateInput);
          birthdayPicker.setIncludeTime(!!profileData.includeTime);
        } else {
          birthdayPicker.handleManualDateInput("");
          birthdayPicker.handleManualTimeInput("");
          birthdayPicker.setIncludeTime(false);
        }
      }
    } catch (error) {
      console.error("[goalsScreen] Failed to load existing profile:", error);
      Alert.alert("Fehler", "Profil konnte nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, [
    userId,
    birthdayPicker.handleManualDateInput,
    birthdayPicker.handleManualTimeInput,
    birthdayPicker.setIncludeTime,
  ]);

  useEffect(() => {
    const initializeForm = async () => {
      console.log("[goalsScreen] Received params:", {
        zodiacSign: pZodiacSign,
        element: pElement,
      });
      if (!userId) {
        console.log("[goalsScreen] Waiting for userId to initialize form.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const cachedValues = await loadFormCache();

      if (cachedValues) {
        setPersonalGoal(cachedValues.personalGoal || "");
        setAdditionalDetails(cachedValues.additionalDetails || "");
        setSelectedGender(cachedValues.selectedGender || "");
        setSelectedAgeRange(cachedValues.selectedAgeRange || "");
        setSelectedFocusArea(cachedValues.selectedFocusArea || "");

        if (cachedValues.manualDateInput !== undefined) {
          birthdayPicker.handleManualDateInput(
            cachedValues.manualDateInput || ""
          );
        } else {
          birthdayPicker.handleManualDateInput(""); // Fallback
        }
        if (cachedValues.manualTimeInput !== undefined) {
          birthdayPicker.handleManualTimeInput(
            cachedValues.manualTimeInput || ""
          );
        } else {
          birthdayPicker.handleManualTimeInput(""); // Fallback
        }
        if (cachedValues.includeTime !== undefined) {
          birthdayPicker.setIncludeTime(!!cachedValues.includeTime);
        } else {
          birthdayPicker.setIncludeTime(false); // Fallback
        }
        console.log("[goalsScreen] Form initialized from cache.");
        setHasUnsavedChanges(false);
      } else {
        await loadExistingProfile();
        console.log("[goalsScreen] No cache, tried loading existing profile.");
      }
      setIsLoading(false);
    };
    initializeForm();
  }, [
    userId,
    pZodiacSign,
    pElement,
    loadFormCache,
    loadExistingProfile,
    birthdayPicker.handleManualDateInput,
    birthdayPicker.handleManualTimeInput,
    birthdayPicker.setIncludeTime,
  ]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const timeoutId = setTimeout(() => {
      setHasUnsavedChanges(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [
    personalGoal,
    additionalDetails,
    selectedGender,
    selectedAgeRange,
    selectedFocusArea,
    birthdayPicker.birthdayData.manualDateInput,
    birthdayPicker.birthdayData.manualTimeInput,
    birthdayPicker.birthdayData.includeTime,
    isLoading,
  ]);

  useEffect(() => {
    if (!hasUnsavedChanges || !userId) {
      if (!userId) setHasUnsavedChanges(false);
      return;
    }
    const timer = setTimeout(() => {
      const dataToCache: Omit<FormCache, "lastUpdated"> = {
        userId: userId,
        personalGoal,
        additionalDetails,
        selectedGender,
        selectedAgeRange,
        selectedFocusArea,
        manualDateInput: birthdayPicker.birthdayData.manualDateInput,
        manualTimeInput: birthdayPicker.birthdayData.manualTimeInput,
        includeTime: birthdayPicker.birthdayData.includeTime,
      };
      saveFormCache(dataToCache);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    userId,
    personalGoal,
    additionalDetails,
    selectedGender,
    selectedAgeRange,
    selectedFocusArea,
    birthdayPicker.birthdayData.manualDateInput,
    birthdayPicker.birthdayData.manualTimeInput,
    birthdayPicker.birthdayData.includeTime,
    saveFormCache,
    hasUnsavedChanges,
  ]);

  const handleSaveCompleteProfile = async () => {
    const formData: FormData = {
      personalGoal: personalGoal.trim(),
      additionalDetails: additionalDetails.trim(),
      selectedGender,
      selectedAgeRange,
      selectedFocusArea,
      manualDateInput: birthdayPicker.birthdayData.manualDateInput,
      manualTimeInput: birthdayPicker.birthdayData.manualTimeInput,
      includeTime: birthdayPicker.birthdayData.includeTime,
    };

    const validation = validateForm(formData);

    if (!validation.isValid) {
      Alert.alert("Fehler", validation.errors.join("\n"));
      return;
    }

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync(
        SECURE_STORE_BEARER_TOKEN_KEY
      );

      if (!token) {
        Alert.alert("Fehler", "Keine gültige Authentifizierung gefunden.");
        setIsLoading(false); // isLoading zurücksetzen
        return;
      }

      const profileData = {
        zodiacSign: params.zodiacSign,
        element: params.element,
        personalGoals: personalGoal.trim(),
        additionalDetails: additionalDetails.trim(),
        focusArea: selectedFocusArea,
        gender: selectedGender,
        ageRange: selectedAgeRange,
        birthDateTime: birthdayPicker.getBirthDateTimeString(),
        includeTime: birthdayPicker.birthdayData.includeTime,
      };

      console.log("[goalsScreen] Saving profile data:", profileData); // Angepasst

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Fehler beim Speichern des Profils"
        );
      }

      const result = await response.json();
      console.log("[goalsScreen] Profile saved successfully:", result); // Angepasst

      await clearFormCache();
      setHasUnsavedChanges(false);

      try {
        if ((global as any).markOnboardingCompleted) {
          await (global as any).markOnboardingCompleted();
          console.log("[goalsScreen] Onboarding marked as completed"); // Angepasst
        }
      } catch (onboardingError) {
        console.warn(
          "[goalsScreen] Could not mark onboarding as completed:", // Angepasst
          onboardingError
        );
      }

      Alert.alert(
        "Profil vervollständigt! 🎉",
        "Dein Profil wurde erfolgreich gespeichert. Du kannst jetzt personalisierte Tarot-Readings erhalten.",
        [
          {
            text: "Weiter",
            onPress: () => router.replace("/(tabs)/profile"),
          },
        ]
      );
    } catch (error: any) {
      console.error("[goalsScreen] Error saving profile:", error); // Angepasst
      Alert.alert(
        "Fehler beim Speichern",
        error.message || "Ein unerwarteter Fehler ist aufgetreten."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Ungespeicherte Änderungen",
        "Du hast ungespeicherte Änderungen. Möchtest du trotzdem zurückgehen?",
        [
          { text: "Abbrechen", style: "cancel" },
          {
            text: "Trotzdem zurück",
            onPress: () => {
              clearFormCache();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Profil unvollständig",
      "Du kannst dein Profil später in den Einstellungen vervollständigen.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Trotzdem überspringen",
          onPress: () => {
            clearFormCache();
            router.replace("/(tabs)/profile");
          },
        },
      ]
    );
  };

  // JSX (wie von dir bereitgestellt)
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.title}>Ziele & Details</Text>
          {hasUnsavedChanges && (
            <View style={styles.unsavedIndicator}>
              <Ionicons name="ellipse" size={8} color="#F59E0B" />
            </View>
          )}
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
          <Text style={styles.progressText}>Schritt 3 von 3</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.introText}>
            Letzter Schritt! Teile uns deine persönlichen Ziele mit und ergänze
            optional weitere Details für noch personalisiertere Readings.
          </Text>
          <Text style={styles.sectionTitle}>Was ist dein Hauptziel? *</Text>
          <Text style={styles.sectionDescription}>
            Beschreibe, was du in deinem Leben erreichen möchtest. Dies hilft
            uns, personalisierte Tarot-Readings für dich zu erstellen.
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="z.B. Mehr Selbstvertrauen, bessere Beziehungen, beruflicher Erfolg..."
            value={personalGoal}
            onChangeText={setPersonalGoal}
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={!isLoading}
          />
          <Text style={styles.characterCount}>{personalGoal.length}/500</Text>
          <Text style={styles.sectionTitle}>
            Zusätzliche Details über dich (Optional)
          </Text>
          <Text style={styles.sectionDescription}>
            Möchtest du uns noch etwas anderes über dich mitteilen? Alles was
            dir wichtig erscheint.
          </Text>
          <TextInput
            style={[styles.textInput, styles.largeTextInput]}
            placeholder="Weitere Details über deine Persönlichkeit, Interessen oder Lebenssituation..."
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
            multiline
            numberOfLines={6}
            maxLength={1000}
            editable={!isLoading}
          />
          <Text style={styles.characterCount}>
            {additionalDetails.length}/1000
          </Text>
          <Text style={styles.sectionTitle}>Interessiert an (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Wähle einen Bereich, auf den sich deine Tarot-Readings hauptsächlich
            fokussieren sollen. Diese Auswahl wird bei der Deutung stärker
            gewichtet.
          </Text>
          <View style={styles.focusContainer}>
            {FOCUS_AREAS.map((focus) => (
              <TouchableOpacity
                key={focus.key}
                style={[
                  styles.focusCard,
                  selectedFocusArea === focus.key && styles.selectedFocusCard,
                ]}
                onPress={() => setSelectedFocusArea(focus.key)}
              >
                <View style={styles.focusHeader}>
                  <Ionicons
                    name={focus.icon as any}
                    size={24}
                    color={
                      selectedFocusArea === focus.key ? "#8B5CF6" : "#6B7280"
                    }
                  />
                  {selectedFocusArea === focus.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#8B5CF6"
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.focusTitle,
                    selectedFocusArea === focus.key &&
                      styles.selectedFocusTitle,
                  ]}
                >
                  {focus.label}
                </Text>
                <Text style={styles.focusDescription}>{focus.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Geschlecht (Optional)</Text>
          <View style={styles.optionsContainer}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  selectedGender === option.key && styles.selectedOption,
                ]}
                onPress={() => setSelectedGender(option.key)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={selectedGender === option.key ? "#FFFFFF" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedGender === option.key && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Altersbereich (Optional)</Text>
          <View style={styles.optionsContainer}>
            {AGE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.ageOptionButton,
                  selectedAgeRange === range.key && styles.selectedOption,
                ]}
                onPress={() => setSelectedAgeRange(range.key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAgeRange === range.key && styles.selectedOptionText,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Geburtstag & Zeit (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Für noch präzisere astrologische Readings. Die Geburtszeit ist
            optional, aber hilfreich für ein Geburtshoroskop.
          </Text>
          <View style={styles.birthdayContainer}>
            <View style={styles.inputModeContainer}>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  !birthdayPicker.birthdayData.useManualInput &&
                    styles.activeInputMode,
                ]}
                onPress={() => birthdayPicker.setUseManualInput(false)}
              >
                <Ionicons
                  name="calendar"
                  size={16}
                  color={
                    !birthdayPicker.birthdayData.useManualInput
                      ? "#FFFFFF"
                      : "#6B7280"
                  }
                />
                <Text
                  style={[
                    styles.inputModeText,
                    !birthdayPicker.birthdayData.useManualInput &&
                      styles.activeInputModeText,
                  ]}
                >
                  Kalender
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  birthdayPicker.birthdayData.useManualInput &&
                    styles.activeInputMode,
                ]}
                onPress={() => birthdayPicker.setUseManualInput(true)}
              >
                <Ionicons
                  name="create"
                  size={16}
                  color={
                    birthdayPicker.birthdayData.useManualInput
                      ? "#FFFFFF"
                      : "#6B7280"
                  }
                />
                <Text
                  style={[
                    styles.inputModeText,
                    birthdayPicker.birthdayData.useManualInput &&
                      styles.activeInputModeText,
                  ]}
                >
                  Manuell
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Geburtsdatum:</Text>
            {birthdayPicker.birthdayData.useManualInput ? (
              <TextInput
                style={styles.textInput}
                placeholder="TT.MM.JJJJ (z.B. 15.03.1990)"
                value={birthdayPicker.birthdayData.manualDateInput}
                onChangeText={birthdayPicker.handleManualDateInput}
                keyboardType="numeric"
                maxLength={10}
                editable={!isLoading}
              />
            ) : (
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => birthdayPicker.setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.datePickerText}>
                  {birthdayPicker.formatDateForDisplay(
                    birthdayPicker.birthdayData.birthDate
                  )}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.timeToggleContainer}>
              <TouchableOpacity
                style={styles.timeToggle}
                onPress={() =>
                  birthdayPicker.setIncludeTime(
                    !birthdayPicker.birthdayData.includeTime
                  )
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    birthdayPicker.birthdayData.includeTime &&
                      styles.checkedBox,
                  ]}
                >
                  {birthdayPicker.birthdayData.includeTime && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.timeToggleText}>
                  Geburtszeit angeben (für präzisere Deutung)
                </Text>
              </TouchableOpacity>
            </View>
            {birthdayPicker.birthdayData.includeTime && (
              <>
                <Text style={styles.inputLabel}>Geburtszeit:</Text>
                {birthdayPicker.birthdayData.useManualInput ? (
                  <TextInput
                    style={styles.textInput}
                    placeholder="HH:MM (z.B. 14:30)"
                    value={birthdayPicker.birthdayData.manualTimeInput}
                    onChangeText={birthdayPicker.handleManualTimeInput}
                    keyboardType="numeric"
                    maxLength={5}
                    editable={!isLoading}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => birthdayPicker.setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text style={styles.datePickerText}>
                      {birthdayPicker.formatTimeForDisplay(
                        birthdayPicker.birthdayData.birthTime
                      )}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {birthdayPicker.getBirthDateTimeString() && (
              <View style={styles.birthdaySummary}>
                <Text style={styles.birthdaySummaryText}>
                  Ausgewählt: {birthdayPicker.getBirthDateTimeString()}
                </Text>
              </View>
            )}
          </View>
          {birthdayPicker.birthdayData.showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={birthdayPicker.birthdayData.birthDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={birthdayPicker.handleDateChange}
              maximumDate={new Date()}
            />
          )}
          {birthdayPicker.birthdayData.showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={birthdayPicker.birthdayData.birthTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={birthdayPicker.handleTimeChange}
            />
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!personalGoal.trim() || isLoading) && styles.disabledButton,
            ]}
            onPress={handleSaveCompleteProfile}
            disabled={!personalGoal.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  Profil vervollständigen
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Überspringen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
