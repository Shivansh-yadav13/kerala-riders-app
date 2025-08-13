import React, { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  error?: string;
  containerStyle?: object;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#9CA3AF"
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  leftIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0, // Remove default padding to center text properly
  },
  rightIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
});

export default CustomTextInput;
