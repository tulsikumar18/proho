import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Check, ChevronRight } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { Language } from "../types";

interface Props {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onContinue: () => void;
}

export const LanguageSelectScreen: React.FC<Props> = ({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <View style={styles.logoRoof} />
            <View style={styles.logoBase} />
            <Text style={styles.logoText}>AASHRAYO</Text>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Choose your language</Text>
        <Text style={styles.subHeadingHindi}>अपनी भाषा चुनें</Text>
        <Text style={styles.description}>
          You can change this anytime from your account.
        </Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {/* English Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.optionCard,
              selectedLanguage === "en" && styles.optionCardSelected,
            ]}
            onPress={() => onSelectLanguage("en")}
          >
            <View style={styles.optionLeft}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>A</Text>
              </View>
              <View>
                <Text style={styles.optionTitle}>English</Text>
                <Text style={styles.optionSubtitle}>Continue in English</Text>
              </View>
            </View>

            <View
              style={[
                styles.radioCircle,
                selectedLanguage === "en" && styles.radioCircleSelected,
              ]}
            >
              {selectedLanguage === "en" ? (
                <Check size={16} color="#ffffff" strokeWidth={3} />
              ) : null}
            </View>
          </TouchableOpacity>

          {/* Hindi Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.optionCard,
              selectedLanguage === "hi" && styles.optionCardSelected,
            ]}
            onPress={() => onSelectLanguage("hi")}
          >
            <View style={styles.optionLeft}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterText}>अ</Text>
              </View>
              <View>
                <Text style={styles.optionTitle}>हिंदी</Text>
                <Text style={styles.optionSubtitle}>हिंदी में जारी रखें</Text>
              </View>
            </View>

            <View
              style={[
                styles.radioCircle,
                selectedLanguage === "hi" && styles.radioCircleSelected,
              ]}
            >
              {selectedLanguage === "hi" ? (
                <Check size={16} color="#ffffff" strokeWidth={3} />
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <ChevronRight size={18} color="#ffffff" strokeWidth={2.5} />
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
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 36,
  },
  logoBadge: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoRoof: {
    width: 22,
    height: 18,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ffffff",
    marginBottom: 2,
  },
  logoBase: {
    width: 28,
    height: 22,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    marginBottom: 4,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subHeadingHindi: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  optionsList: {
    width: "100%",
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  optionCardSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: "#faf5ff",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  letterBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  letterText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  radioCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  continueButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
