import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CorporateScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Corporate Wellness Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Corporate Wellness</Text>
          <Text style={styles.subtitle}>
            Connect with your company's wellness programs
          </Text>
        </View>

        {/* Company Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Leaderboard</Text>
          <View style={styles.leaderboardItem}>
            <View style={styles.rank}>
              <Text style={styles.rankText}>1</Text>
            </View>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>Priya Nair</Text>
              <Text style={styles.leaderStats}>2,847 km this month</Text>
            </View>
            <Ionicons name="trophy" size={24} color="#F7931E" />
          </View>

          <View style={styles.leaderboardItem}>
            <View style={styles.rank}>
              <Text style={styles.rankText}>2</Text>
            </View>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>Rajesh Kumar</Text>
              <Text style={styles.leaderStats}>2,156 km this month</Text>
            </View>
          </View>

          <View style={styles.leaderboardItem}>
            <View style={styles.rank}>
              <Text style={styles.rankText}>3</Text>
            </View>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>Sarah Thomas</Text>
              <Text style={styles.leaderStats}>1,987 km this month</Text>
            </View>
          </View>
        </View>

        {/* Corporate Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Corporate Challenges</Text>
          
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTitle}>Team Kerala 100km</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.challengeProgress}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Team Progress</Text>
                <Text style={styles.progressValue}>67/100 km</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "67%" }]} />
              </View>
            </View>
            <Text style={styles.challengeTime}>15 days remaining</Text>
          </View>

          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Browse More Challenges</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
  section: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#14A76C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#252525",
    marginBottom: 2,
  },
  leaderStats: {
    fontSize: 12,
    color: "#666666",
  },
  challengeCard: {
    backgroundColor: "#F7F7F7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
  },
  activeBadge: {
    backgroundColor: "#14A76C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  challengeProgress: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666666",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#252525",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#14A76C",
    borderRadius: 4,
  },
  challengeTime: {
    fontSize: 12,
    color: "#666666",
  },
  joinButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 100,
  },
});