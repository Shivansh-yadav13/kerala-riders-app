import { CreateEventData, EVENT_CATEGORIES, EVENT_DIFFICULTIES, eventApi } from "@/lib/events";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateEventScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    location: '',
    category: EVENT_CATEGORIES[0].value,
    difficulty: EVENT_DIFFICULTIES[0].value,
    maxParticipants: undefined,
    distance: undefined,
    registrationDeadline: '',
  });

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const eventDate = new Date(formData.date);
      if (eventDate <= new Date()) {
        newErrors.date = 'Event date must be in the future';
      }
    }

    if (formData.registrationDeadline) {
      const deadline = new Date(formData.registrationDeadline);
      const eventDate = new Date(formData.date);
      if (deadline >= eventDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event date';
      }
    }

    if (formData.maxParticipants !== undefined && formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Max participants must be at least 1';
    }

    if (formData.distance !== undefined && formData.distance <= 0) {
      newErrors.distance = 'Distance must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    if (!user?.user_metadata?.krid) {
      Alert.alert('Error', 'Please log in to create events');
      return;
    }

    setLoading(true);

    try {
      const eventData: CreateEventData = {
        ...formData,
        distance: formData.distance ? formData.distance * 1000 : undefined, // Convert km to meters
      };

      await eventApi.createEvent(eventData, user.user_metadata.krid);
      
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)/events'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setFormData({ ...formData, date: date.toISOString() });
    setShowDatePicker(false);
  };

  const handleDeadlineSelect = (date: Date) => {
    setFormData({ ...formData, registrationDeadline: date.toISOString() });
    setShowDeadlinePicker(false);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getCategoryIcon = () => {
    const category = EVENT_CATEGORIES.find(cat => cat.value === formData.category);
    return category?.icon || 'calendar';
  };

  const getCategoryLabel = () => {
    const category = EVENT_CATEGORIES.find(cat => cat.value === formData.category);
    return category?.label || 'Select Category';
  };

  const getDifficultyLabel = () => {
    const difficulty = EVENT_DIFFICULTIES.find(diff => diff.value === formData.difficulty);
    return difficulty?.label || 'Select Difficulty';
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter event title"
              placeholderTextColor="#9CA3AF"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe your event..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons 
                  name={getCategoryIcon() as keyof typeof Ionicons.glyphMap} 
                  size={20} 
                  color="#6B7280" 
                />
              </View>
              <Text style={styles.dropdownText}>{getCategoryLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Difficulty */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Difficulty Level</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDifficultyModal(true)}
            >
              <Text style={styles.dropdownText}>{getDifficultyLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Date & Time */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Event Date & Time *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.date && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={[styles.dateText, !formData.date && styles.placeholderText]}>
                {formData.date ? formatDateForDisplay(formData.date) : 'Select date and time'}
              </Text>
            </TouchableOpacity>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Registration Deadline */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Registration Deadline</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.registrationDeadline && styles.inputError]}
              onPress={() => setShowDeadlinePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={[styles.dateText, !formData.registrationDeadline && styles.placeholderText]}>
                {formData.registrationDeadline 
                  ? formatDateForDisplay(formData.registrationDeadline) 
                  : 'Select deadline (optional)'
                }
              </Text>
            </TouchableOpacity>
            {errors.registrationDeadline && (
              <Text style={styles.errorText}>{errors.registrationDeadline}</Text>
            )}
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Enter event location"
              placeholderTextColor="#9CA3AF"
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Distance */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Distance (km)</Text>
            <TextInput
              style={[styles.input, errors.distance && styles.inputError]}
              value={formData.distance?.toString() || ''}
              onChangeText={(text) => {
                const distance = text ? parseFloat(text) : undefined;
                setFormData({ ...formData, distance });
              }}
              placeholder="Enter distance in kilometers"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            {errors.distance && <Text style={styles.errorText}>{errors.distance}</Text>}
          </View>

          {/* Max Participants */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              style={[styles.input, errors.maxParticipants && styles.inputError]}
              value={formData.maxParticipants?.toString() || ''}
              onChangeText={(text) => {
                const maxParticipants = text ? parseInt(text, 10) : undefined;
                setFormData({ ...formData, maxParticipants });
              }}
              placeholder="Leave empty for unlimited"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            {errors.maxParticipants && (
              <Text style={styles.errorText}>{errors.maxParticipants}</Text>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.optionsList}>
                  {EVENT_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.optionItem,
                        formData.category === category.value && styles.selectedOption
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, category: category.value });
                        setShowCategoryModal(false);
                      }}
                    >
                      <Ionicons 
                        name={category.icon as keyof typeof Ionicons.glyphMap} 
                        size={20} 
                        color={formData.category === category.value ? "#14A76C" : "#6B7280"} 
                      />
                      <Text style={[
                        styles.optionText,
                        formData.category === category.value && styles.selectedOptionText
                      ]}>
                        {category.label}
                      </Text>
                      {formData.category === category.value && (
                        <Ionicons name="checkmark" size={20} color="#14A76C" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Difficulty Selection Modal */}
      <Modal
        visible={showDifficultyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDifficultyModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDifficultyModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Difficulty</Text>
                  <TouchableOpacity
                    onPress={() => setShowDifficultyModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.optionsList}>
                  {EVENT_DIFFICULTIES.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty.value}
                      style={[
                        styles.optionItem,
                        formData.difficulty === difficulty.value && styles.selectedOption
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, difficulty: difficulty.value });
                        setShowDifficultyModal(false);
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        formData.difficulty === difficulty.value && styles.selectedOptionText
                      ]}>
                        {difficulty.label}
                      </Text>
                      {formData.difficulty === difficulty.value && (
                        <Ionicons name="checkmark" size={20} color="#14A76C" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Date Picker Modals */}
      <DateTimePicker
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleDateSelect}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />

      <DateTimePicker
        isVisible={showDeadlinePicker}
        mode="datetime"
        onConfirm={handleDeadlineSelect}
        onCancel={() => setShowDeadlinePicker(false)}
        minimumDate={new Date()}
        maximumDate={formData.date ? new Date(formData.date) : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  placeholder: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryIconContainer: {
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
  },
  createButton: {
    backgroundColor: '#14A76C',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#F0FDF4',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  selectedOptionText: {
    color: '#14A76C',
    fontWeight: '600',
  },
});