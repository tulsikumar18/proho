import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  Share2,
  AlertCircle,
  Building2,
  Calendar,
  Lock,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { SourcedUnitData } from "./AddUnitWizardScreen";

interface Props {
  unit: SourcedUnitData;
  onBack: () => void;
  onWithdraw?: (id: string) => void;
}

export const SourcingUnitDetailScreen: React.FC<Props> = ({
  unit,
  onBack,
  onWithdraw,
}) => {
  const handleCallExecutive = () => {
    Linking.openURL("tel:+919871234567").catch(() => {
      Alert.alert("Contact Field Executive", "Amit Kumar (Field Specialist): +91 98712 34567");
    });
  };

  const handleShareWhatsApp = () => {
    Alert.alert(
      "Share Unit Status",
      `Shared ${unit.society} (${unit.tower} · ${unit.flatNo}) tracking link with client via WhatsApp.`
    );
  };

  const handleWithdrawPrompt = () => {
    Alert.alert(
      "Withdraw Unit?",
      "Are you sure you want to withdraw this sourced unit? This will cancel the physical inspection.",
      [
        { text: "Keep Active", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => {
            if (onWithdraw) onWithdraw(unit.id);
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBack}
        >
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {unit.society} · {unit.flatNo}
          </Text>
          <Text style={styles.headerSub}>{unit.tower} · {unit.sublocality}</Text>
        </View>
        <TouchableOpacity
          style={styles.shareIconBtn}
          activeOpacity={0.8}
          onPress={handleShareWhatsApp}
        >
          <Share2 size={20} color={COLORS.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Pipeline Tracker */}
        <View style={styles.pipelineCard}>
          <Text style={styles.cardHeaderTitle}>VERIFICATION STATUS</Text>

          <View style={styles.timelineRow}>
            {/* Step 1: Sourced */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineNode, styles.timelineNodeDone]}>
                <CheckCircle2 size={16} color="#ffffff" />
              </View>
              <Text style={styles.timelineStepLabel}>Sourced</Text>
              <Text style={styles.timelineStepSub}>Submitted</Text>
            </View>

            <View style={[styles.timelineLine, styles.timelineLineDone]} />

            {/* Step 2: Under Evaluation */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineNode, styles.timelineNodeActive]}>
                <Clock size={16} color="#ffffff" />
              </View>
              <Text style={[styles.timelineStepLabel, { color: "#b45309" }]}>
                Evaluating
              </Text>
              <Text style={styles.timelineStepSub}>Inspection</Text>
            </View>

            <View style={styles.timelineLine} />

            {/* Step 3: Legal Clearance */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineNode}>
                <Text style={styles.timelineNodeNumber}>3</Text>
              </View>
              <Text style={styles.timelineStepLabel}>Legal</Text>
              <Text style={styles.timelineStepSub}>Clearance</Text>
            </View>

            <View style={styles.timelineLine} />

            {/* Step 4: Active */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineNode}>
                <Text style={styles.timelineNodeNumber}>4</Text>
              </View>
              <Text style={styles.timelineStepLabel}>Active</Text>
              <Text style={styles.timelineStepSub}>On Market</Text>
            </View>
          </View>
        </View>

        {/* 24-Hour SLA Countdown Card */}
        <View style={styles.countdownCard}>
          <View style={styles.countdownHeader}>
            <Clock size={20} color="#b45309" />
            <Text style={styles.countdownTitle}>Inspection in Progress</Text>
          </View>
          <Text style={styles.countdownTimer}>
            Executive arriving in 4h 32m
          </Text>
          <Text style={styles.countdownDesc}>
            Physical inspection & photographic survey will be completed within 24 hours of submission.
          </Text>

          <View style={styles.executiveRow}>
            <View style={styles.executiveAvatar}>
              <Text style={styles.executiveAvatarText}>AK</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.executiveName}>Amit Kumar</Text>
              <Text style={styles.executiveRole}>Aashrayo Field Specialist</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              onPress={handleCallExecutive}
            >
              <Phone size={15} color="#ffffff" />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unit Specifications Card */}
        <View style={styles.specsCard}>
          <Text style={styles.cardHeaderTitle}>UNIT SPECIFICATIONS</Text>

          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Configuration</Text>
              <Text style={styles.specVal}>{unit.bhk}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Super Area</Text>
              <Text style={styles.specVal}>{unit.superArea} sq ft</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Floor</Text>
              <Text style={styles.specVal}>{unit.floor} of {unit.totalFloors}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Furnishing</Text>
              <Text style={styles.specVal}>{unit.furnishing}</Text>
            </View>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Expected Price</Text>
            <Text style={styles.priceVal}>{unit.priceDisplay}</Text>
          </View>
        </View>

        {/* CP Policy Guarantee Checklist */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <ShieldCheck size={20} color={COLORS.primaryLight} />
            <Text style={styles.policyHeaderTitle}>CP Policy & Commission Protection</Text>
          </View>

          <View style={styles.policyPoint}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Text style={styles.policyPointText}>
              <Text style={{ fontWeight: "700" }}>2% Gross Commission</Text> guaranteed on final agreement value upon deal closing.
            </Text>
          </View>

          <View style={styles.policyPoint}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Text style={styles.policyPointText}>
              <Text style={{ fontWeight: "700" }}>60-Day Exclusive Attribution</Text> locked to your partner profile.
            </Text>
          </View>

          <View style={styles.policyPoint}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Text style={styles.policyPointText}>
              <Text style={{ fontWeight: "700" }}>5% TDS Withholding</Text> under Section 194H with instant digital Form 16A.
            </Text>
          </View>

          <View style={[styles.policyPoint, { marginBottom: 0 }]}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Text style={styles.policyPointText}>
              <Text style={{ fontWeight: "700" }}>Direct Bank Transfer</Text> to registered account within 72 hours of registry.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.shareWhatsAppBtn}
          activeOpacity={0.85}
          onPress={handleShareWhatsApp}
        >
          <Share2 size={18} color="#ffffff" />
          <Text style={styles.shareWhatsAppText}>Share tracking status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.withdrawBtn}
          activeOpacity={0.85}
          onPress={handleWithdrawPrompt}
        >
          <Text style={styles.withdrawText}>Withdraw unit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  shareIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#faf5ff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  pipelineCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineStep: {
    alignItems: "center",
    width: 60,
  },
  timelineNode: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  timelineNodeDone: {
    backgroundColor: "#16a34a",
  },
  timelineNodeActive: {
    backgroundColor: "#f59e0b",
  },
  timelineNodeNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  timelineStepLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  timelineStepSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 1,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e5e7eb",
    marginBottom: 16,
  },
  timelineLineDone: {
    backgroundColor: "#16a34a",
  },
  countdownCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  countdownTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },
  countdownTimer: {
    fontSize: 20,
    fontWeight: "800",
    color: "#78350f",
    marginBottom: 4,
  },
  countdownDesc: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 16,
    marginBottom: 16,
  },
  executiveRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 12,
    padding: 12,
  },
  executiveAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },
  executiveAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  executiveName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  executiveRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 6,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  specsCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specBox: {
    width: "47%",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  specLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  specVal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  priceVal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.accentGreen,
  },
  policyCard: {
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: "#f3e8ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  policyHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  policyPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  policyPointText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  shareWhatsAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    marginBottom: 12,
  },
  shareWhatsAppText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  withdrawBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  withdrawText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
  },
});
