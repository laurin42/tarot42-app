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
    // 1. Prüfe lokalen Onboarding-Status (SecureStore)
    const localCompleted = await SecureStore.getItemAsync(`${ONBOARDING_COMPLETED_KEY}_${userId}`);
    
    if (localCompleted === "true") {
      console.log("[OnboardingUtils] ✅ Local onboarding completed");
      return {
        isCompleted: true,
        needsWelcome: false,
        profileCompleteness: 100,
        debugInfo: "Locally marked as completed"
      };
    }

    // 2. Prüfe Backend-Vollständigkeit
    const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);
    
    if (!token) {
      console.log("[OnboardingUtils] ❌ No token found - showing welcome");
      return {
        isCompleted: false,
        needsWelcome: true,
        profileCompleteness: 0,
        debugInfo: "No auth token found"
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
        
        const { completeness } = data;
        
        // SEHR niedriger Threshold für neue User
        const isCompleted = completeness >= 20;
        const needsWelcome = !isCompleted;
        
        console.log("[OnboardingUtils] 🎯 Completeness:", completeness, "% | Needs welcome:", needsWelcome);
        
        // Bei Vollständigkeit lokal markieren
        if (isCompleted) {
          await markOnboardingCompleted(userId);
        }
        
        return {
          isCompleted,
          needsWelcome,
          profileCompleteness: completeness,
          debugInfo: `Backend completeness: ${completeness}%, threshold: 20%`
        };
      } else {
        console.log("[OnboardingUtils] ❌ Backend request failed - showing welcome");
        return {
          isCompleted: false,
          needsWelcome: true,
          profileCompleteness: 0,
          debugInfo: `Backend error: ${response.status}`
        };
      }
    } catch (fetchError: unknown) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[OnboardingUtils] 🚨 Fetch error:", fetchError);
      return {
        isCompleted: false,
        needsWelcome: true,
        profileCompleteness: 0,
        debugInfo: `Fetch error: ${errorMessage}`
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[OnboardingUtils] 💥 General error:", error);
    return {
      isCompleted: false,
      needsWelcome: true,
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