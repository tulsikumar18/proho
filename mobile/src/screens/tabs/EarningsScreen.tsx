import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Clock,
  CheckCircle2,
  Gift,
  Plus,
  Calendar,
  ChevronRight,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { PartnerProfile } from "../../types";
import { SupportFab } from "../../components/SupportFab";

interface Props {
  profile: PartnerProfile;
  onOpenSubmitUnit: () => void;
  onOpenScheduleVisit: () => void;
}

export const EarningsScreen: React.FC<Props> = ({
  profile,
  onOpenSubmitUnit,
  onOpenScheduleVisit,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Hero Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>

        <View style={styles.earnedHeroBox}>
          <Text style={styles.totalEarnedLabel}>TOTAL EARNED</Text>
          <Text style={styles.totalEarnedAmount}>{profile.total_earned || "₹0"}</Text>
          <Text style={styles.thisMonthText}>
            {profile.this_month_earned || "+₹0"} This month
          </Text>
        </View>

        {/* 3 Summary Cards Row */}
        <View style={styles.summaryRow}>
          {/* Card 1: Pending payout */}
          <View style={styles.summaryCard}>
            <View style={[styles.cardIconBox, { backgroundColor: "#fef3c7" }]}>
              <Clock size={16} color="#d97706" />
            </View>
            <Text style={styles.cardAmount}>{profile.pending_payout || "₹0"}</Text>
            <Text style={styles.cardLabel}>Pending payout</Text>
          </View>

          {/* Card 2: Paid */}
          <View style={styles.summaryCard}>
            <View style={[styles.cardIconBox, { backgroundColor: "#dcfce7" }]}>
              <CheckCircle2 size={16} color="#15803d" />
            </View>
            <Text style={styles.cardAmount}>{profile.paid_amount || "₹0"}</Text>
            <Text style={styles.cardLabel}>Paid</Text>
          </View>

          {/* Card 3: Referrals */}
          <View style={[styles.summaryCard, styles.referralCard]}>
            <View style={[styles.cardIconBox, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Gift size={16} color="#ffffff" />
            </View>
            <Text style={[styles.cardAmount, { color: "#ffffff" }]}>
              {profile.referral_earnings || "₹0"}
            </Text>
            <Text style={[styles.cardLabel, { color: "rgba(255,255,255,0.9)" }]}>
              Referrals
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Action List Section */}
        <View style={styles.actionsList}>
          {/* Action 1: Submit a unit */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.8}
            onPress={onOpenSubmitUnit}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: "#faf5ff" }]}>
                <Plus size={20} color={COLORS.primary} strokeWidth={3} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Submit a unit</Text>
                <Text style={styles.actionSubtitle}>Add a unit in 3 easy steps</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Action 2: Schedule a visit */}
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.8}
            onPress={onOpenScheduleVisit}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBox, { backgroundColor: "#eff6ff" }]}>
                <Calendar size={20} color={COLORS.accentBlue} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Schedule a visit</Text>
                <Text style={styles.actionSubtitle}>Show a unit to your client</Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 20,
  },
  totalEarnedLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#e9d5ff",
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalEarnedAmount: {
    fontSize: 44,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1,
  },
  thisMonthText: {
    fontSize: 14,
    color: "#e9d5ff",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 24,
  },
  earnedHeroBox: {
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
  },
  referralCard: {
    backgroundColor: "#f97316",
  },
  cardIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  actionsList: {
    gap: 14,
  },
  actionItem: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
