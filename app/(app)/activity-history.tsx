import { useAuthContext } from "@/contexts/AuthProvider";
import { useActivityStore } from "@/stores/activity";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Activity type definitions for filtering
type ActivityTypeFilter =
  | "all"
  | "running"
  | "cycling"
  | "walking"
  | "swimming"
  | "strength";

// Data formatting helpers
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

const formatPace = (averageSpeed: number, sportType: string): string => {
  if (!averageSpeed || averageSpeed === 0) return "-";

  // For running and walking, show pace (min/km)
  if (
    sportType.toLowerCase().includes("run") ||
    sportType.toLowerCase().includes("walk")
  ) {
    const paceMinPerKm = 1000 / (averageSpeed * 60); // Convert m/s to min/km
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  // For cycling, show speed (km/h)
  const kmh = averageSpeed * 3.6; // Convert m/s to km/h
  return kmh.toFixed(1);
};

const getPaceUnit = (sportType: string): string => {
  if (
    sportType.toLowerCase().includes("run") ||
    sportType.toLowerCase().includes("walk")
  ) {
    return "min/km";
  }
  return "km/h";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const mapSportTypeToFilter = (sportType: string): ActivityTypeFilter => {
  const type = sportType.toLowerCase();
  if (type.includes("run")) return "running";
  if (type.includes("bike") || type.includes("cycle") || type.includes("ride"))
    return "cycling";
  if (type.includes("walk")) return "walking";
  if (type.includes("swim")) return "swimming";
  if (
    type.includes("strength") ||
    type.includes("weight") ||
    type.includes("gym")
  )
    return "strength";
  return "all";
};

const filterOptions = [
  { label: "All", value: "all" as ActivityTypeFilter },
  { label: "Running", value: "running" as ActivityTypeFilter },
  { label: "Cycling", value: "cycling" as ActivityTypeFilter },
  { label: "Walking", value: "walking" as ActivityTypeFilter },
  { label: "Swimming", value: "swimming" as ActivityTypeFilter },
];

export default function ActivityHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<ActivityTypeFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Store and user context
  const { user } = useAuthContext();
  const {
    activities,
    loading,
    error,
    isLoadingMore,
    pagination,
    fetchActivities,
    loadMoreActivities,
    refreshActivities,
    clearError,
  } = useActivityStore();

  // Get user identifier for API calls
  const getUserIdentifier = (): string => {
    if (!user?.user_metadata) return "";
    return user.user_metadata.krid || user.email || "";
  };

  // Fetch activities on component mount
  useEffect(() => {
    const userIdentifier = getUserIdentifier();
    if (userIdentifier && activities.length === 0 && !loading) {
      fetchActivities(userIdentifier);
    }
  }, [user]);

  // Handle pull to refresh
  const handleRefresh = async () => {
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) return;

    setRefreshing(true);
    try {
      await refreshActivities(userIdentifier);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle load more
  const handleLoadMore = async () => {
    const userIdentifier = getUserIdentifier();
    if (userIdentifier && pagination?.hasMore && !isLoadingMore) {
      await loadMoreActivities(userIdentifier);
    }
  };

  const getActivityIcon = (sportType: string) => {
    const type = sportType.toLowerCase();
    if (type.includes("run")) return "walk";
    if (
      type.includes("bike") ||
      type.includes("cycle") ||
      type.includes("ride")
    )
      return "bicycle";
    if (type.includes("walk")) return "walk";
    if (type.includes("swim")) return "water";
    if (
      type.includes("strength") ||
      type.includes("weight") ||
      type.includes("gym")
    )
      return "barbell";
    return "fitness";
  };

  const getActivityIconStyle = (sportType: string) => {
    const mappedType = mapSportTypeToFilter(sportType);
    switch (mappedType) {
      case "running":
        return styles.runningIcon;
      case "cycling":
        return styles.cyclingIcon;
      case "walking":
        return styles.walkingIcon;
      case "swimming":
        return styles.swimmingIcon;
      case "strength":
        return styles.strengthIcon;
      default:
        return styles.defaultIcon;
    }
  };

  const getActivityIconColor = (sportType: string) => {
    const mappedType = mapSportTypeToFilter(sportType);
    switch (mappedType) {
      case "running":
        return "#14A76C";
      case "cycling":
        return "#F7931E";
      case "walking":
        return "#3B82F6";
      case "swimming":
        return "#06B6D4";
      case "strength":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;

    const activityType = mapSportTypeToFilter(activity.sportType);
    const matchesFilter = activityType === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search activities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                selectedFilter === option.value && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === option.value &&
                    styles.activeFilterChipText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activity List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                clearError();
                const userIdentifier = getUserIdentifier();
                if (userIdentifier) {
                  fetchActivities(userIdentifier);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {loading && activities.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14A76C" />
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No activities found</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking your activities to see them here
            </Text>
          </View>
        )}

        {/* Activity Cards */}
        {filteredActivities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityInfo}>
                <View
                  style={[
                    styles.activityIconContainer,
                    getActivityIconStyle(activity.sportType),
                  ]}
                >
                  <Ionicons
                    name={getActivityIcon(activity.sportType) as any}
                    size={20}
                    color={getActivityIconColor(activity.sportType)}
                  />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{activity.name}</Text>
                  <Text style={styles.activityDateTime}>
                    {formatDate(activity.startDate)} –{" "}
                    {formatTime(activity.startDateLocal)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {activity.distance ? formatDistance(activity.distance) : "-"}
                </Text>
                <Text style={styles.metricLabel}>km</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {activity.averageSpeed
                    ? formatPace(activity.averageSpeed, activity.sportType)
                    : "-"}
                </Text>
                <Text style={styles.metricLabel}>
                  {getPaceUnit(activity.sportType)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {formatDuration(activity.movingTime)}
                </Text>
                <Text style={styles.metricLabel}>duration</Text>
              </View>
            </View>

            {/* Activity Footer with Stats */}
            <View style={styles.activityFooter}>
              <View style={styles.activityStats}>
                {activity.totalElevation > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="trending-up" size={12} color="#666666" />
                    <Text style={styles.statText}>
                      {activity.totalElevation}m elevation
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Load More Button */}
        {pagination?.hasMore && !loading && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Text style={styles.loadMoreText}>Load More Activities</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacing} />
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
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  headerSpacer: {
    width: 40,
  },
  searchSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
    paddingVertical: 12,
  },
  filterContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#14A76C",
  },
  filterChipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  // Loading, Error, and Empty States
  errorContainer: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  // Activity Cards
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  runningIcon: {
    backgroundColor: "rgba(20, 167, 108, 0.1)",
  },
  cyclingIcon: {
    backgroundColor: "rgba(247, 147, 30, 0.1)",
  },
  walkingIcon: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  swimmingIcon: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
  },
  strengthIcon: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  defaultIcon: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 2,
  },
  activityDateTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  menuButton: {
    padding: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  activityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  activityStats: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  loadMoreButton: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: "absolute",
    bottom: 96,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#14A76C",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
