import React, { createContext, useContext, ReactNode } from "react";
import { authClient } from "../lib/auth-client";

interface SessionContextType {
  session: any;
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const {
    data: session,
    isPending: isLoading,
    error,
  } = authClient.useSession();

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        error,
        isAuthenticated: !!(session && !error),
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
