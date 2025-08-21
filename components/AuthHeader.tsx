import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AuthHeaderProps {
  subtitle?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ subtitle }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Kerala Riders</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
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
});

export default AuthHeader;