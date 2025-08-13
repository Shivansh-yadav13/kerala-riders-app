import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function ForgotPasswordScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Reset Password</ThemedText>
      <ThemedText>Enter your email to reset your password</ThemedText>
      {/* Add your forgot password form components here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});