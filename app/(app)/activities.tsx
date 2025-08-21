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

export default function ActivitiesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
              <Text style={styles.activeChipText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.chipText}>Rides</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.chipText}>Runs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activities List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityInfo}>
              <View style={[styles.activityIcon, styles.bikeIcon]}>
                <Ionicons name="bicycle" size={20} color="#14A76C" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Morning Ride</Text>
                <Text style={styles.activityTime}>Today • 7:30 AM</Text>
              </View>
            </View>
            <View style={styles.activityStats}>
              <Text style={styles.activityDistance}>15.2 km</Text>
              <Text style={styles.activityDuration}>45 min</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityInfo}>
              <View style={[styles.activityIcon, styles.runIcon]}>
                <Ionicons name="walk" size={20} color="#F7931E" />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Evening Run</Text>
                <Text style={styles.activityTime}>Yesterday • 6:15 PM</Text>
              </View>
            </View>
            <View style={styles.activityStats}>
              <Text style={styles.activityDistance}>5.8 km</Text>
              <Text style={styles.activityDuration}>28 min</Text>
            </View>
          </View>

          <View style={styles.emptyState}>
            <Ionicons name="time" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No more activities</Text>
            <Text style={styles.emptySubtext}>Start tracking your rides to see them here</Text>
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
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F7F7F7",
  },
  activeChip: {
    backgroundColor: "#14A76C",
  },
  chipText: {
    fontSize: 14,
    color: "#666666",
  },
  activeChipText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  activityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    marginBottom: 12,
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
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#666666",
  },
  activityStats: {
    alignItems: "flex-end",
  },
  activityDistance: {
    fontSize: 16,
    fontWeight: "600",
    color: "#252525",
    marginBottom: 2,
  },
  activityDuration: {
    fontSize: 12,
    color: "#666666",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#999",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#CCC",
    marginTop: 4,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 100,
  },
});