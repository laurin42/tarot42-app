import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../../styles/detailsScreen";

// Konstanten für API
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.178.67:3000";
const SECURE_STORE_BEARER_TOKEN_KEY = "tarot42.bearerAuthToken";

// Lokaler Storage Key für Form-Daten
const FORM_CACHE_KEY = "profile_form_cache";

const GENDER_OPTIONS = [
  { key: "male", label: "Männlich", icon: "male" },
  { key: "female", label: "Weiblich", icon: "female" },
  { key: "diverse", label: "Divers", icon: "transgender" },
  { key: "prefer_not_to_say", label: "Keine Angabe", icon: "help-circle" },
];

const AGE_RANGES = [
  { key: "18-25", label: "18-25 Jahre" },
  { key: "26-35", label: "26-35 Jahre" },
  { key: "36-45", label: "36-45 Jahre" },
  { key: "46-55", label: "46-55 Jahre" },
  { key: "56-65", label: "56-65 Jahre" },
  { key: "65+", label: "65+ Jahre" },
];

const FOCUS_AREAS = [
  {
    key: "financial_career",
    label: "Finanzielle/berufliche Deutung",
    icon: "trending-up",
    description: "Karriere, Geld, Erfolg",
  },
  {
    key: "love_relationships",
    label: "Liebesleben",
    icon: "heart",
    description: "Beziehungen, Romantik, Partnerschaft",
  },
  {
    key: "personal_development",
    label: "Persönliche Entwicklung",
    icon: "person",
    description: "Selbstfindung, Spiritualität, Wachstum",
  },
];

interface FormCache {
  personalGoal: string;
  additionalDetails: string;
  selectedGender: string;
  selectedAgeRange: string;
  selectedFocusArea: string;
  manualDateInput: string;
  manualTimeInput: string;
  includeTime: boolean;
  lastUpdated: number;
}

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    zodiacSign?: string;
    element?: string;
  }>();

  // State
  const [personalGoal, setPersonalGoal] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>("");
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>("");

  // Geburtstag & Zeit
  const [birthDate, setBirthDate] = useState<Date>(new Date(1990, 0, 1));
  const [birthTime, setBirthTime] = useState<Date>(new Date(2000, 0, 1, 0, 0));
  const [manualDateInput, setManualDateInput] = useState("01.01.1990");
  const [manualTimeInput, setManualTimeInput] = useState("00:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);
  const [includeTime, setIncludeTime] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Cache-Management
  const saveFormCache = async () => {
    try {
      const cacheData: FormCache = {
        personalGoal,
        additionalDetails,
        selectedGender,
        selectedAgeRange,
        selectedFocusArea,
        manualDateInput,
        manualTimeInput,
        includeTime,
        lastUpdated: Date.now(),
      };
      await SecureStore.setItemAsync(FORM_CACHE_KEY, JSON.stringify(cacheData));
      console.log("[DetailsScreen] Form cache saved");
    } catch (error) {
      console.log("[DetailsScreen] Failed to save form cache:", error);
    }
  };

  const loadFormCache = async () => {
    try {
      const cachedData = await SecureStore.getItemAsync(FORM_CACHE_KEY);
      if (cachedData) {
        const cache: FormCache = JSON.parse(cachedData);

        // Nur laden wenn Cache weniger als 24h alt ist
        const isRecent = Date.now() - cache.lastUpdated < 24 * 60 * 60 * 1000;

        if (isRecent) {
          setPersonalGoal(cache.personalGoal || "");
          setAdditionalDetails(cache.additionalDetails || "");
          setSelectedGender(cache.selectedGender || "");
          setSelectedAgeRange(cache.selectedAgeRange || "");
          setSelectedFocusArea(cache.selectedFocusArea || "");
          setManualDateInput(cache.manualDateInput || "01.01.1990");
          setManualTimeInput(cache.manualTimeInput || "00:00");
          setIncludeTime(cache.includeTime || false);

          console.log("[DetailsScreen] Form cache loaded");
          return true;
        }
      }
    } catch (error) {
      console.log("[DetailsScreen] Failed to load form cache:", error);
    }
    return false;
  };

  const clearFormCache = async () => {
    try {
      await SecureStore.deleteItemAsync(FORM_CACHE_KEY);
      console.log("[DetailsScreen] Form cache cleared");
    } catch (error) {
      console.log("[DetailsScreen] Failed to clear form cache:", error);
    }
  };

  const loadExistingProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync(
        SECURE_STORE_BEARER_TOKEN_KEY
      );
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();

        // Nur setzen wenn noch keine Cache-Daten geladen wurden
        if (!personalGoal && profile.personalGoals) {
          setPersonalGoal(profile.personalGoals);
        }
        if (!additionalDetails && profile.additionalDetails) {
          setAdditionalDetails(profile.additionalDetails);
        }
        if (!selectedFocusArea && profile.focusArea) {
          setSelectedFocusArea(profile.focusArea);
        }
        if (!selectedGender && profile.gender) {
          setSelectedGender(profile.gender);
        }
        if (!selectedAgeRange && profile.ageRange) {
          setSelectedAgeRange(profile.ageRange);
        }
        if (profile.birthDateTime && !manualDateInput) {
          // Parse existierendes Datum
          const datePart = profile.birthDateTime.split(" um ")[0];
          if (datePart !== "01.01.1990") {
            setManualDateInput(datePart);
          }
        }

        console.log("[DetailsScreen] Existing profile loaded");
      }
    } catch (error) {
      console.log("[DetailsScreen] Failed to load existing profile:", error);
    }
  };

  useEffect(() => {
    const initializeForm = async () => {
      console.log("[DetailsScreen] Received params:", params);

      // 1. Versuche Cache zu laden
      const cacheLoaded = await loadFormCache();

      // 2. Falls kein Cache, lade existierendes Profil
      if (!cacheLoaded) {
        await loadExistingProfile();
      }
    };

    initializeForm();
  }, [params]);

  // Auto-save bei Änderungen (debounced)
  useEffect(() => {
    setHasUnsavedChanges(true);

    const timer = setTimeout(() => {
      saveFormCache();
    }, 2000); // Speichere nach 2 Sekunden Inaktivität

    return () => clearTimeout(timer);
  }, [
    personalGoal,
    additionalDetails,
    selectedGender,
    selectedAgeRange,
    selectedFocusArea,
    manualDateInput,
    manualTimeInput,
    includeTime,
  ]);

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
      setManualDateInput(formatDateForDisplay(selectedDate));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setBirthTime(selectedTime);
      setManualTimeInput(formatTimeForDisplay(selectedTime));
    }
  };

  const handleManualDateInput = (text: string) => {
    setManualDateInput(text);
    const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = text.match(datePattern);
    if (match) {
      const [, day, month, year] = match;
      const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      if (!isNaN(parsedDate.getTime())) {
        setBirthDate(parsedDate);
      }
    }
  };

  const handleManualTimeInput = (text: string) => {
    setManualTimeInput(text);
    const timePattern = /^(\d{2}):(\d{2})$/;
    const match = text.match(timePattern);
    if (match) {
      const [, hours, minutes] = match;
      const newTime = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      if (
        !isNaN(newTime.getTime()) &&
        parseInt(hours) < 24 &&
        parseInt(minutes) < 60
      ) {
        setBirthTime(newTime);
      }
    }
  };

  const getBirthDateTimeString = (): string => {
    if (!manualDateInput && !formatDateForDisplay(birthDate)) return "";

    const dateStr = manualDateInput || formatDateForDisplay(birthDate);
    if (includeTime) {
      const timeStr = manualTimeInput || formatTimeForDisplay(birthTime);
      return `${dateStr} um ${timeStr}`;
    }
    return dateStr;
  };

  // In der handleSaveCompleteProfile Funktion der goals.tsx
  // Füge diesen Code nach dem erfolgreichen Speichern hinzu:

  const handleSaveCompleteProfile = async () => {
    if (!personalGoal.trim()) {
      Alert.alert("Fehler", "Bitte gib mindestens ein persönliches Ziel ein.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await SecureStore.getItemAsync(
        SECURE_STORE_BEARER_TOKEN_KEY
      );

      if (!token) {
        Alert.alert("Fehler", "Keine gültige Authentifizierung gefunden.");
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
        birthDateTime: getBirthDateTimeString(),
        includeTime: includeTime,
      };

      console.log("[DetailsScreen] Saving profile data:", profileData);

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
      console.log("[DetailsScreen] Profile saved successfully:", result);

      // Cache löschen nach erfolgreichem Speichern
      await clearFormCache();
      setHasUnsavedChanges(false);

      // *** NEU: Onboarding als abgeschlossen markieren ***
      try {
        if ((global as any).markOnboardingCompleted) {
          await (global as any).markOnboardingCompleted();
          console.log("[DetailsScreen] Onboarding marked as completed");
        }
      } catch (onboardingError) {
        console.warn(
          "[DetailsScreen] Could not mark onboarding as completed:",
          onboardingError
        );
        // Nicht kritisch, lass es nicht den ganzen Flow stoppen
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
      console.error("[DetailsScreen] Error saving profile:", error);
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
        {/* Header */}
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

        {/* Progress */}
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

          {/* Persönliche Ziele - PFLICHTFELD */}
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

          {/* Zusätzliche Details */}
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

          {/* Fokusbereich */}
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

          {/* Geschlecht */}
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

          {/* Altersbereich */}
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

          {/* Geburtstag & Zeit (Optional) */}
          <Text style={styles.sectionTitle}>Geburtstag & Zeit (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Für noch präzisere astrologische Readings. Die Geburtszeit ist
            optional, aber hilfreich für ein Geburtshoroskop.
          </Text>

          <View style={styles.birthdayContainer}>
            {/* Input Mode Toggle */}
            <View style={styles.inputModeContainer}>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  !useManualInput && styles.activeInputMode,
                ]}
                onPress={() => setUseManualInput(false)}
              >
                <Ionicons
                  name="calendar"
                  size={16}
                  color={!useManualInput ? "#FFFFFF" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.inputModeText,
                    !useManualInput && styles.activeInputModeText,
                  ]}
                >
                  Kalender
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.inputModeButton,
                  useManualInput && styles.activeInputMode,
                ]}
                onPress={() => setUseManualInput(true)}
              >
                <Ionicons
                  name="create"
                  size={16}
                  color={useManualInput ? "#FFFFFF" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.inputModeText,
                    useManualInput && styles.activeInputModeText,
                  ]}
                >
                  Manuell
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Input */}
            <Text style={styles.inputLabel}>Geburtsdatum:</Text>
            {useManualInput ? (
              <TextInput
                style={styles.textInput}
                placeholder="TT.MM.JJJJ (z.B. 15.03.1990)"
                value={manualDateInput}
                onChangeText={handleManualDateInput}
                keyboardType="numeric"
                maxLength={10}
                editable={!isLoading}
              />
            ) : (
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.datePickerText}>
                  {manualDateInput || formatDateForDisplay(birthDate)}
                </Text>
              </TouchableOpacity>
            )}

            {/* Time Toggle */}
            <View style={styles.timeToggleContainer}>
              <TouchableOpacity
                style={styles.timeToggle}
                onPress={() => setIncludeTime(!includeTime)}
              >
                <View
                  style={[styles.checkbox, includeTime && styles.checkedBox]}
                >
                  {includeTime && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.timeToggleText}>
                  Geburtszeit angeben (für präzisere Deutung)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time Input (only if enabled) */}
            {includeTime && (
              <>
                <Text style={styles.inputLabel}>Geburtszeit:</Text>
                {useManualInput ? (
                  <TextInput
                    style={styles.textInput}
                    placeholder="HH:MM (z.B. 14:30)"
                    value={manualTimeInput}
                    onChangeText={handleManualTimeInput}
                    keyboardType="numeric"
                    maxLength={5}
                    editable={!isLoading}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                    <Text style={styles.datePickerText}>
                      {manualTimeInput || formatTimeForDisplay(birthTime)}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Summary */}
            {(manualDateInput || formatDateForDisplay(birthDate)) && (
              <View style={styles.birthdaySummary}>
                <Text style={styles.birthdaySummaryText}>
                  Ausgewählt: {getBirthDateTimeString()}
                </Text>
              </View>
            )}
          </View>

          {/* Date/Time Pickers */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={birthDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={birthTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Buttons */}
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
