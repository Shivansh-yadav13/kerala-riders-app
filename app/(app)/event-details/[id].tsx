import { Event, EVENT_CATEGORIES, eventApi } from "@/lib/events";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const eventData = await eventApi.getEventById(id, user?.user_metadata?.krid);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!event || !user?.user_metadata?.krid) {
      Alert.alert('Error', 'Please log in to join events');
      return;
    }

    const isJoined = !!event.userParticipation;
    
    if (isJoined) {
      // Leave event
      Alert.alert(
        'Leave Event',
        'Are you sure you want to leave this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              setActionLoading(true);
              try {
                await eventApi.leaveEvent(event.id, user.user_metadata.krid);
                await loadEvent(); // Refresh event data
                Alert.alert('Success', 'You have left the event.');
              } catch (error) {
                Alert.alert('Error', 'Failed to leave event. Please try again.');
              } finally {
                setActionLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Join event
      setActionLoading(true);
      try {
        await eventApi.joinEvent(event.id, user.user_metadata.krid);
        await loadEvent(); // Refresh event data
        Alert.alert('Success', 'You have successfully joined the event!');
      } catch (error) {
        Alert.alert('Error', 'Failed to join event. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      const message = `Check out this event: ${event.title}\n\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const handleDirections = () => {
    if (!event?.location) return;

    const encodedLocation = encodeURIComponent(event.location);
    const url = `https://maps.google.com/?q=${encodedLocation}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14A76C" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The event you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            style={styles.backToEventsButton}
            onPress={() => router.replace('/(app)/events')}
          >
            <Text style={styles.backToEventsText}>Back to Events</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const category = EVENT_CATEGORIES.find(cat => cat.value === event.category);
  const isJoined = !!event.userParticipation;
  const isFull = event.maxParticipants && (event.participantCount || 0) >= event.maxParticipants;
  const isCreator = user?.user_metadata?.krid === event.createdBy;
  const registeredParticipants = event.participants?.filter(p => p.status === 'registered') || [];

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
        >
          <Ionicons name="share-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Hero */}
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Ionicons 
              name={(category?.icon as keyof typeof Ionicons.glyphMap) || 'calendar'} 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.categoryText}>{category?.label}</Text>
          </View>
          
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorLabel}>Organized by</Text>
            <Text style={styles.creatorName}>
              {event.creator?.name || event.creator?.email}
            </Text>
          </View>

          {isJoined && (
            <View style={styles.joinedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.joinedText}>You're registered for this event</Text>
            </View>
          )}
        </View>

        {/* Event Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Date & Time</Text>
              <Text style={styles.statValue}>
                {eventDate.toLocaleDateString()}
              </Text>
              <Text style={styles.statSubvalue}>
                {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Location</Text>
              <Text style={styles.statValue}>{event.location}</Text>
              <TouchableOpacity onPress={handleDirections}>
                <Text style={styles.directionsLink}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {event.distance && (
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={20} color="#6B7280" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>
                  {(event.distance / 1000).toFixed(1)} km
                </Text>
              </View>
            </View>
          )}

          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={20} color="#6B7280" />
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Participants</Text>
              <Text style={styles.statValue}>
                {event.participantCount || 0} registered
              </Text>
              {event.maxParticipants && (
                <Text style={styles.statSubvalue}>
                  Max: {event.maxParticipants}
                </Text>
              )}
            </View>
          </View>

          {event.difficulty && (
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={20} color="#6B7280" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Difficulty</Text>
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
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* Participants */}
        {registeredParticipants.length > 0 && (
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>
              Participants ({registeredParticipants.length})
            </Text>
            <View style={styles.participantsList}>
              {registeredParticipants.slice(0, 6).map((participant, index) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {(participant.user?.name || participant.user?.email || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.user?.name || participant.user?.email || 'Anonymous'}
                  </Text>
                </View>
              ))}
              {registeredParticipants.length > 6 && (
                <View style={styles.participantItem}>
                  <View style={[styles.participantAvatar, styles.moreParticipants]}>
                    <Text style={styles.moreCount}>
                      +{registeredParticipants.length - 6}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>more</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Registration Deadline */}
        {event.registrationDeadline && (
          <View style={styles.deadlineSection}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.deadlineText}>
              Registration closes: {new Date(event.registrationDeadline).toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {isUpcoming && !isCreator && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isJoined ? styles.leaveButton : null,
              (isFull && !isJoined) ? styles.fullButton : null,
            ]}
            onPress={handleJoinLeave}
            disabled={actionLoading || Boolean(isFull && !isJoined)}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.actionButtonText,
                isJoined ? styles.leaveButtonText : null,
              ]}>
                {isFull && !isJoined 
                  ? 'Event Full' 
                  : isJoined 
                    ? 'Leave Event' 
                    : 'Join Event'
                }
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCreator && (
        <View style={styles.actionSection}>
          <Text style={styles.creatorNote}>You are the organizer of this event</Text>
        </View>
      )}

      {!isUpcoming && (
        <View style={styles.actionSection}>
          <Text style={styles.pastEventNote}>This event has ended</Text>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToEventsButton: {
    backgroundColor: '#14A76C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToEventsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 36,
  },
  creatorInfo: {
    marginBottom: 16,
  },
  creatorLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  joinedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  joinedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statContent: {
    marginLeft: 16,
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  statSubvalue: {
    fontSize: 14,
    color: '#6B7280',
  },
  directionsLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
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
    fontWeight: '600',
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
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  participantsSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantItem: {
    alignItems: 'center',
    width: 80,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  participantInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  participantName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  moreParticipants: {
    backgroundColor: '#F3F4F6',
  },
  moreCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  deadlineSection: {
    backgroundColor: '#FFFBEB',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  deadlineText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
  },
  actionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  fullButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButtonText: {
    color: '#FFFFFF',
  },
  creatorNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pastEventNote: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});