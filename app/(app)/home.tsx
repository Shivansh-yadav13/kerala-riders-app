import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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

export default function HomeScreen() {
  const { user } = useAuthStore();

  const quickStats = [
    {
      label: "Weekly Distance",
      value: "42.5 km",
      icon: "map-outline",
      color: "#14A76C",
    },
    {
      label: "Challenges",
      value: "3 Active",
      icon: "trophy-outline",
      color: "#F7931E",
    },
    {
      label: "Leaderboard",
      value: "#12",
      icon: "medal-outline",
      color: "#14A76C",
    },
    {
      label: "Steps Today",
      value: "8,450",
      icon: "walk-outline",
      color: "#14A76C",
    },
  ];

  const communityFeed = [
    {
      id: 1,
      name: "John",
      activity: "completed a 15km run",
      time: "2 hours ago",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    },
    {
      id: 2,
      name: "Sarah",
      activity: "joined Mountain Challenge",
      time: "4 hours ago",
      avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    },
  ];

  const activeChallenges = [
    {
      id: 1,
      title: "100km This Month",
      timeLeft: "5 days left",
      progress: 67.5,
      currentValue: "67.5 km",
      targetValue: "100 km",
      rank: "#8 of 45 participants",
      color: "#14A76C",
    },
    {
      id: 2,
      title: "Daily Steps Goal",
      timeLeft: "Today",
      progress: 84.5,
      currentValue: "8,450",
      targetValue: "10,000",
      rank: "#3 of 28 participants",
      color: "#F7931E",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Kerala Coastal Ride",
      subtitle: "Kochi • 50km cycling event",
      month: "MAR",
      day: "15",
      actionText: "Join",
      color: "#14A76C",
    },
    {
      id: 2,
      title: "Mountain Trail Run",
      subtitle: "Munnar • 15km trail running",
      month: "MAR",
      day: "22",
      actionText: "Track",
      color: "#F7931E",
    },
  ];

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Rider';
    
    if (hour < 12) return `Good Morning, ${name} 👋`;
    if (hour < 18) return `Good Afternoon, ${name} 👋`;
    return `Good Evening, ${name} 👋`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" translucent={false} backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {user?.user_metadata?.avatar_url ? (
              <Image 
                source={{ uri: user.user_metadata.avatar_url }} 
                style={styles.userAvatar} 
              />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Ionicons name="person" size={24} color="#6B7280" />
              </View>
            )}
            <View style={styles.userGreeting}>
              <Text style={styles.greetingText}>{getUserGreeting()}</Text>
              <Text style={styles.subGreetingText}>Ready for today's challenge?</Text>
            </View>
          </View>
          {/* <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6B7280" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity> */}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statContent}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.activitiesList}>
          <View style={styles.activityCard}>
            <View style={styles.activityInfo}>
              <View style={styles.activityIconContainer}>
                <Ionicons name="bicycle" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Morning Ride</Text>
                <Text style={styles.activitySubtitle}>12.5 km • 35 min</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
          </View>
          <View style={styles.stravaSync}>
            <Text style={styles.stravaSyncText}>Strava synced</Text>
            <TouchableOpacity>
              <Text style={styles.syncNowText}>Sync Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Feed</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/activities')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {communityFeed.map((item, index) => (
              <View key={item.id} style={styles.feedItem}>
                <Image source={{ uri: item.avatar }} style={styles.feedAvatar} />
                <View style={styles.feedContent}>
                  <Text style={styles.feedText}>
                    <Text style={styles.feedName}>{item.name}</Text> {item.activity}
                  </Text>
                  <Text style={styles.feedTime}>{item.time}</Text>
                </View>
                <View style={styles.feedActions}>
                  <TouchableOpacity style={styles.feedAction}>
                    <Ionicons name="heart-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.feedAction}>
                    <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Join New</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.challengesContainer}
          >
            {activeChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View style={[styles.challengeBadge, { backgroundColor: challenge.color }]}>
                    <Text style={styles.challengeBadgeText}>{challenge.timeLeft}</Text>
                  </View>
                </View>
                <View style={styles.challengeProgress}>
                  <View style={styles.challengeProgressHeader}>
                    <Text style={styles.challengeProgressLabel}>Progress</Text>
                    <Text style={styles.challengeProgressValue}>
                      {challenge.currentValue} / {challenge.targetValue}
                    </Text>
                  </View>
                  <View style={styles.challengeProgressBar}>
                    <View 
                      style={[
                        styles.challengeProgressFill, 
                        { 
                          width: `${challenge.progress}%`,
                          backgroundColor: challenge.color 
                        }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.challengeRank}>Rank: {challenge.rank}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventsContainer}>
            {upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <View style={[styles.eventDateContainer, { backgroundColor: event.color }]}>
                    <Text style={styles.eventMonth}>{event.month}</Text>
                    <Text style={styles.eventDay}>{event.day}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[
                  styles.eventActionButton,
                  event.actionText === 'Track' && styles.eventActionButtonSecondary
                ]}>
                  <Text style={[
                    styles.eventActionText,
                    event.actionText === 'Track' && styles.eventActionTextSecondary
                  ]}>
                    {event.actionText}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Corporate Wellness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Progress</Text>
          <View style={styles.corporateCard}>
            <View style={styles.corporateHeader}>
              <Text style={styles.corporateTitle}>Kerala Riders Group</Text>
              <Ionicons name="business" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.corporateSubtitle}>Team Challenge: 500km in March</Text>
            <View style={styles.corporateFooter}>
              <View style={styles.corporateProgress}>
                <Text style={styles.corporateProgressLabel}>Team Progress</Text>
                <Text style={styles.corporateProgressValue}>342km / 500km</Text>
              </View>
              <TouchableOpacity style={styles.corporateButton}>
                <Text style={styles.corporateButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <View style={styles.announcementCard}>
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
            <View style={styles.announcementContent}>
              <Text style={styles.announcementTitle}>New Feature Alert!</Text>
              <Text style={styles.announcementText}>
                Activity sharing with Instagram Stories is now available.
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#14A76C",
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#14A76C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userGreeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  subGreetingText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
  },
  quickStatsSection: {
    backgroundColor: "#F7F7F7",
    padding: 16,
    marginTop: 1,
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
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
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
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 12,
  },
  activityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#14A76C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  activitySubtitle: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  shareButton: {
    backgroundColor: "#14A76C",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  stravaSync: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stravaSyncText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
  },
  syncNowText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#14A76C",
    fontFamily: "Inter",
  },
  activitiesList: {
    gap: 12,
  },
  feedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 12,
  },
  feedItemBorder: {
    marginBottom: 0,
  },
  feedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  feedContent: {
    flex: 1,
    marginRight: 8,
  },
  feedText: {
    fontSize: 14,
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  feedName: {
    fontWeight: "500",
    fontFamily: "Inter",
  },
  feedTime: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  feedActions: {
    flexDirection: "row",
    gap: 8,
  },
  feedAction: {
    padding: 4,
  },
  challengesContainer: {
    paddingHorizontal: 16,
  },
  challengeCard: {
    width: 240,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginRight: 12,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
    fontFamily: "Inter",
  },
  challengeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  challengeBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  challengeProgress: {
    marginBottom: 12,
  },
  challengeProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  challengeProgressLabel: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
  },
  challengeProgressValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Inter",
  },
  challengeProgressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  challengeProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  challengeRank: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Inter",
  },
  eventsContainer: {
    gap: 0,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 12,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventDateContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  eventDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#252525",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter",
  },
  eventActionButton: {
    backgroundColor: "#14A76C",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventActionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  eventActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  eventActionTextSecondary: {
    color: "#666666",
    fontFamily: "Inter",
  },
  corporateCard: {
    backgroundColor: "#14A76C",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  corporateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  corporateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  corporateSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  corporateFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  corporateProgress: {
    flex: 1,
  },
  corporateProgressLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.75)",
    marginBottom: 2,
  },
  corporateProgressValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  corporateButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  corporateButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#14A76C",
    fontFamily: "Inter",
  },
  announcementCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 12,
    marginBottom: -16,
  },
  announcementContent: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E3A8A",
    fontFamily: "Inter",
    marginBottom: 2,
  },
  announcementText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontFamily: "Inter",
  },
  dismissText: {
    fontSize: 12,
    color: "#3B82F6",
  },
  bottomSpacing: {
    height: 100,
  },
});