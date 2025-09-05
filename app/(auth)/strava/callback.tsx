import { useAuth } from "@/hooks/useAuth";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StravaCallbackScreen() {
  const { code, state, error } = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleStravaCallback = async () => {
      console.log("🔗 [Strava Callback] Processing callback with:", {
        code: !!code,
        state,
        error,
      });

      if (error) {
        console.error("❌ [Strava Callback] OAuth error:", error);
        Alert.alert("Strava Connection Failed", error);
        router.back();
        return;
      }

      if (!code) {
        console.error("❌ [Strava Callback] No authorization code received");
        Alert.alert("Error", "No authorization code received from Strava");
        router.back();
        return;
      }

      if (!user) {
        console.error("❌ [Strava Callback] No user found");
        Alert.alert("Error", "You must be logged in to connect Strava");
        router.back();
        return;
      }

      try {
        console.log("🔄 [Strava Callback] Processing Strava connection...");
        
        // Call your webapp's API to process the Strava connection
        const response = await fetch(
          "https://keralariders.vercel.app/api/auth/strava/connect",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              state: user.id, // Use actual user ID
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to connect Strava");
        }

        console.log("✅ [Strava Callback] Successfully connected:", result);
        
        Alert.alert(
          "Strava Connected!",
          `Successfully connected to Strava as ${result.athlete.firstname} ${result.athlete.lastname}`,
          [
            {
              text: "OK",
              onPress: () => router.replace("/(app)/settings"),
            },
          ]
        );
      } catch (error: any) {
        console.error("❌ [Strava Callback] Connection error:", error);
        Alert.alert(
          "Connection Failed",
          error.message || "Failed to connect to Strava",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } finally {
        setProcessing(false);
      }
    };

    if (code || error) {
      handleStravaCallback();
    }
  }, [code, state, error, user]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={{ alignItems: "center", gap: 16 }}>
        <ActivityIndicator size="large" color="#FC4C02" />
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          {processing ? "Connecting to Strava..." : "Processing..."}
        </Text>
      </View>
    </SafeAreaView>
  );
}