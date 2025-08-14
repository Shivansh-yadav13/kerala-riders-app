import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
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
  );
}
