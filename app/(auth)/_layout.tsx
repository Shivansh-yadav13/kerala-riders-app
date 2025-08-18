import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="email-verification"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user-info"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="mobile-verification"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="consent"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
