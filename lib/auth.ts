import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export const AUTH_KEYS = {
  SESSION: 'supabase-session',
  USER: 'supabase-user',
} as const;

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
}

export const authHelpers = {
  async getStoredSession(): Promise<SessionData | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(AUTH_KEYS.SESSION);
      if (!sessionJson) return null;
      
      const session = JSON.parse(sessionJson);
      
      if (session.expires_at && Date.now() > session.expires_at * 1000) {
        await this.clearStoredSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting stored session:', error);
      return null;
    }
  },

  async storeSession(session: any): Promise<void> {
    try {
      const sessionData: SessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user_id: session.user?.id,
      };
      
      await AsyncStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  },

  async clearStoredSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_KEYS.SESSION, AUTH_KEYS.USER]);
    } catch (error) {
      console.error('Error clearing stored session:', error);
    }
  },

  async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  },

  async refreshSessionIfNeeded(): Promise<boolean> {
    try {
      const storedSession = await this.getStoredSession();
      if (!storedSession) return false;

      const timeUntilExpiry = (storedSession.expires_at * 1000) - Date.now();
      const shouldRefresh = timeUntilExpiry < 5 * 60 * 1000;

      if (shouldRefresh) {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: storedSession.refresh_token,
        });

        if (error || !data.session) {
          await this.clearStoredSession();
          return false;
        }

        await this.storeSession(data.session);
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  },

  async handleAuthError(error: any): Promise<void> {
    if (error?.message?.includes('refresh_token_not_found') || 
        error?.message?.includes('invalid_grant')) {
      await this.clearStoredSession();
    }
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  formatAuthError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    
    switch (error?.code || error?.status) {
      case 'email_not_confirmed':
        return 'Please check your email and click the verification link';
      case 'invalid_credentials':
        return 'Invalid email or password';
      case 'too_many_requests':
        return 'Too many attempts. Please try again later';
      case 'user_already_registered':
        return 'An account with this email already exists';
      default:
        return 'An unexpected error occurred. Please try again';
    }
  },
};