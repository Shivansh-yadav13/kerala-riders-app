import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React from "react";
import { Image, Platform, TouchableOpacity } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#14A76C",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            shadowColor: "transparent",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
          },
          default: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
            elevation: 0,
          },
        }),
        sceneStyle: { backgroundColor: "#F7F7F7" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/icons/home-green.png")}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? "#14A76C" : "#9CA3AF",
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/icons/dumbbell.png")}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? "#14A76C" : "#9CA3AF",
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="corporate"
        options={{
          title: "Corporate",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/icons/building.png")}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? "#14A76C" : "#9CA3AF",
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          title: "Profile",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: "#000",
          },
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(app)/user-profile");
                }
              }}
              style={{ paddingLeft: 16, paddingRight: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/icons/user.png")}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? "#14A76C" : "#9CA3AF",
                resizeMode: "contain",
              }}
            />
          ),
          tabBarHideOnKeyboard: true,
          tabBarStyle: {},
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/icons/settings-green.png")}
              style={{
                width: 20,
                height: 20,
                tintColor: focused ? "#14A76C" : "#9CA3AF",
                resizeMode: "contain",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
