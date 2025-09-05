import { CustomSelect } from "@/components/CustomSelect";
import {
  convertDistanceToMeters,
  convertTimeToSeconds,
  safeNumber,
} from "@/lib/units";
import { useActivityStore } from "@/stores/activity";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const activityTypes = [
  { label: "Cycling", value: "cycling" },
  { label: "Running", value: "running" },
  { label: "Walking", value: "walking" },
  { label: "Hiking", value: "hiking" },
  { label: "Swimming", value: "swimming" },
];

const distanceUnits = [
  { label: "km", value: "km" },
  { label: "m", value: "m" },
  { label: "mi", value: "mi" },
  { label: "ft", value: "ft" },
];

export default function AddActivityScreen() {
  const { createActivity, loading } = useActivityStore();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    timeHour: "6",
    timeMinute: "00",
    timePeriod: "AM",
    durationHours: "",
    durationMinutes: "",
    durationSeconds: "",
    distance: "",
    distanceUnit: "km",
    speedHour: "",
    speedMin: "",
    speedUnit: "km",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDurationPickerVisible, setDurationPickerVisibility] =
    useState(false);
  const [isDistancePickerVisible, setDistancePickerVisibility] =
    useState(false);

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const formatTime = () => {
    return `${formData.timeHour}:${formData.timeMinute} ${formData.timePeriod}`;
  };

  const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  };

  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear; i++) {
      years.push(i.toString());
    }
    return years;
  };

  const generateMonths = () => {
    return [
      { label: "January", value: "01" },
      { label: "February", value: "02" },
      { label: "March", value: "03" },
      { label: "April", value: "04" },
      { label: "May", value: "05" },
      { label: "June", value: "06" },
      { label: "July", value: "07" },
      { label: "August", value: "08" },
      { label: "September", value: "09" },
      { label: "October", value: "10" },
      { label: "November", value: "11" },
      { label: "December", value: "12" },
    ];
  };

  const generateDays = (month: string, year: string) => {
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentDateParts = () => {
    const parts = formData.date.split("-");
    return {
      year: parts[0],
      month: parts[1],
      day: parts[2],
    };
  };

  const isDateInFuture = (year: string, month: string, day: string) => {
    const selectedDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return selectedDate > today;
  };

  const getAvailableMonths = (year: string) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11

    if (parseInt(year) < currentYear) {
      return generateMonths(); // All months available for past years
    } else if (parseInt(year) === currentYear) {
      return generateMonths().filter(
        (month) => parseInt(month.value) <= currentMonth
      );
    }
    return [];
  };

  const getAvailableDays = (year: string, month: string) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    const allDays = generateDays(month, year);

    if (parseInt(year) < currentYear || parseInt(month) < currentMonth) {
      return allDays; // All days available for past months/years
    } else if (
      parseInt(year) === currentYear &&
      parseInt(month) === currentMonth
    ) {
      return allDays.filter((day) => parseInt(day) <= currentDay);
    }
    return allDays;
  };

  const showDurationPicker = () => {
    setDurationPickerVisibility(true);
  };

  const hideDurationPicker = () => {
    setDurationPickerVisibility(false);
  };

  const generateDurationHours = () => {
    return Array.from({ length: 24 }, (_, i) => i.toString());
  };

  const generateDurationMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i.toString());
  };

  const generateDurationSeconds = () => {
    return Array.from({ length: 60 }, (_, i) => i.toString());
  };

  const formatDuration = () => {
    const hours = formData.durationHours || "0";
    const minutes = formData.durationMinutes || "0";
    const seconds = formData.durationSeconds || "0";

    const parts = [];
    if (parseInt(hours) > 0) parts.push(`${hours}h`);
    if (parseInt(minutes) > 0) parts.push(`${minutes}m`);
    if (parseInt(seconds) > 0) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(" ") : "Select duration";
  };



  // Calculate pace automatically based on distance and duration
  const calculatePace = () => {
    const distance = parseFloat(formData.distance || "0");
    const hours = parseInt(formData.durationHours || "0");
    const minutes = parseInt(formData.durationMinutes || "0");
    const seconds = parseInt(formData.durationSeconds || "0");
    
    if (distance <= 0) return { hours: 0, minutes: 0 };
    
    // Convert total duration to minutes
    const totalMinutes = (hours * 60) + minutes + (seconds / 60);
    
    // Calculate pace in minutes per distance unit
    const paceInMinutes = totalMinutes / distance;
    
    // Convert to hours and minutes
    const paceHours = Math.floor(paceInMinutes / 60);
    const paceMinutes = Math.round(paceInMinutes % 60);
    
    return { hours: paceHours, minutes: paceMinutes };
  };

  const formatSpeed = () => {
    const pace = calculatePace();
    const unit = formData.distanceUnit || "km";

    if (pace.hours === 0 && pace.minutes === 0) {
      return "Auto-calculated pace";
    }

    if (pace.hours > 0) {
      return `${pace.hours}:${pace.minutes.toString().padStart(2, "0")} /${unit}`;
    } else {
      return `${pace.minutes} min/${unit}`;
    }
  };

  const showDistancePicker = () => {
    setDistancePickerVisibility(true);
  };

  const hideDistancePicker = () => {
    setDistancePickerVisibility(false);
  };

  const generateDistanceWholeNumbers = () => {
    return Array.from({ length: 201 }, (_, i) => i.toString()); // 0-200
  };

  const generateDistanceDecimals = () => {
    return Array.from({ length: 10 }, (_, i) => i.toString()); // 0-9 (for .0, .1, .2, etc.)
  };

  const getDistanceParts = () => {
    const distance = formData.distance || "0.0";
    const parts = distance.split(".");
    return {
      whole: parts[0] || "0",
      decimal: parts[1] ? parts[1][0] : "0",
    };
  };

  const formatDistance = () => {
    const distance = formData.distance;
    const unit = formData.distanceUnit;

    if (!distance || parseFloat(distance) === 0) {
      return "Select distance";
    }

    return `${distance} ${unit}`;
  };

  const updateDistance = (whole: string, decimal: string) => {
    const newDistance = `${whole}.${decimal}`;
    setFormData({ ...formData, distance: newDistance });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Activity name is required";
    }

    if (!formData.type) {
      newErrors.type = "Activity type is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const dateParts = formData.date.split("-");
      if (isDateInFuture(dateParts[0], dateParts[1], dateParts[2])) {
        newErrors.date = "Activity date cannot be in the future";
      }
    }

    if (!formData.timeHour || !formData.timeMinute || !formData.timePeriod) {
      newErrors.time = "Time is required";
    }

    // Validate duration - at least one field should be filled
    const hasHours =
      formData.durationHours && parseInt(formData.durationHours) > 0;
    const hasMinutes =
      formData.durationMinutes && parseInt(formData.durationMinutes) > 0;
    const hasSeconds =
      formData.durationSeconds && parseInt(formData.durationSeconds) > 0;

    if (!hasHours && !hasMinutes && !hasSeconds) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      newErrors.distance = "Distance is required and must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly."
      );
      return;
    }

    try {
      // Use centralized conversion functions
      const hours = safeNumber(formData.durationHours);
      const minutes = safeNumber(formData.durationMinutes);
      const seconds = safeNumber(formData.durationSeconds);
      const totalSeconds = convertTimeToSeconds(hours, minutes, seconds);

      // Convert distance to meters using utility function
      const distanceInMeters = convertDistanceToMeters(
        safeNumber(formData.distance),
        formData.distanceUnit as any
      );

      // Set elevation to 0 since it's not collected
      const elevationInMeters = 0;

      // Calculate average speed (m/s)
      const averageSpeed =
        totalSeconds > 0 ? distanceInMeters / totalSeconds : 0;

      // Calculate max speed (estimate as 1.5x average speed if not provided)
      const maxSpeed = averageSpeed * 1.5;

      // Create start date with time
      let hour24 = parseInt(formData.timeHour);
      if (formData.timePeriod === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (formData.timePeriod === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      const timeString = `${hour24.toString().padStart(2, "0")}:${
        formData.timeMinute
      }`;
      const startDateTime = new Date(`${formData.date}T${timeString}:00`);

      // Generate unique ID for the activity (using timestamp + random number for BigInt compatibility)
      const activityId = BigInt(
        Date.now().toString() +
          Math.floor(Math.random() * 100000)
            .toString()
            .padStart(5, "0")
      ).toString();

      // Get current timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Get current timestamp for createdAt
      const now = new Date();

      const activity = {
        id: activityId,
        name: formData.name,
        type: formData.type,
        distance: distanceInMeters,
        movingTime: totalSeconds,
        elapsedTime: totalSeconds,
        totalElevation: elevationInMeters,
        startDate: startDateTime.toISOString(),
        startDateLocal: startDateTime.toISOString(),
        timezone: timezone,
        averageSpeed,
        maxSpeed,
        createdAt: now.toISOString(),
      };

      await createActivity(activity);

      Alert.alert("Success", "Activity added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error adding activity:", error);
      Alert.alert("Error", "Failed to add activity. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Activity Type */}
          <View>
            <CustomSelect
              label=""
              placeholder="Select activity type"
              value={formData.type}
              options={activityTypes}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              leftIcon={<Ionicons name="bicycle" size={20} color="#14A76C" />}
            />
          </View>

          {/* Activity Name */}
          <View>
            <View style={styles.nameInputContainer}>
              <Ionicons
                name="flag"
                size={20}
                color="#14A76C"
                style={styles.nameIcon}
              />
              <TextInput
                style={styles.nameInput}
                placeholder="Morning Ride"
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Date */}
          <View>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={showDatePicker}
            >
              <Ionicons
                name="calendar"
                size={20}
                color="#14A76C"
                style={styles.dateIcon}
              />
              <Text style={styles.datePickerText}>
                {formatDate(formData.date)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>

          {/* Time */}
          <View>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={showTimePicker}
            >
              <Ionicons
                name="time"
                size={20}
                color="#14A76C"
                style={styles.timeIcon}
              />
              <Text style={styles.timePickerText}>{formatTime()}</Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>

          {/* Duration */}
          <View>
            <TouchableOpacity
              style={styles.durationPickerButton}
              onPress={showDurationPicker}
            >
              <Ionicons
                name="stopwatch"
                size={20}
                color="#14A76C"
                style={styles.durationIcon}
              />
              <Text style={styles.durationPickerText}>{formatDuration()}</Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.duration && (
              <Text style={styles.errorText}>{errors.duration}</Text>
            )}
          </View>

          {/* Distance */}
          <View>
            <TouchableOpacity
              style={styles.distancePickerButton}
              onPress={showDistancePicker}
            >
              <Ionicons
                name="map"
                size={20}
                color="#14A76C"
                style={styles.distanceIcon}
              />
              <Text style={styles.distancePickerText}>{formatDistance()}</Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {errors.distance && (
              <Text style={styles.errorText}>{errors.distance}</Text>
            )}
          </View>

          {/* Speed - Auto-calculated */}
          <View>
            <View style={[styles.speedPickerButton, styles.readOnlyField]}>
              <Ionicons
                name="flash"
                size={20}
                color="#14A76C"
                style={styles.speedIcon}
              />
              <Text style={[styles.speedPickerText, styles.readOnlyText]}>{formatSpeed()}</Text>
              <Ionicons name="calculator" size={20} color="#6B7280" />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {loading ? "Adding Activity..." : "Add Activity"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={isTimePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTimePicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideTimePicker}
        >
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={hideTimePicker}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView
                  style={styles.timeScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateHours().map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeOption,
                        formData.timeHour === hour && styles.timeOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, timeHour: hour })
                      }
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          formData.timeHour === hour &&
                            styles.timeOptionTextSelected,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <ScrollView
                  style={styles.timeScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateMinutes()
                    .filter((_, index) => index % 5 === 0)
                    .map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeOption,
                          formData.timeMinute === minute &&
                            styles.timeOptionSelected,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, timeMinute: minute })
                        }
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            formData.timeMinute === minute &&
                              styles.timeOptionTextSelected,
                          ]}
                        >
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Period</Text>
                <View style={styles.periodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.timeOption,
                      formData.timePeriod === "AM" && styles.timeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, timePeriod: "AM" })
                    }
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        formData.timePeriod === "AM" &&
                          styles.timeOptionTextSelected,
                      ]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.timeOption,
                      formData.timePeriod === "PM" && styles.timeOptionSelected,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, timePeriod: "PM" })
                    }
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        formData.timePeriod === "PM" &&
                          styles.timeOptionTextSelected,
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmTimeButton}
              onPress={hideTimePicker}
            >
              <Text style={styles.confirmTimeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideDatePicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideDatePicker}
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={hideDatePicker}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnLabel}>Month</Text>
                <ScrollView
                  style={styles.dateScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {getAvailableMonths(getCurrentDateParts().year).map(
                    (month) => (
                      <TouchableOpacity
                        key={month.value}
                        style={[
                          styles.dateOption,
                          getCurrentDateParts().month === month.value &&
                            styles.dateOptionSelected,
                        ]}
                        onPress={() => {
                          const dateParts = getCurrentDateParts();
                          let newDay = dateParts.day;

                          // Check if the current day is valid for the new month
                          const availableDays = getAvailableDays(
                            dateParts.year,
                            month.value
                          );
                          if (!availableDays.includes(newDay)) {
                            newDay =
                              availableDays[availableDays.length - 1] || "01";
                          }

                          const newDate = `${dateParts.year}-${month.value}-${newDay}`;
                          setFormData({ ...formData, date: newDate });
                        }}
                      >
                        <Text
                          style={[
                            styles.dateOptionText,
                            getCurrentDateParts().month === month.value &&
                              styles.dateOptionTextSelected,
                          ]}
                        >
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnLabel}>Day</Text>
                <ScrollView
                  style={styles.dateScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {getAvailableDays(
                    getCurrentDateParts().month,
                    getCurrentDateParts().year
                  ).map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dateOption,
                        getCurrentDateParts().day === day &&
                          styles.dateOptionSelected,
                      ]}
                      onPress={() => {
                        const dateParts = getCurrentDateParts();
                        const newDate = `${dateParts.year}-${dateParts.month}-${day}`;
                        setFormData({ ...formData, date: newDate });
                      }}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          getCurrentDateParts().day === day &&
                            styles.dateOptionTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.dateColumn}>
                <Text style={styles.dateColumnLabel}>Year</Text>
                <ScrollView
                  style={styles.dateScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.dateOption,
                        getCurrentDateParts().year === year &&
                          styles.dateOptionSelected,
                      ]}
                      onPress={() => {
                        const dateParts = getCurrentDateParts();
                        let newMonth = dateParts.month;
                        let newDay = dateParts.day;

                        // Check if the current month is valid for the new year
                        const availableMonths = getAvailableMonths(year);
                        const monthExists = availableMonths.some(
                          (m) => m.value === newMonth
                        );
                        if (!monthExists && availableMonths.length > 0) {
                          newMonth =
                            availableMonths[availableMonths.length - 1].value;
                        }

                        // Check if the current day is valid for the new year/month
                        const availableDays = getAvailableDays(year, newMonth);
                        if (!availableDays.includes(newDay)) {
                          newDay =
                            availableDays[availableDays.length - 1] || "01";
                        }

                        const newDate = `${year}-${newMonth}-${newDay}`;
                        setFormData({ ...formData, date: newDate });
                      }}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          getCurrentDateParts().year === year &&
                            styles.dateOptionTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmDateButton}
              onPress={hideDatePicker}
            >
              <Text style={styles.confirmDateButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Duration Picker Modal */}
      <Modal
        visible={isDurationPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideDurationPicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideDurationPicker}
        >
          <View style={styles.durationPickerModal}>
            <View style={styles.durationPickerHeader}>
              <Text style={styles.durationPickerTitle}>Select Duration</Text>
              <TouchableOpacity onPress={hideDurationPicker}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.durationPickerContainer}>
              <View style={styles.durationColumn}>
                <Text style={styles.durationColumnLabel}>Hours</Text>
                <ScrollView
                  style={styles.durationScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateDurationHours().map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.durationOption,
                        formData.durationHours === hour &&
                          styles.durationOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, durationHours: hour })
                      }
                    >
                      <Text
                        style={[
                          styles.durationOptionText,
                          formData.durationHours === hour &&
                            styles.durationOptionTextSelected,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.durationColumn}>
                <Text style={styles.durationColumnLabel}>Minutes</Text>
                <ScrollView
                  style={styles.durationScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateDurationMinutes().map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.durationOption,
                        formData.durationMinutes === minute &&
                          styles.durationOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, durationMinutes: minute })
                      }
                    >
                      <Text
                        style={[
                          styles.durationOptionText,
                          formData.durationMinutes === minute &&
                            styles.durationOptionTextSelected,
                        ]}
                      >
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.durationColumn}>
                <Text style={styles.durationColumnLabel}>Seconds</Text>
                <ScrollView
                  style={styles.durationScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateDurationSeconds().map((second) => (
                    <TouchableOpacity
                      key={second}
                      style={[
                        styles.durationOption,
                        formData.durationSeconds === second &&
                          styles.durationOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, durationSeconds: second })
                      }
                    >
                      <Text
                        style={[
                          styles.durationOptionText,
                          formData.durationSeconds === second &&
                            styles.durationOptionTextSelected,
                        ]}
                      >
                        {second}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmDurationButton}
              onPress={hideDurationPicker}
            >
              <Text style={styles.confirmDurationButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Distance Picker Modal */}
      <Modal
        visible={isDistancePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideDistancePicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideDistancePicker}
        >
          <View style={styles.distancePickerModal}>
            <View style={styles.distancePickerHeader}>
              <Text style={styles.distancePickerTitle}>Select Distance</Text>
              <TouchableOpacity onPress={hideDistancePicker}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.distancePickerContainer}>
              <View style={styles.distanceColumn}>
                <Text style={styles.distanceColumnLabel}>Whole</Text>
                <ScrollView
                  style={styles.distanceScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateDistanceWholeNumbers().map((whole) => (
                    <TouchableOpacity
                      key={whole}
                      style={[
                        styles.distanceOption,
                        getDistanceParts().whole === whole &&
                          styles.distanceOptionSelected,
                      ]}
                      onPress={() =>
                        updateDistance(whole, getDistanceParts().decimal)
                      }
                    >
                      <Text
                        style={[
                          styles.distanceOptionText,
                          getDistanceParts().whole === whole &&
                            styles.distanceOptionTextSelected,
                        ]}
                      >
                        {whole}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.distanceColumn}>
                <Text style={styles.distanceColumnLabel}>Decimal</Text>
                <ScrollView
                  style={styles.distanceScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {generateDistanceDecimals().map((decimal) => (
                    <TouchableOpacity
                      key={decimal}
                      style={[
                        styles.distanceOption,
                        getDistanceParts().decimal === decimal &&
                          styles.distanceOptionSelected,
                      ]}
                      onPress={() =>
                        updateDistance(getDistanceParts().whole, decimal)
                      }
                    >
                      <Text
                        style={[
                          styles.distanceOptionText,
                          getDistanceParts().decimal === decimal &&
                            styles.distanceOptionTextSelected,
                        ]}
                      >
                        .{decimal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.distanceColumn}>
                <Text style={styles.distanceColumnLabel}>Unit</Text>
                <ScrollView
                  style={styles.distanceScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {distanceUnits.map((unit) => (
                    <TouchableOpacity
                      key={unit.value}
                      style={[
                        styles.distanceOption,
                        formData.distanceUnit === unit.value &&
                          styles.distanceOptionSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, distanceUnit: unit.value })
                      }
                    >
                      <Text
                        style={[
                          styles.distanceOptionText,
                          formData.distanceUnit === unit.value &&
                            styles.distanceOptionTextSelected,
                        ]}
                      >
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmDistanceButton}
              onPress={hideDistancePicker}
            >
              <Text style={styles.confirmDistanceButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  placeholder: {
    // width: 32,
  },
  scrollView: {
    backgroundColor: "#F7F7F7",
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#252525",
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#14A76C",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  bottomSpacing: {
    height: 60,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  timeIcon: {
    marginRight: 12,
  },
  timePickerText: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeColumnLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  timeScrollView: {
    height: 150,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 2,
  },
  timeOptionSelected: {
    backgroundColor: "#14A76C",
  },
  timeOptionText: {
    fontSize: 16,
    color: "#252525",
  },
  timeOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  periodContainer: {
    height: 150,
    justifyContent: "center",
  },
  confirmTimeButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmTimeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  dateIcon: {
    marginRight: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
  },
  datePickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateColumnLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  dateScrollView: {
    height: 150,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 2,
  },
  dateOptionSelected: {
    backgroundColor: "#14A76C",
  },
  dateOptionText: {
    fontSize: 16,
    color: "#252525",
  },
  dateOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  confirmDateButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  durationPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  durationIcon: {
    marginRight: 12,
  },
  durationPickerText: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
  },
  durationPickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  durationPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  durationPickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  durationPickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  durationColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  durationColumnLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  durationScrollView: {
    height: 150,
  },
  durationOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 2,
  },
  durationOptionSelected: {
    backgroundColor: "#14A76C",
  },
  durationOptionText: {
    fontSize: 16,
    color: "#252525",
  },
  durationOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  confirmDurationButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDurationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  speedPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  speedIcon: {
    marginRight: 12,
  },
  speedPickerText: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
  },
  distancePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  distanceIcon: {
    marginRight: 12,
  },
  distancePickerText: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
  },
  distancePickerModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  distancePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  distancePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#252525",
  },
  distancePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  distanceColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  distanceColumnLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  distanceScrollView: {
    height: 150,
  },
  distanceOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 2,
  },
  distanceOptionSelected: {
    backgroundColor: "#14A76C",
  },
  distanceOptionText: {
    fontSize: 16,
    color: "#252525",
  },
  distanceOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  confirmDistanceButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDistanceButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  nameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  nameIcon: {
    marginRight: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: "#252525",
  },
  readOnlyField: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  readOnlyText: {
    color: "#6B7280",
    fontStyle: "italic",
  },
});
