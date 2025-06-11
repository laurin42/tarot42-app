import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useSession } from "../../providers/SessionProvider";
import { useOnboarding } from "../onboarding/useOnboarding";

export function useNavigationDecision() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const {
    isOnboardingCompleted: actualOnboardingCompleted,
    shouldShowWelcome,
    isLoading: onboardingLoading,
  } = useOnboarding();

  useEffect(() => {
    if (sessionLoading || onboardingLoading) {
      console.log("[useNavigationDecision] Loading session or onboarding...");
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const isAtRoot = segments.join("/") || "/";

    console.log("[useNavigationDecision] Routing decision", {
      isAuthenticated,
      actualOnboardingCompleted,
      shouldShowWelcome,
      inAuthGroup,
      inOnboardingGroup,
      isAtRoot,
    });

    if (!isAuthenticated) {
      //user not logged in
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
      return;
    }

    // NOW THE USER IS LOGGED IN (isAuthenticated === true)

 // First Case: user is in Root (App start)
  if (isAtRoot) {
    if (!actualOnboardingCompleted) {
      router.replace(
        shouldShowWelcome
          ? "/(onboarding)/welcome"
          : "/(onboarding)/zodiacSign"
      );
    } else {
      router.replace("/(tabs)/profile");
    }
    return;
  }

  // Second Case: User is mistakenly in Auth group
  if (inAuthGroup) {
    if (!actualOnboardingCompleted) {
      router.replace(
        shouldShowWelcome
          ? "/(onboarding)/welcome"
          : "/(onboarding)/zodiacSign"
      );
    } else {
      router.replace("/(tabs)/profile");
    }
    return;
  }

  // Third Case: User is in onboarding group
  if (inOnboardingGroup) {
    if (actualOnboardingCompleted) {
      router.replace("/(tabs)/profile");
    }
    return;
  }
}, [
  isAuthenticated,
  actualOnboardingCompleted,
  shouldShowWelcome,
  sessionLoading,
  onboardingLoading,
  segments,
  router,
])};