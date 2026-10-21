import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Building2,
  Plus,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { SupportFab } from "../../components/SupportFab";

interface Props {
  onOpenSubmitUnit: () => void;
}

export const SourcingScreen: React.FC<Props> = ({ onOpenSubmitUnit }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sourcing</Text>
        <Text style={styles.headerSubtitle}>Submit your resale units</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Illustration Hero */}
        <View style={styles.heroSection}>
          <View style={styles.iconBadgeLarge}>
            <Building2 size={44} color="#ffffff" strokeWidth={2} />
            <View style={styles.miniPlusCircle}>
              <Plus size={16} color={COLORS.primary} strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.heroTitle}>Submit your first unit</Text>
          <Text style={styles.heroDescription}>
            Bring your resale units to Proho — we evaluate, make an offer, and help you close for a commission.
          </Text>
        </View>

        {/* HOW IT WORKS Section */}
        <View style={styles.howItWorksHeader}>
          <Text style={styles.howItWorksLabel}>HOW IT WORKS</Text>
        </View>

        <View style={styles.stepsCard}>
          {/* Step 1 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepIconWrap, { backgroundColor: "#f3e8ff" }]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Building2 size={24} color={COLORS.primary} />
            </View>
            <View style={styles.stepTextGroup}>
              <Text style={styles.stepHeading}>Submit a unit</Text>
              <Text style={styles.stepSub}>Pick a society, add details & photos</Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepIconWrap, { backgroundColor: "#fef3c7" }]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <TrendingUp size={24} color="#b45309" />
            </View>
            <View style={styles.stepTextGroup}>
              <Text style={styles.stepHeading}>Get a Proho offer</Text>
              <Text style={styles.stepSub}>Evaluated with an offer in 48 hrs</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={[styles.stepItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.stepIconWrap, { backgroundColor: "#dcfce7" }]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <CircleDollarSign size={24} color="#15803d" />
            </View>
            <View style={styles.stepTextGroup}>
              <Text style={styles.stepHeading}>Earn commission</Text>
              <Text style={styles.stepSub}>Paid to your bank when the deal closes</Text>
            </View>
          </View>
        </View>

        {/* Submit CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={onOpenSubmitUnit}
        >
          <Plus size={20} color="#ffffff" strokeWidth={3} />
          <Text style={styles.ctaButtonText}>Submit your first unit</Text>
        </TouchableOpacity>
        <Text style={styles.ctaSubtext}>3 easy steps · about 2 minutes</Text>
      </ScrollView>

      {/* Floating Call Support Button */}
      <SupportFab />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e9d5ff",
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconBadgeLarge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  miniPlusCircle: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    elevation: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  howItWorksHeader: {
    marginBottom: 12,
  },
  howItWorksLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  stepsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ede9fe",
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 16,
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  stepNumberBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.textPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  stepTextGroup: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stepSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
});
