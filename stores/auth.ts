import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, Session, User } from "@supabase/supabase-js";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
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
  signInWithStrava: () => Promise<{
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
  refreshStravaToken: () => Promise<{ error: AuthError | null }>;
  checkAndRefreshStravaToken: () => Promise<{ error: AuthError | null }>;
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

      signInWithStrava: async () => {
        console.log("🚀 [Strava Sign-in] Starting Strava OAuth flow...");
        set({ loading: true, error: null });

        const scopes = [
          "read",
          "read_all",
          "profile:read_all",
          "profile:write",
          "activity:read",
          "activity:read_all",
          "activity:write",
        ].join(",");

        try {
          const STRAVA_CLIENT_ID = 173716;
          const STRAVA_CLIENT_SECRET =
            "6a07e6d7563960d4d0596ed8d6ff3a7146b943b6";
          const REDIRECT_URI = `https://keralariders.vercel.app/auth/strava/bridge?platform=mobile`;
          const result = await WebBrowser.openAuthSessionAsync(
            `http://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${scopes}`,
            `keralaridersapp://strava/callback`
          );

          if (result.type === "success" && result.url) {
            console.log(
              "✅ [Strava Sign-in] Auth session successful, callback URL:",
              result.url
            );

            const url = new URL(result.url);
            const params = new URLSearchParams(url.search);

            console.log(
              "🔍 [Strava Sign-in] URL query params:",
              Object.fromEntries(params.entries())
            );

            const auth_code = params.get("code");

            if (auth_code) {
              try {
                const request = await axios.post(
                  `https://www.strava.com/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${auth_code}&grant_type=authorization_code`
                );
                const refreshToken = request.data.refresh_token;
                const accessToken = request.data.access_token;
                const expiresAt = request.data.expires_at;

                // Store Strava tokens in user's metadata
                const stravaAthleteId = request.data.athlete.id;

                const { user } = get();
                if (!user) {
                  console.error(
                    "❌ [Strava Sign-in] No authenticated user found"
                  );
                  throw new Error(
                    "User must be authenticated before linking Strava"
                  );
                }

                const { error: updateError } = await supabase.auth.updateUser({
                  data: {
                    strava_access_token: accessToken,
                    strava_refresh_token: refreshToken,
                    strava_athlete_id: stravaAthleteId,
                    strava_expires_at: expiresAt,
                  },
                });

                if (updateError) {
                  console.error(
                    "❌ [Strava Sign-in] Failed to update user metadata:",
                    updateError
                  );
                  throw new Error("Failed to store Strava credentials");
                }

                // Update the user in the store with new metadata
                const updatedUser = {
                  ...user,
                  user_metadata: {
                    ...user.user_metadata,
                    strava_access_token: accessToken,
                    strava_refresh_token: refreshToken,
                    strava_athlete_id: stravaAthleteId,
                    strava_expires_at: expiresAt,
                  },
                };

                set({ user: updatedUser, loading: false });

                console.log(
                  "✅ [Strava Sign-in] Successfully linked Strava account"
                );
                return { user: updatedUser, error: null };
              } catch (error) {
                console.error("❌ [Strava Sign-in] Session error:", error);
                set({ error: "Strava Session Error", loading: false });
                return {
                  user: null,
                  error: { message: "Strava Session Error" } as AuthError,
                };
              }
            } else {
              console.error("❌ [Strava Sign-in] Missing tokens from callback");
              throw new Error("No access token received from Strava OAuth");
            }
          } else if (result.type === "cancel") {
            console.log("🚫 [Strava Sign-in] User cancelled the sign-in");
            throw new Error("Strava sign-in was cancelled");
          } else {
            console.error(
              "❌ [Strava Sign-in] WebBrowser result not successful:",
              result
            );
            throw new Error("Strava sign-in failed");
          }
        } catch (error: any) {
          const errorMessage =
            error.message ||
            "An unexpected error occurred during Strava sign-in";
          console.error("💥 [Strava Sign-in] Final catch error:", error);
          set({ error: errorMessage, loading: false });
          return { user: null, error: { message: errorMessage } as AuthError };
        }
      },

      signInWithGoogle: async () => {
        console.log("🚀 [Google Sign-in] Starting Google OAuth flow...");
        set({ loading: true, error: null });

        try {
          const redirectUrl = "keralaridersapp://signup";
          console.log("📱 [Google Sign-in] Redirect URL:", redirectUrl);

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              // skipBrowserRedirect: true,
              redirectTo: redirectUrl,
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

                  // Check if this is an existing user and their authentication providers
                  const userProviders =
                    sessionData.user.app_metadata?.providers || [];
                  const isExistingUser =
                    sessionData.user.created_at !==
                      sessionData.user.updated_at ||
                    sessionData.user.user_metadata?.is_active !== undefined;

                  console.log("🔍 [Google Sign-in] User check:", {
                    isExistingUser,
                    providers: userProviders,
                    createdAt: sessionData.user.created_at,
                    updatedAt: sessionData.user.updated_at,
                  });

                  // If user exists but was created with a different provider (not Google)
                  if (
                    isExistingUser &&
                    userProviders.length > 0 &&
                    !userProviders.includes("google")
                  ) {
                    console.log(
                      "❌ [Google Sign-in] User exists with different provider:",
                      userProviders
                    );
                    await supabase.auth.signOut(); // Sign out the Google session
                    set({
                      error:
                        "This email is already registered with a different login method. Please use your password to sign in.",
                      loading: false,
                    });
                    return {
                      user: null,
                      error: {
                        message:
                          "This email is already registered with a different login method. Please use your password to sign in.",
                      } as AuthError,
                    };
                  }

                  // Only update metadata for new users or if metadata is incomplete
                  const shouldUpdateMetadata =
                    !isExistingUser ||
                    !sessionData.user.user_metadata?.is_active ||
                    !sessionData.user.user_metadata?.full_name;

                  if (shouldUpdateMetadata) {
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
                      "📝 [Google Sign-in] Updating user metadata:",
                      userData
                    );
                    await supabase.auth.updateUser({
                      data: userData,
                    });
                  } else {
                    console.log(
                      "✅ [Google Sign-in] Existing user with complete metadata - skipping update"
                    );
                  }

                  // Use the user as-is, since all data is in user_metadata
                  const userWithProfile = sessionData.user;

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
          const { data, error } = await supabase.auth.updateUser({
            data: updates,
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { error };
          }

          // Use the updated user from the response to ensure we have the latest data
          const updatedUser = data.user || {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              ...updates,
            },
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

      refreshStravaToken: async () => {
        const { user } = get();
        if (!user || !user.user_metadata?.strava_refresh_token) {
          const error = { message: "No Strava refresh token found" } as AuthError;
          set({ error: error.message });
          return { error };
        }

        console.log("🔄 [Strava Refresh] Refreshing Strava access token...");

        try {
          const STRAVA_CLIENT_ID = 173716;
          const STRAVA_CLIENT_SECRET = "6a07e6d7563960d4d0596ed8d6ff3a7146b943b6";
          
          const response = await axios.post(
            "https://www.strava.com/oauth/token",
            {
              client_id: STRAVA_CLIENT_ID,
              client_secret: STRAVA_CLIENT_SECRET,
              grant_type: "refresh_token",
              refresh_token: user.user_metadata.strava_refresh_token,
            }
          );

          const { access_token, refresh_token, expires_at } = response.data;

          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              strava_access_token: access_token,
              strava_refresh_token: refresh_token,
              strava_expires_at: expires_at,
            },
          });

          if (updateError) {
            console.error("❌ [Strava Refresh] Failed to update tokens:", updateError);
            set({ error: updateError.message });
            return { error: updateError };
          }

          const updatedUser = {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              strava_access_token: access_token,
              strava_refresh_token: refresh_token,
              strava_expires_at: expires_at,
            },
          };

          set({ user: updatedUser });
          console.log("🔄✅ [STRAVA TOKEN REFRESHED] Successfully refreshed Strava access token");
          return { error: null };

        } catch (error: any) {
          const errorMessage = error.message || "Failed to refresh Strava token";
          console.error("❌ [Strava Refresh] Error:", error);
          set({ error: errorMessage });
          return { error: { message: errorMessage } as AuthError };
        }
      },

      checkAndRefreshStravaToken: async () => {
        console.log("🔍 [Strava Token Check] Starting token check...");
        const { user } = get();
        
        if (!user || !user.user_metadata?.strava_access_token) {
          console.log("ℹ️ [Strava Token Check] No Strava access token found - user hasn't linked Strava");
          return { error: null };
        }

        const expiresAt = user.user_metadata.strava_expires_at;
        
        // If no expiration time found, refresh the token
        if (!expiresAt) {
          console.log("⚠️ [Strava Token Check] No expiration time found - refreshing token...");
          const result = await get().refreshStravaToken();
          if (!result.error) {
            console.log("🔄✅ [STRAVA TOKEN REFRESHED] Token refresh completed successfully (no expiry time)");
          }
          return result;
        }

        const currentTime = Math.floor(Date.now() / 1000);

        console.log("🔍 [Strava Token Check] Current time:", currentTime, "Expires at:", expiresAt);
        console.log("🔍 [Strava Token Check] Time until expiry:", expiresAt - currentTime, "seconds");

        if (currentTime >= expiresAt) {
          console.log("⚠️ [Strava Token Check] Token expired, refreshing...");
          const result = await get().refreshStravaToken();
          if (!result.error) {
            console.log("🔄✅ [STRAVA TOKEN REFRESHED] Token refresh completed successfully");
          }
          return result;
        } else {
          console.log("✅ [Strava Token Check] Token is still valid");
          return { error: null };
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
