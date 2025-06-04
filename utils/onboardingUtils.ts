// utils/onboardingUtils.ts
import * as SecureStore from "expo-secure-store";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";
const SECURE_STORE_BEARER_TOKEN_KEY = "tarot42.bearerAuthToken";

export interface OnboardingStatus {
  isCompleted: boolean;
  needsWelcome: boolean;
  profileCompleteness: number;
  debugInfo?: string;
}

/**
 * TEMPORÄRE Debug-Version - nur SecureStore, kein AsyncStorage
 */
export const checkOnboardingStatus = async (userId: string): Promise<OnboardingStatus> => {
  console.log("[OnboardingUtils] 🔍 Checking status for user:", userId);
  
  try {
    const locallyMarkedCompletedString = await SecureStore.getItemAsync(`${ONBOARDING_COMPLETED_KEY}_${userId}`);
    const hasBeenLocallyMarkedCompleted = locallyMarkedCompletedString === "true";

    const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);

    if (!token) {
      console.log("[OnboardingUtils] ❌ No token found - determining status based on local flag");
      return {
        isCompleted: false, // Kann nicht wirklich "completed" sein ohne Backend-Profil-Check
        needsWelcome: !hasBeenLocallyMarkedCompleted, // Zeige Welcome, wenn nie zuvor abgeschlossen
        profileCompleteness: 0,
        debugInfo: "No auth token found, local completion status used for needsWelcome"
      };
    }

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.178.67:3000";
    console.log("[OnboardingUtils] 🌐 Fetching from:", `${API_BASE_URL}/api/profile/completeness`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/completeness`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[OnboardingUtils] 📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[OnboardingUtils] 📊 Backend response:", data);
        
        const { completeness } = data; // Die *aktuelle* Vollständigkeit vom Backend
        
        const isBackendCompleted = completeness >= 20; // Dein Threshold
        
        console.log("[OnboardingUtils] 🎯 Backend Completeness:", completeness, "% | Threshold Met:", isBackendCompleted);
        
        // Wenn Backend sagt "abgeschlossen" und es lokal noch nicht so markiert war, markiere es jetzt.
        if (isBackendCompleted && !hasBeenLocallyMarkedCompleted) {
          await markOnboardingCompleted(userId);
        }
        
        return {
          isCompleted: isBackendCompleted, // Basierend auf *aktuellen* Backend-Daten
          needsWelcome: !hasBeenLocallyMarkedCompleted, // Zeige Welcome nur, wenn der Flow nie zuvor abgeschlossen wurde
          profileCompleteness: completeness,         // Die *tatsächliche* Backend-Vollständigkeit
          debugInfo: `Backend completeness: ${completeness}%, threshold: 20%. Locally ever marked: ${hasBeenLocallyMarkedCompleted}`
        };
      } else {
        console.log("[OnboardingUtils] ❌ Backend request failed - using local flag for needsWelcome");
        return {
          isCompleted: false, // Fehler beim Backend-Check
          needsWelcome: !hasBeenLocallyMarkedCompleted,
          profileCompleteness: 0,
          debugInfo: `Backend error: ${response.status}, local completion for needsWelcome`
        };
      }
    } catch (fetchError: unknown) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[OnboardingUtils] 🚨 Fetch error:", fetchError);
      return {
        isCompleted: false,
        needsWelcome: !hasBeenLocallyMarkedCompleted,
        profileCompleteness: 0,
        debugInfo: `Fetch error: ${errorMessage}, local completion for needsWelcome`
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[OnboardingUtils] 💥 General error:", error);
    return {
      isCompleted: false,
      needsWelcome: true, // Im Zweifel Welcome anzeigen
      profileCompleteness: 0,
      debugInfo: `General error: ${errorMessage}`
    };
  }
};

/**
 * Markiert das Onboarding als abgeschlossen
 */
export const markOnboardingCompleted = async (userId: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(`${ONBOARDING_COMPLETED_KEY}_${userId}`, "true");
    console.log("[OnboardingUtils] ✅ Onboarding marked as completed for user:", userId);
  } catch (error) {
    console.error("[OnboardingUtils] ❌ Error marking onboarding completed:", error);
    throw error;
  }
};

/**
 * Debug: Status zurücksetzen
 */
export const resetOnboardingStatus = async (userId: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(`${ONBOARDING_COMPLETED_KEY}_${userId}`);
    console.log("[OnboardingUtils] 🔄 Onboarding status reset for user:", userId);
  } catch (error) {
    console.error("[OnboardingUtils] ❌ Error resetting onboarding status:", error);
  }
};

/**
 * Debug: Zeige gespeicherte Onboarding-Status
 */
export const debugOnboardingStatus = async (userId: string): Promise<void> => {
  try {
    const completed = await SecureStore.getItemAsync(`${ONBOARDING_COMPLETED_KEY}_${userId}`);
    console.log(`[OnboardingUtils] 🔑 Onboarding status for ${userId}: ${completed}`);
  } catch (error) {
    console.error("[OnboardingUtils] ❌ Error debugging onboarding status:", error);
  }
};

/**
 * NEUE FUNKTION: Backend-Profile prüfen für Debug
 */
export const debugBackendProfile = async (): Promise<void> => {
  try {
    const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
    if (!token) {
      console.log("[OnboardingUtils] 🔍 No token for profile debug");
      return;
    }

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.178.67:3000";
    
    console.log("[OnboardingUtils] 🔍 Debugging backend profile...");
    
    // Prüfe vollständiges Profil
    const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log("[OnboardingUtils] 👤 Full Profile:", JSON.stringify(profile, null, 2));
    }

    // Prüfe Completeness
    const completenessResponse = await fetch(`${API_BASE_URL}/api/profile/completeness`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (completenessResponse.ok) {
      const completeness = await completenessResponse.json();
      console.log("[OnboardingUtils] 📊 Completeness:", JSON.stringify(completeness, null, 2));
    }

  } catch (error) {
    console.error("[OnboardingUtils] ❌ Error debugging backend profile:", error);
  }
};