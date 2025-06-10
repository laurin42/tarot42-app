// hooks/useOnboarding.ts
import { useState, useEffect } from "react";
import { authClient } from "../../lib/auth-client";
import { 
  checkOnboardingStatus, 
  markOnboardingCompleted, 
  resetOnboardingStatus,
  debugOnboardingStatus,
  debugBackendProfile,
  OnboardingStatus 
} from "../../utils/onboardingUtils";

export const useOnboarding = () => {
  const { data: session, isPending } = authClient.useSession();
  
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    isCompleted: false,
    needsWelcome: false,
    profileCompleteness: 0,
    debugInfo: "Initial state"
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log session changes
  useEffect(() => {
    console.log("[useOnboarding] 📱 Session changed:", {
      hasSession: !!session,
      userId: session?.user?.id,
      isPending,
      userEmail: session?.user?.email
    });
  }, [session, isPending]);

  // Prüfe Onboarding-Status wenn User eingeloggt ist
  useEffect(() => {
    const checkStatus = async () => {
      console.log("[useOnboarding] 🔄 checkStatus called", {
        hasUserId: !!session?.user?.id,
        isPending,
        currentLoading: isLoading
      });

      if (!session?.user?.id || isPending) {
        console.log("[useOnboarding] ⏳ Waiting for session or user ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[useOnboarding] 🚀 Starting onboarding status check for:", session.user.id);
        
        // Debug: Zeige aktuellen lokalen Status und Backend-Profile
        await debugOnboardingStatus(session.user.id);
        await debugBackendProfile();
        
        const status = await checkOnboardingStatus(session.user.id);
        
        console.log("[useOnboarding] 📋 Status received:", status);
        
        setOnboardingStatus(status);
        
      } catch (err: any) {
        console.error("[useOnboarding] 💥 Error checking status:", err);
        setError(err.message || "Fehler beim Prüfen des Onboarding-Status");
        
        // Fallback: Zeige Welcome bei Fehler
        const fallbackStatus = {
          isCompleted: false,
          needsWelcome: true,
          profileCompleteness: 0,
          debugInfo: `Error fallback: ${err.message}`
        };
        
        console.log("[useOnboarding] 🆘 Using fallback status:", fallbackStatus);
        setOnboardingStatus(fallbackStatus);
      } finally {
        setIsLoading(false);
        console.log("[useOnboarding] ✅ Status check completed");
      }
    };

    checkStatus();
  }, [session?.user?.id, isPending]);

  // Reset bei Logout
  useEffect(() => {
    if (!session?.user && !isPending) {
      console.log("[useOnboarding] 👋 User logged out - resetting state");
      setOnboardingStatus({
        isCompleted: false,
        needsWelcome: false,
        profileCompleteness: 0,
        debugInfo: "User logged out"
      });
      setIsLoading(false);
      setError(null);
    }
  }, [session?.user, isPending]);

  const completeOnboarding = async (): Promise<void> => {
    if (!session?.user?.id) {
      throw new Error("Kein eingeloggter User gefunden");
    }

    try {
      console.log("[useOnboarding] ✨ Completing onboarding for:", session.user.id);
      await markOnboardingCompleted(session.user.id);
      
      setOnboardingStatus(prev => ({
        ...prev,
        isCompleted: true,
        needsWelcome: false,
        debugInfo: "Manually completed"
      }));
      
      console.log("[useOnboarding] ✅ Onboarding completed successfully");
    } catch (err: any) {
      console.error("[useOnboarding] ❌ Error completing onboarding:", err);
      throw err;
    }
  };

  const resetOnboarding = async (): Promise<void> => {
    if (!session?.user?.id) {
      throw new Error("Kein eingeloggter User gefunden");
    }

    try {
      console.log("[useOnboarding] 🔄 Resetting onboarding for:", session.user.id);
      await resetOnboardingStatus(session.user.id);
      
      setOnboardingStatus({
        isCompleted: false,
        needsWelcome: true,
        profileCompleteness: 0,
        debugInfo: "Manually reset"
      });
      
      console.log("[useOnboarding] ✅ Onboarding reset successfully");
    } catch (err: any) {
      console.error("[useOnboarding] ❌ Error resetting onboarding:", err);
      throw err;
    }
  };

  const refreshStatus = async (): Promise<void> => {
    if (!session?.user?.id) return;

    try {
      console.log("[useOnboarding] 🔄 Manually refreshing status");
      setError(null);
      const status = await checkOnboardingStatus(session.user.id);
      setOnboardingStatus(status);
      console.log("[useOnboarding] ✅ Status refreshed:", status);
    } catch (err: any) {
      console.error("[useOnboarding] ❌ Error refreshing status:", err);
      setError(err.message || "Fehler beim Aktualisieren des Status");
    }
  };

  // Debug logs für wichtige State-Änderungen
  useEffect(() => {
    console.log("[useOnboarding] 📊 State Update:", {
      shouldShowWelcome: onboardingStatus.needsWelcome,
      isCompleted: onboardingStatus.isCompleted,
      completeness: onboardingStatus.profileCompleteness,
      isLoading,
      debugInfo: onboardingStatus.debugInfo
    });
  }, [onboardingStatus, isLoading]);

  return {
    // Status
    onboardingStatus,
    isLoading,
    error,
    
    // Berechnete Werte
    shouldShowWelcome: onboardingStatus.needsWelcome,
    isOnboardingCompleted: onboardingStatus.isCompleted,
    profileCompleteness: onboardingStatus.profileCompleteness,
    
    // Aktionen
    completeOnboarding,
    resetOnboarding,
    refreshStatus,
    
    // Session info
    isSessionLoading: isPending,
    hasSession: !!session?.user,
    
    // Debug
    debugInfo: onboardingStatus.debugInfo,
  };
};