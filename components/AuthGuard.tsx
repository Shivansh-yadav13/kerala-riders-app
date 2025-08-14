import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/(auth)/signup',
}) => {
  const { isAuthenticated, loading, initialized } = useAuth();

  useEffect(() => {
    if (!loading && initialized) {
      if (requireAuth && !isAuthenticated) {
        router.replace(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, loading, initialized, requireAuth, redirectTo]);

  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14A76C" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </View>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14A76C" />
        <ThemedText style={styles.loadingText}>Redirecting...</ThemedText>
      </View>
    );
  }

  if (!requireAuth && isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14A76C" />
        <ThemedText style={styles.loadingText}>Redirecting...</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});