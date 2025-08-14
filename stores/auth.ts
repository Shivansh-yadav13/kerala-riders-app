import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
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
              loading: false 
            });
          }

          return { user: data.user, error: null };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
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
              loading: false 
            });
          }

          return { user: data.user, error: null };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
          return { user: null, error: { message: errorMessage } as AuthError };
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
            error: null 
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
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
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
          return { error: { message: errorMessage } as AuthError };
        }
      },

      updateProfile: async (updates: any) => {
        const { user } = get();
        if (!user) {
          const error = { message: 'No user found' } as AuthError;
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
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
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
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh session';
          set({ error: errorMessage });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: async () => {
        if (get().initialized) return;
        
        set({ loading: true });
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            set({ error: error.message, loading: false, initialized: true });
            return;
          }

          if (session) {
            set({ 
              user: session.user, 
              session, 
              loading: false, 
              initialized: true 
            });
          } else {
            set({ 
              user: null, 
              session: null, 
              loading: false, 
              initialized: true 
            });
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              set({ user: session.user, session });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ user: session.user, session });
            }
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize auth';
          set({ error: errorMessage, loading: false, initialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);