import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

WebBrowser.maybeCompleteAuthSession();

export interface AuthUser extends User {
  profile?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    location?: string;
    date_of_birth?: string;
    gender?: string;
    preferred_language?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthActions {
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signInOTPVerification: (
    email: string,
    token: string
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  resendOTP: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      initialized: false,
      error: null,

      signInWithGoogle: async () => {
        console.log("🚀 [Google Sign-in] Starting Google OAuth flow...");
        set({ loading: true, error: null });

        try {
          const redirectUrl = "keralaridersapp://signup";
          console.log("📱 [Google Sign-in] Redirect URL:", redirectUrl);

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              skipBrowserRedirect: true,
              queryParams: {
                access_type: "offline",
                prompt: "consent",
              },
            },
          });

          console.log("🔗 [Google Sign-in] OAuth response:", { data, error });

          if (error) {
            console.error("❌ [Google Sign-in] OAuth error:", error);
            set({ error: error.message, loading: false });
            return { user: null, error };
          }

          if (data.url) {
            console.log(
              "🌐 [Google Sign-in] Opening auth session with URL:",
              data.url
            );
            const result = await WebBrowser.openAuthSessionAsync(
              data.url,
              redirectUrl,
              { showInRecents: true }
            );

            console.log("📲 [Google Sign-in] WebBrowser result:", result);

            if (result.type === "success" && result.url) {
              console.log(
                "✅ [Google Sign-in] Auth session successful, callback URL:",
                result.url
              );

              // Extract the session from URL fragments
              const url = new URL(result.url);
              const params = new URLSearchParams(url.hash.slice(1));

              console.log(
                "🔍 [Google Sign-in] URL hash params:",
                Object.fromEntries(params.entries())
              );

              const access_token = params.get("access_token");
              const refresh_token = params.get("refresh_token");

              console.log("🔑 [Google Sign-in] Tokens extracted:", {
                hasAccessToken: !!access_token,
                hasRefreshToken: !!refresh_token,
                accessTokenLength: access_token?.length || 0,
                refreshTokenLength: refresh_token?.length || 0,
              });

              if (access_token && refresh_token) {
                console.log(
                  "💾 [Google Sign-in] Setting session with tokens..."
                );
                const { data: sessionData, error: sessionError } =
                  await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                  });

                console.log("🗄️ [Google Sign-in] Session data response:", {
                  sessionData,
                  sessionError,
                });

                if (sessionError) {
                  console.error(
                    "❌ [Google Sign-in] Session error:",
                    sessionError
                  );
                  set({ error: sessionError.message, loading: false });
                  return { user: null, error: sessionError };
                }

                if (sessionData.user && sessionData.session) {
                  console.log("👤 [Google Sign-in] User data from session:", {
                    id: sessionData.user.id,
                    email: sessionData.user.email,
                    user_metadata: sessionData.user.user_metadata,
                    app_metadata: sessionData.user.app_metadata,
                  });

                  // Extract user data from Google profile
                  const userData = {
                    full_name:
                      sessionData.user.user_metadata?.full_name ||
                      sessionData.user.user_metadata?.name ||
                      "",
                    is_active: true,
                    is_data_consent: false,
                    is_email_verified: true, // Google accounts are pre-verified
                    is_mobile_verified: false,
                    phone_number: null,
                    gender: null,
                    uae_emirate: null,
                    city: null,
                    kerala_district: null,
                  };

                  console.log(
                    "📝 [Google Sign-in] Prepared user data:",
                    userData
                  );

                  // Update user metadata with additional profile data
                  console.log("🔄 [Google Sign-in] Updating user metadata...");
                  await supabase.auth.updateUser({
                    data: userData,
                  });

                  const userWithProfile = {
                    ...sessionData.user,
                    profile: {
                      full_name:
                        sessionData.user.user_metadata?.full_name ||
                        sessionData.user.user_metadata?.name ||
                        "",
                      avatar_url:
                        sessionData.user.user_metadata?.avatar_url ||
                        sessionData.user.user_metadata?.picture ||
                        "",
                    },
                  };

                  console.log(
                    "👤 [Google Sign-in] Final user with profile:",
                    userWithProfile
                  );
                  console.log("🎯 [Google Sign-in] Session details:", {
                    access_token:
                      sessionData.session.access_token?.substring(0, 20) +
                      "...",
                    refresh_token:
                      sessionData.session.refresh_token?.substring(0, 20) +
                      "...",
                    expires_at: sessionData.session.expires_at,
                    user_id: sessionData.session.user?.id,
                  });

                  set({
                    user: userWithProfile,
                    session: sessionData.session,
                    loading: false,
                  });

                  console.log(
                    "✅ [Google Sign-in] Successfully stored user and session in state"
                  );

                  return { user: sessionData.user, error: null };
                }
              } else {
                console.error(
                  "❌ [Google Sign-in] Missing tokens from callback"
                );
                throw new Error("No access token received from Google OAuth");
              }
            } else if (result.type === "cancel") {
              console.log("🚫 [Google Sign-in] User cancelled the sign-in");
              throw new Error("Google sign-in was cancelled");
            } else {
              console.error(
                "❌ [Google Sign-in] WebBrowser result not successful:",
                result
              );
              throw new Error("Google sign-in failed");
            }
          } else {
            console.error(
              "❌ [Google Sign-in] No OAuth URL received from Supabase"
            );
            throw new Error("No OAuth URL received from Supabase");
          }

          return {
            user: null,
            error: { message: "No user data received" } as AuthError,
          };
        } catch (error: any) {
          const errorMessage =
            error.message ||
            "An unexpected error occurred during Google sign-in";
          console.error("💥 [Google Sign-in] Final catch error:", error);
          set({ error: errorMessage, loading: false });
          return { user: null, error: { message: errorMessage } as AuthError };
        }
      },

      signUp: async (email: string, password: string, userData = {}) => {
        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData,
            },
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { user: null, error };
          }

          if (data.user && data.session) {
            const userWithProfile = { ...data.user, profile: userData };
            set({
              user: userWithProfile,
              session: data.session,
              loading: false,
            });
          }

          return { user: data.user, error: null };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { user: null, error: { message: errorMessage } as AuthError };
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { user: null, error };
          }

          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              loading: false,
            });
          }

          return { user: data.user, error: null };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { user: null, error: { message: errorMessage } as AuthError };
        }
      },

      signInOTPVerification: async (email: string, token: string) => {
        set({ loading: true, error: null });

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { user: null, error };
          }

          if (data.user && data.session) {
            // Update user metadata to mark email as verified
            await supabase.auth.updateUser({
              data: { is_email_verified: true },
            });

            // Update the user object with the verified status
            const updatedUser = {
              ...data.user,
              user_metadata: {
                ...data.user.user_metadata,
                is_email_verified: true,
              },
            };

            set({
              user: updatedUser,
              session: data.session,
              loading: false,
            });
          }

          return { user: data.user, error: null };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { user: null, error: { message: errorMessage } as AuthError };
        }
      },

      resendOTP: async (email: string) => {
        set({ loading: true, error: null });

        try {
          const { error } = await supabase.auth.resend({
            type: "signup",
            email,
          });

          set({ loading: false });

          if (error) {
            set({ error: error.message });
            return { error };
          }

          return { error: null };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { error: { message: errorMessage } as AuthError };
        }
      },

      signOut: async () => {
        set({ loading: true });

        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            set({ error: error.message, loading: false });
            return;
          }

          set({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
        }
      },

      resetPassword: async (email: string) => {
        set({ loading: true, error: null });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);

          set({ loading: false });

          if (error) {
            set({ error: error.message });
            return { error };
          }

          return { error: null };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { error: { message: errorMessage } as AuthError };
        }
      },

      updateProfile: async (updates: any) => {
        const { user } = get();
        if (!user) {
          const error = { message: "No user found" } as AuthError;
          set({ error: error.message });
          return { error };
        }

        set({ loading: true, error: null });

        try {
          const { error } = await supabase.auth.updateUser({
            data: updates,
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { error };
          }

          const updatedUser = {
            ...user,
            profile: { ...user.profile, ...updates },
          };

          set({ user: updatedUser, loading: false });
          return { error: null };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          set({ error: errorMessage, loading: false });
          return { error: { message: errorMessage } as AuthError };
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();

          if (error) {
            set({ error: error.message });
            return;
          }

          if (data.user && data.session) {
            set({ user: data.user, session: data.session });
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to refresh session";
          set({ error: errorMessage });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearAllData: async () => {
        try {
          // Clear Zustand persisted data
          await AsyncStorage.removeItem("auth-storage");
          // Clear any other auth-related data
          await AsyncStorage.removeItem("pending_verification_email");
          // Reset store state
          set({
            user: null,
            session: null,
            loading: false,
            initialized: false,
            error: null,
          });
        } catch (error) {
          console.error("Error clearing auth data:", error);
        }
      },

      initialize: async () => {
        if (get().initialized) return;

        set({ loading: true });

        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            set({ error: error.message, loading: false, initialized: true });
            return;
          }

          if (session) {
            set({
              user: session.user,
              session,
              loading: false,
              initialized: true,
            });
          } else {
            set({
              user: null,
              session: null,
              loading: false,
              initialized: true,
            });
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
              set({ user: session.user, session });
            } else if (event === "SIGNED_OUT") {
              set({ user: null, session: null });
            } else if (event === "TOKEN_REFRESHED" && session) {
              set({ user: session.user, session });
            }
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to initialize auth";
          set({ error: errorMessage, loading: false, initialized: true });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
