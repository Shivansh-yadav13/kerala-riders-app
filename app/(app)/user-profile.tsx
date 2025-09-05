import { useAuthContext } from "@/contexts/AuthProvider";
import { useActivityStore } from "@/stores/activity";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper functions for activity formatting
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

const formatDistance = (meters: number): string => {
  const km = meters / 1000;
  return km < 10 ? km.toFixed(2) : km.toFixed(1);
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Reset time to start of day for accurate day comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffInDays = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
  
  const timeString = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (diffInDays === 0) {
    return `Today • ${timeString}`;
  } else if (diffInDays === 1) {
    return `Yesterday • ${timeString}`;
  } else if (diffInDays > 1) {
    return `${diffInDays} days ago • ${timeString}`;
  } else {
    // Handle future dates or same day edge cases
    return `Today • ${timeString}`;
  }
};

const getActivityIcon = (sportType: string) => {
  const type = sportType.toLowerCase();
  if (type.includes('run')) return require("@/assets/images/icons/running-orange.png");
  if (type.includes('bike') || type.includes('cycle') || type.includes('ride')) return require("@/assets/images/icons/bicycle-green.png");
  if (type.includes('walk')) return require("@/assets/images/icons/running-orange.png");
  if (type.includes('swim')) return require("@/assets/images/icons/bicycle-green.png");
  if (type.includes('strength') || type.includes('weight') || type.includes('gym')) return require("@/assets/images/icons/running-orange.png");
  return require("@/assets/images/icons/running-orange.png");
};

const getActivityIconStyle = (sportType: string) => {
  const type = sportType.toLowerCase();
  if (type.includes('run') || type.includes('walk')) return { backgroundColor: "rgba(247, 147, 30, 0.1)" };
  if (type.includes('bike') || type.includes('cycle') || type.includes('ride')) return { backgroundColor: "rgba(20, 167, 108, 0.1)" };
  if (type.includes('swim')) return { backgroundColor: "rgba(6, 182, 212, 0.1)" };
  if (type.includes('strength') || type.includes('weight') || type.includes('gym')) return { backgroundColor: "rgba(139, 92, 246, 0.1)" };
  return { backgroundColor: "rgba(247, 147, 30, 0.1)" };
};

export default function UserProfileScreen() {
  const { user } = useAuthContext();
  const { activities, fetchActivities } = useActivityStore();

  // Extract user data with fallbacks
  const userData = user?.user_metadata || {};
  const fullName = userData.full_name || userData.name || "User";
  const username = userData.krid || "";
  const company = userData.company || "Corporate Wellness";
  const profileImage =
    userData.avatar_url ||
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg";

  // Get user identifier for API calls
  const getUserIdentifier = (): string => {
    if (!user?.user_metadata) return '';
    return user.user_metadata.krid || user.email || '';
  };

  // Fetch activities on component mount if not already loaded
  useEffect(() => {
    const userIdentifier = getUserIdentifier();
    if (userIdentifier && activities.length === 0) {
      fetchActivities(userIdentifier, { limit: 10 });
    }
  }, [user, activities.length, fetchActivities]);

  // Get recent activities (top 2) sorted by date
  const recentActivities = activities
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" translucent={true} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: profileImage,
              }}
              style={styles.profileImage}
            />
            <View style={styles.cameraIcon}>
              <Image
                source={require("@/assets/images/icons/camera-white.png")}
                style={styles.cameraIconImage}
              />
            </View>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userHandle}>ID: {username}</Text>
            <View style={styles.companyInfo}>
              <Image
                source={require("@/assets/images/icons/building.png")}
                style={styles.companyIcon}
              />
              <Text style={styles.companyText}>{company}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Image
                  source={require("@/assets/images/icons/running-green.png")}
                  style={{ width: 20, height: 20, resizeMode: "contain" }}
                />
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>+12</Text>
                </View>
              </View>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Total Activities</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Image
                  source={require("@/assets/images/icons/path-orange.png")}
                  style={{ width: 20, height: 20, resizeMode: "contain" }}
                />
                <Text style={styles.statUnit}>km</Text>
              </View>
              <Text style={styles.statValue}>2,847</Text>
              <Text style={styles.statLabel}>Distance Covered</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Image
                  source={require("@/assets/images/icons/trophy-green.png")}
                  style={{ width: 20, height: 20, resizeMode: "contain" }}
                />
                <View style={[styles.statBadge, styles.activeBadge]}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Challenges Joined</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Image
                  source={require("@/assets/images/icons/calendar-orange.png")}
                  style={{ width: 20, height: 20, resizeMode: "contain" }}
                />
                <Text style={styles.statUnit}>Upcoming</Text>
              </View>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Events Joined</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity onPress={() => router.push("/(app)/activity-history")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityInfo}>
                    <View style={[styles.activityIcon, getActivityIconStyle(activity.sportType || 'unknown')]}>
                      <Image
                        source={getActivityIcon(activity.sportType || 'unknown')}
                        style={{ width: 20, height: 20, resizeMode: "contain" }}
                      />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>{activity.name}</Text>
                      <Text style={styles.activityTime}>{formatTime(activity.startDateLocal || activity.startDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.activityStats}>
                    <Text style={styles.activityDistance}>
                      {activity.distance ? `${formatDistance(activity.distance)} km` : "-"}
                    </Text>
                    <Text style={styles.activityDuration}>
                      {formatDuration(activity.movingTime || 0)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivitiesContainer}>
                <Text style={styles.emptyActivitiesText}>No recent activities</Text>
                <Text style={styles.emptyActivitiesSubtext}>Start tracking your activities to see them here</Text>
              </View>
            )}
          </View>
        </View>

        {/* Active Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.challengesScroll}
          >
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>100km February</Text>
                <View style={styles.activeChallengeBadge}>
                  <Text style={styles.activeChallengeBadgeText}>Active</Text>
                </View>
              </View>
              <View style={styles.challengeProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>67/100 km</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "67%" }]} />
                </View>
              </View>
              <Text style={styles.challengeTimeRemaining}>
                15 days remaining
              </Text>
            </View>

            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>Step Challenge</Text>
                <View style={styles.pendingChallengeBadge}>
                  <Text style={styles.pendingChallengeBadgeText}>Pending</Text>
                </View>
              </View>
              <View style={styles.challengeProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>8,450/10,000</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFillOrange, { width: "84.5%" }]}
                  />
                </View>
              </View>
              <Text style={styles.challengeTimeRemaining}>Todays goal</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
    fontFamily: "Inter",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#14A76C",
  },
  cameraIcon: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#14A76C",
    borderRadius: 12,
    padding: 6,
  },
  cameraIconImage: {
    width: 12,
    height: 12,
    tintColor: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
    marginLeft: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
    marginBottom: 4,
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
    tintColor: "#F7931E",
  },
  companyText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  editButton: {
    backgroundColor: "#14A76C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter",
  },
  section: {
    backgroundColor: "#F7F7F7",
    padding: 16,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    color: "#14A76C",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statBadge: {
    backgroundColor: "rgba(247, 147, 30, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 12,
    color: "#F7931E",
    fontWeight: "500",
    fontFamily: "Inter",
  },
  activeBadge: {
    backgroundColor: "rgba(20, 167, 108, 0.1)",
  },
  activeBadgeText: {
    fontSize: 12,
    color: "#14A76C",
    fontWeight: "500",
    fontFamily: "Inter",
  },
  statUnit: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  activityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  bikeIcon: {
    backgroundColor: "rgba(20, 167, 108, 0.1)",
  },
  runIcon: {
    backgroundColor: "rgba(247, 147, 30, 0.1)",
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  activityStats: {
    alignItems: "flex-end",
  },
  activityDistance: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  activityDuration: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  challengesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  challengeCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginRight: 12,
    width: 280,
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
    fontFamily: "Inter",
  },
  activeChallengeBadge: {
    backgroundColor: "#14A76C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeChallengeBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
    fontFamily: "Inter",
  },
  pendingChallengeBadge: {
    backgroundColor: "#F7931E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pendingChallengeBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
    fontFamily: "Inter",
  },
  challengeProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Inter",
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
  progressFillOrange: {
    height: "100%",
    backgroundColor: "#F7931E",
    borderRadius: 4,
  },
  challengeTimeRemaining: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  emptyActivitiesContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyActivitiesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  emptyActivitiesSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
