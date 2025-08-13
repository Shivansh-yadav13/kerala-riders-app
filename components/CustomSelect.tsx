import React, { ReactNode, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ChevronDownIcon = ({ width = 20, height = 20, color = "#9CA3AF" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z"
      fill={color}
    />
  </Svg>
);

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  leftIcon?: ReactNode;
  disabled?: boolean;
  optional?: boolean;
  containerStyle?: object;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  placeholder,
  value,
  options,
  onValueChange,
  leftIcon,
  disabled = false,
  optional = false,
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}{" "}
        {optional && <Text style={styles.optionalText}>(Optional)</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.selectButton,
          disabled && styles.selectButtonDisabled,
          isOpen && styles.selectButtonActive,
        ]}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDownIcon
          width={20}
          height={20}
          color={disabled ? "#D1D5DB" : "#9CA3AF"}
        />
      </TouchableOpacity>

      {isOpen && !disabled && (
        <View style={styles.optionsList}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionalText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  selectButtonActive: {
    borderColor: '#14A76C',
    borderWidth: 2,
  },
  leftIconContainer: {
    marginRight: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  disabledText: {
    color: '#D1D5DB',
  },
  optionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollView: {
    maxHeight: 200,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#F0FDF4',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  selectedOptionText: {
    color: '#14A76C',
    fontWeight: '500',
  },
});

export default CustomSelect;