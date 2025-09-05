import { formatDuration } from "@/lib/units";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

interface ActivityFeedItem {
  id: string;
  type: 'workout' | 'challenge' | 'event' | 'corporate' | 'achievement';
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  content: any;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

const mockFeedData: ActivityFeedItem[] = [
  {
    id: '1',
    type: 'workout',
    user: { name: 'Shivansh', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
    timestamp: '2h ago',
    content: {
      title: 'Morning Run',
      description: 'Completed a morning run',
      stats: {
        distance: 7050,
        duration: 2700,
        pace: '6\'25"',
        calories: 520
      }
    },
    likes: 12,
    comments: 4
  },
  {
    id: '2',
    type: 'challenge',
    user: { name: 'Aarav', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
    timestamp: '1d ago',
    content: {
      title: '100-Day Challenge',
      description: 'Completed Day 10 of the 100-Day Challenge',
      progress: 70,
      ranking: 'Team #3 this month'
    },
    likes: 8,
    comments: 2
  },
  {
    id: '3',
    type: 'event',
    user: { name: 'Priya', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
    timestamp: '3h ago',
    content: {
      title: 'Kerala Coast Cycling',
      description: 'Joined the Kerala Coast Cycling Event',
      date: 'September 15, 2025 • 6:00 AM',
      participants: 42
    },
    likes: 15,
    comments: 6
  },
  {
    id: '4',
    type: 'corporate',
    user: { name: 'TechCorp India', avatar: '' },
    timestamp: '4h ago',
    content: {
      title: 'Weekly team wellness update',
      stats: {
        distance: '2,456 km',
        steps: '89K',
        calories: '12K'
      },
      badges: ['Team Leader', 'Most Active']
    },
    likes: 23,
    comments: 8
  },
  {
    id: '5',
    type: 'achievement',
    user: { name: 'Rahul', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
    timestamp: '6h ago',
    content: {
      title: '100km Runner',
      description: 'Earned a new achievement badge',
      subtitle: 'Completed 100km in a month'
    },
    likes: 34,
    comments: 12
  }
];

const filterOptions = ['All', 'Workouts', 'Events', 'Challenges', 'Corporate', 'Achievements'];

export default function ActivitiesScreen() {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const renderFeedCard = (item: ActivityFeedItem) => {
    const isLiked = likedPosts.has(item.id);
    
    return (
      <View key={item.id} style={styles.feedCard}>
        {/* User Header */}
        <View style={styles.userHeader}>
          {item.type === 'corporate' ? (
            <View style={styles.corporateAvatar}>
              <Ionicons name="business" size={20} color="#8B5CF6" />
            </View>
          ) : (
            <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          )}
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.timestamp}>• {item.timestamp}</Text>
            </View>
            <Text style={styles.activityDescription}>
              {item.type === 'workout' && item.content.description}
              {item.type === 'challenge' && item.content.description}
              {item.type === 'event' && item.content.description}
              {item.type === 'corporate' && item.content.title}
              {item.type === 'achievement' && item.content.description}
            </Text>
          </View>
        </View>

        {/* Activity Content */}
        {item.type === 'workout' && (
          <View style={[styles.activityContent, styles.workoutContent]}>
            <View style={styles.activityHeader}>
              <View style={styles.workoutIcon}>
                <Ionicons name="fitness" size={16} color="#14A76C" />
              </View>
              <Text style={styles.activityTitle}>{item.content.title}</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(item.content.stats.distance / 1000).toFixed(2)}</Text>
                <Text style={styles.statLabel}>km</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(item.content.stats.duration)}</Text>
                <Text style={styles.statLabel}>duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.content.stats.pace}</Text>
                <Text style={styles.statLabel}>pace</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.content.stats.calories}</Text>
                <Text style={styles.statLabel}>calories</Text>
              </View>
            </View>
          </View>
        )}

        {item.type === 'challenge' && (
          <View style={[styles.activityContent, styles.challengeContent]}>
            <View style={styles.activityHeader}>
              <View style={styles.challengeIcon}>
                <Ionicons name="trophy" size={16} color="#F7931E" />
              </View>
              <Text style={styles.activityTitle}>{item.content.title}</Text>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{item.content.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.content.progress}%` }]} />
              </View>
              <Text style={styles.rankingText}>{item.content.ranking}</Text>
            </View>
          </View>
        )}

        {item.type === 'event' && (
          <View style={[styles.activityContent, styles.eventContent]}>
            <View style={styles.activityHeader}>
              <View style={styles.eventIcon}>
                <Ionicons name="calendar" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.activityTitle}>{item.content.title}</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventDate}>{item.content.date}</Text>
              <Text style={styles.eventParticipants}>{item.content.participants} participants registered</Text>
              <TouchableOpacity style={styles.joinEventButton}>
                <Text style={styles.joinEventText}>Join Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {item.type === 'corporate' && (
          <View style={[styles.activityContent, styles.corporateContent]}>
            <View style={styles.corporateStats}>
              <View style={styles.corporateStatItem}>
                <Text style={styles.corporateStatValue}>{item.content.stats.distance}</Text>
                <Text style={styles.corporateStatLabel}>km logged</Text>
              </View>
              <View style={styles.corporateStatItem}>
                <Text style={styles.corporateStatValue}>{item.content.stats.steps}</Text>
                <Text style={styles.corporateStatLabel}>steps</Text>
              </View>
              <View style={styles.corporateStatItem}>
                <Text style={styles.corporateStatValue}>{item.content.stats.calories}</Text>
                <Text style={styles.corporateStatLabel}>calories</Text>
              </View>
            </View>
            <View style={styles.badgesRow}>
              {item.content.badges.map((badge: string, index: number) => (
                <View key={index} style={[styles.badge, index === 0 ? styles.teamLeaderBadge : styles.mostActiveBadge]}>
                  <Text style={[styles.badgeText, index === 0 ? styles.teamLeaderText : styles.mostActiveText]}>
                    {badge}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {item.type === 'achievement' && (
          <View style={[styles.activityContent, styles.achievementContent]}>
            <View style={styles.achievementHeader}>
              <View style={styles.trophyIcon}>
                <Ionicons name="trophy" size={24} color="#EAB308" />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{item.content.title}</Text>
                <Text style={styles.achievementSubtitle}>{item.content.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareAchievementButton}>
              <Text style={styles.shareAchievementText}>Share Achievement</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Social Actions */}
        <View style={styles.socialActions}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={isLiked ? "#EF4444" : "#6B7280"} 
            />
            <Text style={[styles.socialText, isLiked && styles.likedText]}>
              {item.likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
            <Text style={styles.socialText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        {/* <View style={styles.headerContent}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
            {user?.user_metadata?.avatar_url ? (
              <Image 
                source={{ uri: user.user_metadata.avatar_url }} 
                style={styles.profileAvatar} 
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Ionicons name="person" size={20} color="#6B7280" />
              </View>
            )}
          </View>
        </View> */}

        {/* Filter Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilterChip
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
      >
        {mockFeedData.map(renderFeedCard)}
        
        {/* Load More */}
        <TouchableOpacity style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Load More Posts</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profileAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBar: {
    marginTop: 16,
  },
  filterBarContent: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  activeFilterChip: {
    backgroundColor: "#14A76C",
  },
  filterText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  corporateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
  },
  activityDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  activityContent: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  workoutContent: {
    backgroundColor: "rgba(20, 167, 108, 0.05)",
  },
  challengeContent: {
    backgroundColor: "rgba(247, 147, 30, 0.05)",
  },
  eventContent: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  corporateContent: {
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
  achievementContent: {
    backgroundColor: "rgba(234, 179, 8, 0.05)",
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(20, 167, 108, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  challengeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(247, 147, 30, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F7931E",
    borderRadius: 4,
  },
  rankingText: {
    fontSize: 12,
    color: "#6B7280",
  },
  eventDetails: {
    marginTop: 8,
  },
  eventDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  eventParticipants: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  joinEventButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  joinEventText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  corporateStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  corporateStatItem: {
    alignItems: "center",
  },
  corporateStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  corporateStatLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamLeaderBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  mostActiveBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  teamLeaderText: {
    color: "#8B5CF6",
  },
  mostActiveText: {
    color: "#EAB308",
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  trophyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  achievementSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  shareAchievementButton: {
    backgroundColor: "#EAB308",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  shareAchievementText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  socialActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  socialText: {
    fontSize: 14,
    color: "#6B7280",
  },
  likedText: {
    color: "#EF4444",
  },
  loadMoreButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#14A76C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});