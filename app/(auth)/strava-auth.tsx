import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from "@/hooks/useAuth";

WebBrowser.maybeCompleteAuthSession();

// Strava OAuth Configuration
const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET;
const STRAVA_REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

const StravaIcon = ({ width = 24, height = 24 }) => (
  <Image
    source={require("@/assets/images/icons/strava.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const ActivityIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/running-orange.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const TrophyIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/trophy-green.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const GraphIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/graph.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

export default function StravaAuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile, user } = useAuth();

  const discovery = {
    authorizationEndpoint: 'https://www.strava.com/oauth/authorize',
    tokenEndpoint: 'https://www.strava.com/oauth/token',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: STRAVA_CLIENT_ID || '',
      scopes: ['read', 'activity:read_all', 'profile:read_all'],
      redirectUri: STRAVA_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      exchangeCodeForToken(response.params.code);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', response.params.error_description || 'Failed to authenticate with Strava');
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    setIsLoading(true);
    try {
      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        // Save Strava data to user profile
        const stravaData = {
          strava_access_token: tokenData.access_token,
          strava_refresh_token: tokenData.refresh_token,
          strava_athlete_id: tokenData.athlete.id,
          strava_connected: true,
          strava_connected_date: new Date().toISOString(),
          strava_opted: true,
        };

        const { error } = await updateProfile(stravaData);

        if (error) {
          Alert.alert('Error', 'Failed to save Strava connection');
        } else {
          Alert.alert(
            'Success!',
            'Your Strava account has been connected successfully.',
            [{ text: 'OK', onPress: () => router.push("/(app)/user-profile") }]
          );
        }
      } else {
        Alert.alert('Error', 'Failed to get access token from Strava');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      Alert.alert('Error', 'Failed to connect to Strava. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStrava = async () => {
    if (!STRAVA_CLIENT_ID) {
      Alert.alert('Configuration Error', 'Strava client ID is not configured');
      return;
    }
    
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Failed to open Strava authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Update user metadata to reflect they skipped Strava connection
    // but had initially opted for it in consent
    if (user) {
      updateProfile({ strava_skipped: true });
    }
    router.push("/(app)/user-profile");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <StravaIcon width={64} height={64} />
            <Text style={styles.title}>Connect with Strava</Text>
            <Text style={styles.description}>
              Sync your runs, rides, and workouts to get the most out of Kerala Riders
            </Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What you'll get:</Text>
            
            <View style={styles.benefitItem}>
              <ActivityIcon width={20} height={20} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Activity Sync</Text>
                <Text style={styles.benefitDescription}>
                  Automatically import your runs, rides, and other activities
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <TrophyIcon width={20} height={20} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Achievements & Goals</Text>
                <Text style={styles.benefitDescription}>
                  Track your progress and compete with other Kerala Riders
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <GraphIcon width={20} height={20} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Performance Analytics</Text>
                <Text style={styles.benefitDescription}>
                  Get detailed insights into your training and performance
                </Text>
              </View>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyTitle}>Privacy & Permissions</Text>
            <Text style={styles.privacyText}>
              We only access your public activities and basic profile information. 
              You can disconnect Strava anytime in your settings.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.connectButton, isLoading && styles.buttonDisabled]}
              onPress={handleConnectStrava}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <StravaIcon width={20} height={20} />
                  <Text style={styles.connectButtonText}>Connect with Strava</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            By connecting Strava, you agree to share your activity data with Kerala Riders 
            as outlined in our Privacy Policy.
          </Text>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#252525",
    marginTop: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  privacyNotice: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: "#FC4C02", // Strava orange color
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  skipButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerNote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
});