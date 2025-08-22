import { AuthHeader } from "@/components/AuthHeader";
import { CustomTextInput } from "@/components/CustomTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
import { authHelpers } from "@/lib/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Icon Components using high-resolution PNG images
const EmailIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/mail.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const LockIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/lock.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const EyeIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/eye.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const GoogleIcon = () => (
  <Image
    source={require("@/assets/images/icons/google.png")}
    style={styles.googleIcon}
  />
);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading, clearError } = useAuth();

  const handleLogin = async () => {
    clearError();

    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!authHelpers.validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    const { user, error } = await signIn(email, password);

    if (error) {
      Alert.alert("Login Error", authHelpers.formatAuthError(error));
      return;
    }

    if (user) {
      // Navigate to the main app
      router.replace("/(app)/user-profile");
    }
  };

  const handleGoogleLogin = async () => {
    console.log("🔵 [Login Page] Google login button pressed");
    clearError();

    console.log("🔄 [Login Page] Calling signInWithGoogle...");
    const { user, error } = await signInWithGoogle();

    console.log("📋 [Login Page] Google sign-in result:", { 
      user: user ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      } : null,
      error: error ? error.message : null
    });

    if (error) {
      console.error("❌ [Login Page] Google login error:", error.message);
      Alert.alert("Google Login Error", error.message);
      return;
    }

    if (user) {
      console.log("✅ [Login Page] Google login successful, navigating to main app");
      // Navigate to the main app
      router.replace("/(app)/user-profile");
    } else {
      console.warn("⚠️ [Login Page] No user returned but no error either");
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <AuthHeader />

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>
        </View>

        {/* Login Fields */}
        <View style={styles.formSection}>
          <CustomTextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<EmailIcon width={20} height={20} />}
          />

          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<LockIcon width={20} height={20} />}
            rightIcon={<EyeIcon width={20} height={20} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          <Text style={styles.googleButtonText}>
            {loading ? "Signing in..." : "Sign in with Google"}
          </Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#252525",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F7F7F7",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 12,
  },
  googleButtonText: {
    color: "#252525",
    fontSize: 16,
    fontWeight: "500",
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkText: {
    color: "#14A76C",
    fontSize: 14,
    fontWeight: "500",
  },
});
