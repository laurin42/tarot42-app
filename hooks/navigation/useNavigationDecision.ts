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
    const currentRoute = segments.join("/") || "/";

    console.log("[useNavigationDecision] Routing decision", {
      isAuthenticated,
      actualOnboardingCompleted,
      shouldShowWelcome,
      inAuthGroup,
      inOnboardingGroup,
      currentRoute,
    });

    if (isAuthenticated) {
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
      } else if (inOnboardingGroup) {
        if (actualOnboardingCompleted) {
          router.replace("/(tabs)/profile");
        }
        // else: noch im Onboarding, nichsts tun
      } else if (
        // TODO: investigate this ts error
        segments.length === 0 ||
        currentRoute === "/" ||
        currentRoute === "(tabs)"
      ) {
        if (!actualOnboardingCompleted) {
          router.replace(
            shouldShowWelcome
              ? "/(onboarding)/welcome"
              : "/(onboarding)/zodiacSign"
          );
        } else if (segments.length === 0 || currentRoute === "/") {
          router.replace("/(tabs)/profile");
        }
      }
    } else {
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
    }
  }, [
    isAuthenticated,
    actualOnboardingCompleted,
    shouldShowWelcome,
    sessionLoading,
    onboardingLoading,
    segments,
    router,
  ]);
}
