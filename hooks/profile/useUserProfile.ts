// hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { authClient, API_BASE_URL, SECURE_STORE_BEARER_TOKEN_KEY } from '../lib/auth-client';
import * as SecureStore from 'expo-secure-store';

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

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: sessionData, isPending: isSessionLoading } = authClient.useSession();

  const fetchData = useCallback(async () => {
    console.log('[useUserProfile] fetchData called');

    if (isSessionLoading) {
      console.log('[useUserProfile] session still loading. Returning early.');
      return;
    }

    if (!sessionData?.user) {
      console.log('[useUserProfile] No user data in session. Returning early.');
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    const token = await SecureStore.getItemAsync(SECURE_STORE_BEARER_TOKEN_KEY);

    setIsLoading(true);
    setError(null);

    if (!token) {
      console.log('[useUserProfile] No valid session token found.');
      setError('Kein gültiges Sitzungstoken gefunden. Bitte melde dich erneut an.');
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Fetch profile data
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Fehler beim Laden des Profils.');
      }

      const profileData = await profileResponse.json();
      setUserProfile({
        name: profileData.name || sessionData.user?.name || 'Nutzer',
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
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setUserGoals(goalsData || []);
      }
    } catch (e: any) {
      console.error('Failed to fetch data:', e);
      setError(e.message || 'Daten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [sessionData, isSessionLoading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isSessionLoading) {
      fetchData();
    } else {
      setIsLoading(true);
    }
  }, [fetchData, isSessionLoading]);

  return {
    userProfile,
    userGoals,
    isLoading,
    error,
    refreshing,
    onRefresh,
    refetch: fetchData, // Extra function for manual refetch
  };
};