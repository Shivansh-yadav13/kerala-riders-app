import { CustomSelect } from "@/components/CustomSelect";
import { CustomTextInput } from "@/components/CustomTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Icon Components using high-resolution PNG images
const WhatsAppIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/whatsapp.png")}
    style={{ width, height, resizeMode: "contain" }}
  />
);

const GenderIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/gender.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const LocationIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/location.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const BuildingIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/building.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

const MountainIcon = ({ width = 20, height = 20 }) => (
  <Image
    source={require("@/assets/images/icons/mountain.png")}
    style={{ width, height, tintColor: "#9CA3AF", resizeMode: "contain" }}
  />
);

export default function UserInfoScreen() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [gender, setGender] = useState("");
  const [emirate, setEmirate] = useState("");
  const [city, setCity] = useState("");
  const [keralaDistrict, setKeralaDistrict] = useState("");

  const genderOptions = [
    { label: "Select gender", value: "" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer-not-to-say" },
  ];

  const emirateOptions = [
    { label: "Select emirate", value: "" },
    { label: "Dubai", value: "dubai" },
    { label: "Abu Dhabi", value: "abu-dhabi" },
    { label: "Sharjah", value: "sharjah" },
    { label: "Ajman", value: "ajman" },
    { label: "Umm Al Quwain", value: "umm-al-quwain" },
    { label: "Ras Al Khaimah", value: "ras-al-khaimah" },
    { label: "Fujairah", value: "fujairah" },
  ];

  const cityData: Record<string, { label: string; value: string }[]> = {
    dubai: [
      { label: "Dubai City", value: "dubai-city" },
      { label: "Deira", value: "deira" },
      { label: "Bur Dubai", value: "bur-dubai" },
      { label: "Jumeirah", value: "jumeirah" },
      { label: "Marina", value: "marina" },
      { label: "Downtown Dubai", value: "downtown-dubai" },
      { label: "Business Bay", value: "business-bay" },
      { label: "JLT", value: "jlt" },
    ],
    "abu-dhabi": [
      { label: "Abu Dhabi City", value: "abu-dhabi-city" },
      { label: "Al Ain", value: "al-ain" },
      { label: "Liwa", value: "liwa" },
      { label: "Madinat Zayed", value: "madinat-zayed" },
      { label: "Ruwais", value: "ruwais" },
      { label: "Khalifa City", value: "khalifa-city" },
      { label: "Yas Island", value: "yas-island" },
    ],
    sharjah: [
      { label: "Sharjah City", value: "sharjah-city" },
      { label: "Kalba", value: "kalba" },
      { label: "Khor Fakkan", value: "khor-fakkan" },
      { label: "Dibba Al-Hisn", value: "dibba-al-hisn" },
      { label: "Al Dhaid", value: "al-dhaid" },
      { label: "Mleiha", value: "mleiha" },
    ],
    ajman: [
      { label: "Ajman City", value: "ajman-city" },
      { label: "Masfout", value: "masfout" },
      { label: "Manama", value: "manama" },
    ],
    "umm-al-quwain": [
      { label: "Umm Al Quwain City", value: "umm-al-quwain-city" },
      { label: "Falaj Al Mualla", value: "falaj-al-mualla" },
    ],
    "ras-al-khaimah": [
      { label: "Ras Al Khaimah City", value: "ras-al-khaimah-city" },
      { label: "Julfar", value: "julfar" },
      { label: "Al Rams", value: "al-rams" },
      { label: "Khatt", value: "khatt" },
      { label: "Digdaga", value: "digdaga" },
    ],
    fujairah: [
      { label: "Fujairah City", value: "fujairah-city" },
      { label: "Dibba", value: "dibba" },
      { label: "Kalba", value: "kalba-fujairah" },
      { label: "Masafi", value: "masafi" },
      { label: "Al Bidiyah", value: "al-bidiyah" },
    ],
  };

  const cityOptions =
    emirate && cityData[emirate]
      ? [{ label: "Select city", value: "" }, ...cityData[emirate]]
      : [{ label: "Select city", value: "" }];

  const keralaDistrictOptions = [
    { label: "Select Kerala district", value: "" },
    { label: "Thiruvananthapuram", value: "thiruvananthapuram" },
    { label: "Kollam", value: "kollam" },
    { label: "Pathanamthitta", value: "pathanamthitta" },
    { label: "Alappuzha", value: "alappuzha" },
    { label: "Kottayam", value: "kottayam" },
    { label: "Idukki", value: "idukki" },
    { label: "Ernakulam", value: "ernakulam" },
    { label: "Thrissur", value: "thrissur" },
    { label: "Palakkad", value: "palakkad" },
    { label: "Malappuram", value: "malappuram" },
    { label: "Kozhikode", value: "kozhikode" },
    { label: "Wayanad", value: "wayanad" },
    { label: "Kannur", value: "kannur" },
    { label: "Kasaragod", value: "kasaragod" },
  ];

  const handleEmirateChange = (value: string) => {
    setEmirate(value);
    setCity(""); // Reset city when emirate changes
  };

  const handleContinue = () => {
    if (!whatsappNumber || !gender || !emirate || !city) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    // Handle continue logic
    console.log("User info:", {
      whatsappNumber,
      gender,
      emirate,
      city,
      keralaDistrict,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kerala Riders</Text>
          <Text style={styles.subtitle}>Complete Your Profile</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* WhatsApp Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>WhatsApp Number</Text>
            <Text style={styles.helpText}>
              Please enter a UAE number that's available on WhatsApp
            </Text>
            <CustomTextInput
              placeholder="50 123 4567"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
              keyboardType="phone-pad"
              leftIcon={
                <View style={styles.whatsappPrefixContainer}>
                  <WhatsAppIcon width={20} height={20} />
                  <Text style={styles.countryCodeText}>+971</Text>
                </View>
              }
            />
          </View>

          {/* Gender */}
          <CustomSelect
            label="Gender"
            placeholder="Select gender"
            value={gender}
            options={genderOptions}
            onValueChange={setGender}
            leftIcon={<GenderIcon width={20} height={20} />}
          />

          {/* UAE Emirate */}
          <CustomSelect
            label="UAE Emirate"
            placeholder="Select emirate"
            value={emirate}
            options={emirateOptions}
            onValueChange={handleEmirateChange}
            leftIcon={<LocationIcon width={20} height={20} />}
          />

          {/* City */}
          <CustomSelect
            label="City"
            placeholder="Select city"
            value={city}
            options={cityOptions}
            onValueChange={setCity}
            leftIcon={<BuildingIcon width={20} height={20} />}
            disabled={!emirate}
          />

          {/* Kerala District */}
          <CustomSelect
            label="Kerala District"
            placeholder="Select Kerala district"
            value={keralaDistrict}
            options={keralaDistrictOptions}
            onValueChange={setKeralaDistrict}
            leftIcon={<MountainIcon width={20} height={20} />}
            optional={true}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Link href="/(auth)/email-verification">
            <Text style={styles.continueButtonText}>Continue</Text>
          </Link>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#252525",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  formSection: {
    gap: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  whatsappPrefixContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#14A76C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
