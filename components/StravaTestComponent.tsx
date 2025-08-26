// import { useAuth } from "@/hooks/useAuth";
// import { getAthleteActivities } from "@/lib/strava";
// import { testActivitySync } from "@/scripts/syncActivities";
// import { useActivityStore } from "@/stores/activity";
// import React, { useState } from "react";
// import {
//   Alert,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export const StravaTestComponent = () => {
//   const { user } = useAuth();
//   const {
//     stravaStats,
//     loading,
//     error,
//     lastSyncedAt,
//     syncWithStrava,
//     clearError,
//   } = useActivityStore();
//   const [syncLoading, setSyncLoading] = useState(false);

//   const handleTestStravaAPI = async () => {
//     const athleteId = user?.user_metadata?.strava_athlete_id;
//     const accessToken = user?.user_metadata?.strava_access_token;

//     if (!athleteId || !accessToken) {
//       Alert.alert(
//         "Strava Not Connected",
//         "Please connect your Strava account first to test the API."
//       );
//       return;
//     }

//     try {
//       await syncWithStrava(athleteId, accessToken);
//       if (!error) {
//         Alert.alert("Success", "Strava data fetched successfully!");
//       }
//     } catch (err) {
//       console.error("Test failed:", err);
//     }
//   };

//   const handleTestActivitiesAPI = async () => {
//     const accessToken = user?.user_metadata?.strava_access_token;

//     console.log("ACCESS TOKEN", accessToken);

//     if (!accessToken) {
//       Alert.alert(
//         "Strava Not Connected",
//         "Please connect your Strava account first to test the API."
//       );
//       return;
//     }

//     try {
//       console.log("🚀 Testing getAthleteActivities...");
//       const result = await getAthleteActivities(accessToken, true);

//       if (result.error) {
//         console.error("❌ Error fetching activities:", result.error);
//         Alert.alert(
//           "Error",
//           "Failed to fetch activities. Check console for details."
//         );
//       } else {
//         console.log("✅ Activities fetched successfully!");
//         Alert.alert(
//           "Success",
//           `Activities logged to console! Found ${
//             result.data?.length || 0
//           } activities.`
//         );
//       }
//     } catch (err) {
//       console.error("❌ Test activities failed:", err);
//       Alert.alert("Error", "Test failed. Check console for details.");
//     }
//   };

//   const handleSyncActivities = async () => {
//     if (!user?.user_metadata?.strava_access_token) {
//       Alert.alert(
//         "Strava Not Connected",
//         "Please connect your Strava account first."
//       );
//       return;
//     }

//     setSyncLoading(true);
//     try {
//       console.log("🔄 Starting activity sync...");
//       const resultMessage = await testActivitySync();

//       console.log("✅ Sync completed:", resultMessage);
//       Alert.alert("Sync Complete", resultMessage);
//     } catch (err) {
//       console.error("❌ Sync failed:", err);
//       Alert.alert(
//         "Sync Error",
//         "Failed to sync activities. Check console for details."
//       );
//     } finally {
//       setSyncLoading(false);
//     }
//   };

//   const formatDistance = (meters: number) => {
//     return (meters / 1000).toFixed(2) + " km";
//   };

//   const formatTime = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     return `${hours}h ${minutes}m`;
//   };

//   const formatElevation = (meters: number) => {
//     return meters.toFixed(0) + " m";
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Strava API Test</Text>
//         <Text style={styles.subtitle}>Test your Strava integration</Text>
//       </View>

//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleTestStravaAPI}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>
//           {loading ? "Fetching..." : "Test Strava Stats"}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, { backgroundColor: "#FF6B35" }]}
//         onPress={handleTestActivitiesAPI}
//         disabled={loading || syncLoading}
//       >
//         <Text style={styles.buttonText}>Test Activities API (Console Log)</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[
//           styles.button,
//           { backgroundColor: "#10B981" },
//           syncLoading && styles.buttonDisabled,
//         ]}
//         onPress={handleSyncActivities}
//         disabled={loading || syncLoading}
//       >
//         <Text style={styles.buttonText}>
//           {syncLoading ? "Syncing..." : "Sync Activities to Database"}
//         </Text>
//       </TouchableOpacity>

//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Error: {error}</Text>
//           <TouchableOpacity onPress={clearError} style={styles.clearButton}>
//             <Text style={styles.clearButtonText}>Clear Error</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {lastSyncedAt && (
//         <Text style={styles.syncText}>
//           Last synced: {new Date(lastSyncedAt).toLocaleString()}
//         </Text>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 5,
//   },
//   button: {
//     backgroundColor: "#FC4C02",
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   buttonDisabled: {
//     backgroundColor: "#ccc",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   errorContainer: {
//     backgroundColor: "#ffebee",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: "#f44336",
//   },
//   errorText: {
//     color: "#c62828",
//     marginBottom: 10,
//   },
//   clearButton: {
//     alignSelf: "flex-start",
//   },
//   clearButtonText: {
//     color: "#1976d2",
//     fontWeight: "600",
//   },
//   syncText: {
//     textAlign: "center",
//     color: "#666",
//     marginBottom: 20,
//     fontSize: 12,
//   },
//   statsContainer: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//     color: "#333",
//   },
//   statRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   statLabel: {
//     fontSize: 16,
//     color: "#666",
//   },
//   statValue: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   typeSection: {
//     marginBottom: 15,
//     paddingLeft: 10,
//   },
//   typeTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 5,
//   },
//   rawDataContainer: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   rawData: {
//     fontFamily: "monospace",
//     fontSize: 10,
//     backgroundColor: "#f8f8f8",
//     padding: 10,
//     borderRadius: 4,
//   },
// });
