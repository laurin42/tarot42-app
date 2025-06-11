export interface ApiUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export interface ApiSessionDetails {
  id: string;
  token: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthData {
  user: ApiUser;
  session: ApiSessionDetails;
}

export interface SessionContextType {
  session: AuthData | null;
  isLoading: boolean;
  error: any;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}