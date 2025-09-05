import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect } from "react";

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (updates: any) => Promise<any>;
  refreshSession: () => Promise<void>;
  refreshStravaToken: () => Promise<any>;
  checkAndRefreshStravaToken: () => Promise<any>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.initialized || auth.loading) return;

    const user_metadata = auth.user?.user_metadata;

    if (auth.isAuthenticated && auth.user) {
      console.log("🔍 [AuthProvider] User authenticated, checking Strava token...");
      console.log("🔍 [AuthProvider] User metadata:", JSON.stringify(auth.user.user_metadata, null, 2));
      
      // Check and refresh Strava token if needed
      auth.checkAndRefreshStravaToken().catch((error) => {
        console.error("❌ [AuthProvider] Failed to check/refresh Strava token:", error);
      });

      const hasPhoneNumber = user_metadata?.phone_number;
      const isEmailVerified = user_metadata?.is_email_verified;
      const hasDataConsent = user_metadata?.is_data_consent;

      if (!hasPhoneNumber) {
        router.replace("/(auth)/user-info");
      } else if (!isEmailVerified) {
        router.replace("/(auth)/email-verification");
        // } else if (!user_metadata.is_mobile_verified) {
        //   router.replace("/(auth)/mobile-verification");
      } else if (!hasDataConsent) {
        router.replace("/(auth)/consent");
      } else {
        router.replace("/(app)/user-profile");
      }
    } else if (!auth.isAuthenticated && auth.initialized) {
      router.replace("/(auth)/signup");
    }
  }, [auth.user, auth.isAuthenticated, auth.initialized, auth.loading]);

  const value = {
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    initialized: auth.initialized,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updateProfile: auth.updateProfile,
    refreshSession: auth.refreshSession,
    refreshStravaToken: auth.refreshStravaToken,
    checkAndRefreshStravaToken: auth.checkAndRefreshStravaToken,
    clearError: auth.clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
