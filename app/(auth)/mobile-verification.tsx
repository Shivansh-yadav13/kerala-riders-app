import { CustomTextInput } from "@/components/CustomTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MobileVerificationScreen() {
  const [verificationCode, setVerificationCode] = useState("");

  // const handleVerify = () => {
  //   if (!verificationCode) {
  //     Alert.alert("Error", "Please enter the verification code");
  //     return;
  //   }
  //   // Handle verification logic
  //   console.log("Verification code:", verificationCode);
  // };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kerala Riders</Text>
          <Text style={styles.subtitle}>Verify Your Mobile</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Mobile Verification Section */}
          <View style={styles.verificationSection}>
            <Text style={styles.sectionTitle}>Mobile Verification</Text>
            <Text style={styles.description}>
              We have sent you an OTP on your provided phone number, please
              enter the code to continue.
            </Text>

            {/* Verification Code Input */}
            <CustomTextInput
              placeholder="550 123 4567"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            // onPress={handleVerify}
          >
            <Link href={"/(auth)/consent"}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </Link>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#252525",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  mainContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  verificationSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 0,
  },
  verifyButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
