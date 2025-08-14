import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store.initialized, store.initialize]);

  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    initialized: store.initialized,
    error: store.error,
    isAuthenticated: !!store.user && !!store.session,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    updateProfile: store.updateProfile,
    refreshSession: store.refreshSession,
    clearError: store.clearError,
  };
};

export const useAuthActions = () => {
  const {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    clearError,
  } = useAuthStore();

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    clearError,
  };
};

export const useAuthState = () => {
  const {
    user,
    session,
    loading,
    initialized,
    error,
  } = useAuthStore();

  return {
    user,
    session,
    loading,
    initialized,
    error,
    isAuthenticated: !!user && !!session,
  };
};