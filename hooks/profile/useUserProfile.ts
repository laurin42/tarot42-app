import { useState, useEffect, useCallback } from 'react';
import { authClient, API_BASE_URL, SECURE_STORE_BEARER_TOKEN_KEY } from '../../lib/auth-client';
import type { ProfileData, UserGoal } from '../../types/profile';
import * as SecureStore from 'expo-secure-store';



// Custom hook to manage user profile data
export const useUserProfile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
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


    // Fetch profile data
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });
      
      let fetchedProfileData: Partial<ProfileData> = {}; 
      
      if (!profileResponse.ok) {
        throw new Error('Fehler beim Laden des Profils.');
      }

      else {
      const profileDataFromApi = await profileResponse.json();
      fetchedProfileData = {
        id: profileDataFromApi.id || sessionData.user?.id || '',
        userName: profileDataFromApi.name || sessionData.user?.name || 'Nutzer',
        email: profileDataFromApi.email || sessionData.user?.email,
        zodiacSign: profileDataFromApi.zodiacSign,
        element: profileDataFromApi.element,
        userGoals: profileDataFromApi.userGoals || [],
        additionalDetails: profileDataFromApi.additionalDetails,
        focusArea: profileDataFromApi.focusArea,
        gender: profileDataFromApi.gender,
        ageRange: profileDataFromApi.ageRange,
        birthDateTime:profileDataFromApi.birthDateTime,
        includeTime: profileDataFromApi.includeTime,
      };
    }

          setProfileData(prev => ({
        ...(prev || {}), 
        ...fetchedProfileData, 
        userGoals: prev?.userGoals || [] 
      } as ProfileData));




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



// Refresh function to reload data
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
    profileData,
    userGoals,
    isLoading,
    error,
    refreshing,
    onRefresh,
    refetch: fetchData, 
  };
};