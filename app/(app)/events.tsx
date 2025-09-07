import { Event, EventFilters, EVENT_CATEGORIES, eventApi } from "@/lib/events";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const filterOptions = ['All', ...EVENT_CATEGORIES.map(cat => cat.label)];

export default function EventsScreen() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const loadEvents = async (refresh = false) => {
    try {
      if (!refresh) setLoading(true);
      
      const filters: EventFilters = {};
      if (selectedFilter !== 'All') {
        const category = EVENT_CATEGORIES.find(cat => cat.label === selectedFilter);
        if (category) {
          filters.category = category.value;
        }
      }

      const eventsData = await eventApi.getEvents(filters, user?.user_metadata?.krid);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents(true);
  };

  const handleJoinEvent = async (event: Event) => {
    if (!user?.user_metadata?.krid) {
      Alert.alert('Error', 'Please log in to join events');
      return;
    }

    if (event.userParticipation) {
      // Already joined, show options to leave
      Alert.alert(
        'Leave Event',
        'Are you sure you want to leave this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              try {
                await eventApi.leaveEvent(event.id, user.user_metadata.krid);
                loadEvents(true);
              } catch (error) {
                Alert.alert('Error', 'Failed to leave event. Please try again.');
              }
            },
          },
        ]
      );
      return;
    }

    try {
      await eventApi.joinEvent(event.id, user.user_metadata.krid);
      Alert.alert('Success', 'You have successfully joined the event!');
      loadEvents(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to join event. Please try again.');
    }
  };

  const renderEventCard = (event: Event) => {
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate > new Date();
    const category = EVENT_CATEGORIES.find(cat => cat.value === event.category);
    const isJoined = !!event.userParticipation;
    const isFull = event.maxParticipants && (event.participantCount || 0) >= event.maxParticipants;

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => router.push(`/(app)/event-details/${event.id}`)}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.categoryIcon}>
            <Ionicons 
              name={(category?.icon as keyof typeof Ionicons.glyphMap) || 'calendar'} 
              size={20} 
              color="#3B82F6" 
            />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={styles.eventCreator}>
              by {event.creator?.name || event.creator?.email}
            </Text>
          </View>
          {isJoined && (
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>

          {event.distance && (
            <View style={styles.detailRow}>
              <Ionicons name="speedometer-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {(event.distance / 1000).toFixed(1)} km
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {event.participantCount || 0} joined
              {event.maxParticipants && ` / ${event.maxParticipants} max`}
            </Text>
          </View>
        </View>

        {/* Event Description */}
        {event.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.eventActions}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined ? styles.joinedButton : null,
              !isUpcoming ? styles.disabledButton : null,
              (isFull && !isJoined) ? styles.fullButton : null,
            ]}
            onPress={() => handleJoinEvent(event)}
            disabled={!isUpcoming}
          >
            <Text style={[
              styles.joinButtonText,
              isJoined ? styles.joinedButtonText : null,
              !isUpcoming ? styles.disabledButtonText : null,
              (isFull && !isJoined) ? styles.fullButtonText : null,
            ]}>
              {!isUpcoming 
                ? 'Event Ended'
                : isJoined 
                  ? 'Joined' 
                  : isFull 
                    ? 'Full' 
                    : 'Join Event'
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => router.push(`/(app)/event-details/${event.id}`)}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Difficulty Badge */}
        {event.difficulty && (
          <View style={[
            styles.difficultyBadge,
            event.difficulty === 'beginner' && styles.beginnerBadge,
            event.difficulty === 'intermediate' && styles.intermediateBadge,
            event.difficulty === 'advanced' && styles.advancedBadge,
          ]}>
            <Text style={[
              styles.difficultyText,
              event.difficulty === 'beginner' && styles.beginnerText,
              event.difficulty === 'intermediate' && styles.intermediateText,
              event.difficulty === 'advanced' && styles.advancedText,
            ]}>
              {event.difficulty}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14A76C" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Events</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(app)/create-event')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'All' 
                ? 'Be the first to create an event!'
                : `No ${selectedFilter.toLowerCase()} events available right now.`
              }
            </Text>
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => router.push('/(app)/create-event')}
            >
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map(renderEventCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  createButton: {
    backgroundColor: "#14A76C",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBar: {
    marginTop: 8,
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
  eventsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventCreator: {
    fontSize: 14,
    color: '#6B7280',
  },
  joinedBadge: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinedButton: {
    backgroundColor: '#10B981',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  fullButton: {
    backgroundColor: '#F59E0B',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  fullButtonText: {
    color: '#FFFFFF',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  beginnerBadge: {
    backgroundColor: '#D1FAE5',
  },
  intermediateBadge: {
    backgroundColor: '#FEF3C7',
  },
  advancedBadge: {
    backgroundColor: '#FEE2E2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  beginnerText: {
    color: '#065F46',
  },
  intermediateText: {
    color: '#92400E',
  },
  advancedText: {
    color: '#991B1B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createEventButton: {
    backgroundColor: '#14A76C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});