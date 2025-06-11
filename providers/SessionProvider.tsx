import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { SessionContextType } from "../types/auth/auth";
import { authClient, clearStoredBearerToken } from "../lib/auth-client";
import { DeviceEventEmitter } from "react-native";

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const {
    data,
    isPending: isLoading,
    error,
    refetch,
  } = authClient.useSession();
  console.log("SessionProvider data:", JSON.stringify(data, null, 2));

  const signOut = useCallback(async () => {
    await clearStoredBearerToken();
    refetch();
  }, [refetch]);

  useEffect(() => {
    const handleAuthError = () => {
      console.log(
        '[SessionProvider] "auth-token-invalid" event caught from DeviceEventEmitter. Signing out.'
      );
      signOut();
    };

    const subscription = DeviceEventEmitter.addListener(
      "auth-token-invalid",
      handleAuthError
    );

    return () => {
      subscription.remove();
    };
  }, [signOut]);

  return (
    <SessionContext.Provider
      value={{
        session: data,
        isLoading,
        error,
        isAuthenticated: !!(data && data.user && !error),
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within SessionProvider");
  return context;
};
