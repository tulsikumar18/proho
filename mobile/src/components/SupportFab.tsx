import React from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Phone } from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  onPress?: () => void;
}

export const SupportFab: React.FC<Props> = ({ onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert(
        "Aashrayo Partner Support",
        "Direct Line: +91 9999 123 456\nAvailable 9:00 AM – 8:00 PM for site visit assistance, inventory queries, and payouts.",
        [{ text: "Call Support" }, { text: "Dismiss", style: "cancel" }]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.fab}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <Phone size={24} color="#ffffff" strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 84,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
});
