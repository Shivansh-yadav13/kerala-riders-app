import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Icon Components using high-resolution PNG images
const ShieldIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/shield.png")}
    style={{ width, height, tintColor: "#6B7280", resizeMode: "contain" }}
  />
);

const UserIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/user-settings-green.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const UsersIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/user-group-green.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const EnvelopeIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/main-orange.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const ActivityIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/strava.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const LockIcon = ({ width = 12, height = 12 }) => (
  <Image
    source={require("@/assets/images/icons/lock.svg")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const ToggleIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/switch.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const DocumentIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/docs-green.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const SettingsIcon = ({ width = 16, height = 16 }) => (
  <Image
    source={require("@/assets/images/icons/settings-green.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

// Toggle Switch Component
const ToggleSwitch = ({
  value,
  onValueChange,
  disabled = false,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        value ? styles.toggleActive : styles.toggleInactive,
        disabled && styles.toggleDisabled,
      ]}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <View
        style={[
          styles.toggleCircle,
          value ? styles.toggleCircleActive : styles.toggleCircleInactive,
          disabled && styles.toggleCircleDisabled,
        ]}
      >
        {disabled && <LockIcon width={12} height={12} />}
      </View>
    </TouchableOpacity>
  );
};

export default function ConsentScreen() {
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [stravaConsent, setStravaConsent] = useState(false);
  const { updateProfile, user } = useAuth();

  const handleContinue = async () => {
    if (!user) {
      Alert.alert("Error", "No user session found");
      return;
    }

    const consentData = {
      is_data_consent: true,
      account_functionality: true,
      community_features: true,
      marketing_communications: marketingConsent,
      strava_data_sharing: stravaConsent,
      consent_date: new Date().toISOString(),
    };

    const { error } = await updateProfile(consentData);
    
    if (error) {
      Alert.alert("Error", "Failed to save consent preferences");
      return;
    }

    router.push("/(tabs)");
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Registration",
      "Are you sure you want to cancel the registration process?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", style: "destructive" },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    console.log("Open Privacy Policy");
  };

  const handleDataRights = () => {
    console.log("Open Manage Data Rights");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kerala Riders</Text>
          <Text style={styles.subtitle}>Consent & Privacy</Text>
          <Text style={styles.description}>
            Please review and select your preferences.{"\n"}Required items must
            be accepted to continue.
          </Text>
        </View>

        {/* Required Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldIcon width={16} height={16} />
            <Text style={styles.sectionTitle}>Required (Cannot Uncheck)</Text>
          </View>

          {/* Account Functionality */}
          <View style={[styles.consentItem, styles.requiredItem]}>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <UserIcon width={16} height={16} />
                <Text style={styles.itemTitle}>Account Functionality</Text>
              </View>
              <Text style={styles.itemDescription}>
                Essential for creating and managing your account.
              </Text>
            </View>
            <ToggleSwitch
              value={true}
              onValueChange={() => {}}
              disabled={true}
            />
          </View>

          {/* Community Features */}
          <View style={[styles.consentItem, styles.requiredItem]}>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <UsersIcon width={16} height={16} />
                <Text style={styles.itemTitle}>Community Features</Text>
              </View>
              <Text style={styles.itemDescription}>
                Access to groups, leaderboards, and social interactions.
              </Text>
            </View>
            <ToggleSwitch
              value={true}
              onValueChange={() => {}}
              disabled={true}
            />
          </View>
        </View>

        {/* Optional Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ToggleIcon width={16} height={16} />
            <Text style={styles.sectionTitle}>Optional</Text>
          </View>

          {/* Marketing Communications */}
          <View style={[styles.consentItem, styles.optionalItem]}>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <EnvelopeIcon width={16} height={16} />
                <Text style={styles.itemTitle}>Marketing Communications</Text>
              </View>
              <Text style={styles.itemDescription}>
                Receive updates, newsletters, and promotional offers.
              </Text>
            </View>
            <ToggleSwitch
              value={marketingConsent}
              onValueChange={setMarketingConsent}
            />
          </View>

          {/* Strava Data Sharing */}
          <View style={[styles.consentItem, styles.optionalItem]}>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <ActivityIcon width={16} height={16} />
                <Text style={styles.itemTitle}>Strava Data Sharing</Text>
              </View>
              <Text style={styles.itemDescription}>
                Connect with Strava to sync your runs and workouts.
              </Text>
            </View>
            <ToggleSwitch
              value={stravaConsent}
              onValueChange={setStravaConsent}
            />
          </View>
        </View>

        {/* Bottom Links */}
        <View style={styles.bottomLinks}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.linkContent}>
              <DocumentIcon width={16} height={16} />
              <Text style={styles.linkText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleDataRights}
          >
            <View style={styles.linkContent}>
              <SettingsIcon width={16} height={16} />
              <Text style={styles.linkText}>Manage My Data Rights</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Accept & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#252525",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#252525",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  consentItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  requiredItem: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  optionalItem: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#252525",
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  requiredBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredBadgeText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  optionalBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalBadgeText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
    marginLeft: 16,
  },
  toggleActive: {
    backgroundColor: "#14A76C",
  },
  toggleInactive: {
    backgroundColor: "#D1D5DB",
  },
  toggleDisabled: {
    backgroundColor: "#14A76C",
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
  },
  toggleCircleInactive: {
    alignSelf: "flex-start",
  },
  toggleCircleDisabled: {
    alignSelf: "flex-end",
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  linkButton: {
    padding: 8,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#14A76C",
    fontWeight: "500",
  },
  actionButtons: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "600",
  },
});
