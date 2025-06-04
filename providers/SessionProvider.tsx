import React, { createContext, useContext, ReactNode } from "react";
import { authClient } from "../lib/auth-client"; //

interface ApiUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

interface ApiSessionDetails {
  id: string;
  token: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface AuthData {
  user: ApiUser;
  session: ApiSessionDetails;
}

interface SessionContextType {
  session: AuthData | null; // Das 'session'-Feld im Context hält nun AuthData
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const {
    data, // 'data' ist vom Typ AuthData | null
    isPending: isLoading,
    error,
  } = authClient.useSession(); //

  console.log("SessionProvider data:", JSON.stringify(data, null, 2));

  return (
    <SessionContext.Provider
      value={{
        session: data, // Das 'data'-Objekt direkt an 'session' im Value übergeben
        isLoading,
        error,
        isAuthenticated: !!(data && data.user && !error), // Prüft auf data und data.user
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
