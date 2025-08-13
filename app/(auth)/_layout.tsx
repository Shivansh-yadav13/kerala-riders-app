import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signup"
        options={{
          title: "Kerala Riders",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Kerala Riders",
        }}
      />
    </Stack>
  );
}
