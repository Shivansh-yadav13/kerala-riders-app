import { CustomTextInput } from "@/components/CustomTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmailVerificationScreen() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const { signInOTPVerification, resendOTP } = useAuth();

  useEffect(() => {
    // Get stored email from signup
    const getStoredEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem(
          "pending_verification_email"
        );
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          router.push("/(auth)/signup");
        }
      } catch (error) {
        console.error("Error getting stored email:", error);
      }
    };

    getStoredEmail();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert("Error", "Verification code must be 6 digits");
      return;
    }

    try {
      const { user, error } = await signInOTPVerification(
        email,
        verificationCode
      );

      if (error) {
        Alert.alert("Verification Failed", error.message);
        return;
      }

      if (user) {
        // Clear stored email
        await AsyncStorage.removeItem("pending_verification_email");
        Alert.alert("Success", "Email verified successfully!");
        router.push("/(auth)/user-info");
      }
    } catch (err) {
      Alert.alert("Error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const { error } = await resendOTP(email);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Verification code sent to your email");
      setResendCooldown(60); // 60 second cooldown
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kerala Riders</Text>
          <Text style={styles.subtitle}>Verify Your Email</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Email Verification Section */}
          <View style={styles.verificationSection}>
            <Text style={styles.sectionTitle}>Email Verification</Text>
            <Text style={styles.description}>
              We have sent you an OTP to {email}. Please enter the 6-digit code
              to continue.
            </Text>

            {/* Verification Code Input */}
            <CustomTextInput
              label="Verification Code"
              placeholder="000000"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              containerStyle={styles.inputContainer}
            />

            {/* Resend OTP */}
            <TouchableOpacity
              style={[
                styles.resendButton,
                resendCooldown > 0 && styles.resendButtonDisabled,
              ]}
              onPress={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
            >
              <Text
                style={[
                  styles.resendText,
                  resendCooldown > 0 && styles.resendTextDisabled,
                ]}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              loading && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? "Verifying..." : "Verify"}
            </Text>
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
  verifyButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  resendButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: "#14A76C",
    fontSize: 14,
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: "#9CA3AF",
  },
});
