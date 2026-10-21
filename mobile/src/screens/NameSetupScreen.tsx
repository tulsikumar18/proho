import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants/theme";

interface Props {
  onContinue: (firstName: string, lastName: string) => void;
}

export const NameSetupScreen: React.FC<Props> = ({ onContinue }) => {
  const [firstName, setFirstName] = useState("Kritaank");
  const [lastName, setLastName] = useState("Krishna");

  const handleContinue = () => {
    if (firstName.trim()) {
      onContinue(firstName.trim(), lastName.trim());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* App Logo */}
        <View style={styles.logoBadge}>
          <View style={styles.logoRoof} />
          <View style={styles.logoBase} />
          <Text style={styles.logoText}>AASHRAYO</Text>
        </View>
        <Text style={styles.subBrand}>Channel Partner App</Text>

        <Text style={styles.heading}>What's your name?</Text>
        <Text style={styles.subtitle}>So we can personalize your experience</Text>

        {/* Input Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter first name"
            placeholderTextColor={COLORS.textMuted}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter last name"
            placeholderTextColor={COLORS.textMuted}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            firstName.trim() ? styles.continueButtonActive : styles.continueButtonDisabled,
          ]}
          disabled={!firstName.trim()}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 50,
  },
  logoBadge: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoRoof: {
    width: 20,
    height: 16,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ffffff",
    marginBottom: 2,
  },
  logoBase: {
    width: 24,
    height: 20,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    marginBottom: 3,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  subBrand: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 44,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 32,
    alignSelf: "flex-start",
  },
  formGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: "#ffffff",
  },
  continueButton: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  continueButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  continueButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
