import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '../lib/auth-client';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface BetterAuthErrorWithType extends Error {
  message: string;
  code?: string;
  httpStatus?: number;
}

export const useProfileActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signOut();
      await GoogleSignin.signOut();
      router.replace('/(auth)/sign-in' as any);
    } catch (e: any) {
      const err = e as BetterAuthErrorWithType;
      console.error('Logout failed:', err);
      setError(`Logout fehlgeschlagen: ${err.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Konto löschen',
      'Sind Sie sicher, dass Sie Ihr Konto dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setError(null);
            try {
              await authClient.deleteUser();
              await GoogleSignin.signOut();
              Alert.alert('Erfolg', 'Ihr Konto wurde erfolgreich gelöscht.');
              router.replace('/(auth)/sign-in' as any);
            } catch (e: any) {
              const err = e as BetterAuthErrorWithType;
              console.error('Account deletion failed:', err);
              let errorMessage = 'Kontolöschung fehlgeschlagen.';
              if (err.message) {
                errorMessage += ` ${err.message}`;
              }
              if (err.code === 'requires-recent-login') {
                errorMessage = 'Diese Aktion erfordert eine kürzliche Anmeldung. Bitte melden Sie sich erneut an und versuchen Sie es erneut.';
              }
              setError(errorMessage);
              Alert.alert('Fehler', errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return {
    handleLogout,
    handleDeleteAccount,
    isActionLoading: isLoading,
    actionError: error,
  };
};