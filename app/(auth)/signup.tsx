import { CustomTextInput } from "@/components/CustomTextInput";
import {
  CameraIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/components/Icons";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (password.length < 6)
      return { strength: "Weak", color: "#EF4444", width: "33%" };
    if (password.length < 8)
      return { strength: "Medium", color: "#F59E0B", width: "66%" };
    return { strength: "Strong", color: "#10B981", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (!agreeToTerms) {
      Alert.alert("Error", "Please agree to the Terms & Conditions");
      return;
    }
    // Handle signup logic here
    console.log("Signup attempt:", { fullName, email, password });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Profile Picture Upload */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <UserIcon width={32} height={32} color="#9CA3AF" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <CameraIcon width={16} height={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <CustomTextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<UserIcon width={20} height={20} color="#9CA3AF" />}
          />

          {/* Email */}
          <CustomTextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<MailIcon width={20} height={20} color="#9CA3AF" />}
          />

          {/* Password */}
          <View>
            <CustomTextInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<LockIcon width={20} height={20} color="#9CA3AF" />}
              rightIcon={<EyeIcon width={20} height={20} color="#9CA3AF" />}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        backgroundColor: passwordStrength.color,
                      },
                      { width: passwordStrength.width as any },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.strength}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton}>
          <Link href="/(auth)/user-info" asChild>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </Link>
        </TouchableOpacity>

        {/* Already have account */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign Up */}
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={require("@/assets/images/icons/google.png")}
            style={styles.googleLogo}
          />
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        {/* Terms and Conditions */}
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAgreeToTerms(!agreeToTerms)}
        >
          <View
            style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
          >
            {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#252525",
    marginLeft: 8,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 96,
    height: 96,
    backgroundColor: "#E5E7EB",
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: "#14A76C",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
  signUpButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 14,
    color: "#14A76C",
    fontWeight: "500",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#14A76C",
    borderColor: "#14A76C",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  termsLink: {
    color: "#14A76C",
    fontWeight: "500",
  },
});
