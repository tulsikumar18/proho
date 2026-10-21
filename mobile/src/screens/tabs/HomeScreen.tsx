import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Languages,
  Plus,
  Calendar,
  Home as HomeIcon,
  Share2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  KeyRound,
  CheckCircle2,
  Box,
  FileCheck2,
  Lock,
  Coins,
  Play,
  FileText,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { PartnerProfile } from "../../types";
import { InAppGuideModal } from "../../components/InAppGuideModal";
import { SupportFab } from "../../components/SupportFab";

interface Props {
  profile: PartnerProfile;
  onNavigateTab: (tab: "Home" | "Sourcing" | "Selling" | "Earnings" | "More") => void;
  onOpenMyDetails: () => void;
  onOpenSubmitUnit: () => void;
  onOpenScheduleVisit: () => void;
  onOpenShareModal: () => void;
  onToggleLanguage: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  profile,
  onNavigateTab,
  onOpenMyDetails,
  onOpenSubmitUnit,
  onOpenScheduleVisit,
  onOpenShareModal,
  onToggleLanguage,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Purple Gradient Hero Header */}
      <View style={styles.header}>
        <View style={styles.greetingGroup}>
          <Text style={styles.salutation}>Namaste,</Text>
          <Text style={styles.userName}>{profile.user.first_name || "Kritaank"}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={onToggleLanguage}
          >
            <Languages size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Notifications",
                "• Diwali Sourcing bonus live!\n• 2 new verified units added in Greater Noida West."
              )
            }
          >
            <Bell size={20} color="#ffffff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Festive Diwali Sourcing Promotional Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTagRow}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>SOURCING OFFER</Text>
            </View>
            <View style={styles.festiveTag}>
              <Text style={styles.festiveTagText}>DIWALI SOURCING OFFER</Text>
            </View>
          </View>

          <Text style={styles.bannerTitle}>
            1% + Upto ₹2 Lac Sourcing Bonus
          </Text>
          <Text style={styles.bannerSubtitle} numberOfLines={2}>
            Celebrate Diwali with Aashrayo's Diwali Sourcing Offer and earn 1% commission + Upto 2 Lac Bonus...
          </Text>

          <TouchableOpacity
            style={styles.bannerLinkRow}
            activeOpacity={0.8}
            onPress={() => onNavigateTab("Sourcing")}
          >
            <Text style={styles.bannerLinkText}>View Details →</Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 Quick Action Grid */}
        <View style={styles.actionGrid}>
          {/* Card 1: Submit Seller Unit */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={onOpenSubmitUnit}
          >
            <View style={[styles.actionIconBox, { backgroundColor: COLORS.primary }]}>
              <Plus size={22} color="#ffffff" strokeWidth={3} />
            </View>
            <Text style={styles.actionTitle}>Submit Seller Unit</Text>
            <Text style={styles.actionSubtitle}>Takes 3 steps</Text>
          </TouchableOpacity>

          {/* Card 2: Schedule a visit */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={onOpenScheduleVisit}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#eff6ff" }]}>
              <Calendar size={22} color={COLORS.accentBlue} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Schedule a visit</Text>
            <Text style={styles.actionSubtitle}>OTP door access</Text>
          </TouchableOpacity>

          {/* Card 3: Sell Aashrayo Unit */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => onNavigateTab("Selling")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#faf5ff" }]}>
              <HomeIcon size={22} color={COLORS.primaryLight} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Sell Aashrayo Unit</Text>
            <Text style={styles.actionSubtitle}>38 live</Text>
          </TouchableOpacity>

          {/* Card 4: Share inventory */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={onOpenShareModal}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#ecfdf5" }]}>
              <Share2 size={22} color={COLORS.accentGreen} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Share inventory</Text>
            <Text style={styles.actionSubtitle}>WhatsApp · PDF</Text>
          </TouchableOpacity>
        </View>

        {/* In-App Guide Tooltip */}
        {showGuide && (
          <InAppGuideModal
            visible={showGuide}
            onDismiss={() => setShowGuide(false)}
          />
        )}

        {/* Section: Get started */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Get started</Text>
        </View>

        <TouchableOpacity
          style={styles.kycCard}
          activeOpacity={0.85}
          onPress={onOpenMyDetails}
        >
          <View style={styles.kycLeft}>
            <View style={styles.kycIconBox}>
              <ShieldCheck size={26} color={COLORS.accentGreen} />
            </View>
            <View>
              <Text style={styles.kycTitle}>Complete your KYC</Text>
              <Text style={styles.kycSubtitle}>Unlock visits & payouts</Text>
            </View>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Section: My Visits */}
        <TouchableOpacity
          style={styles.myVisitsCard}
          activeOpacity={0.85}
          onPress={onOpenScheduleVisit}
        >
          <View style={styles.myVisitsLeft}>
            <View style={styles.myVisitsIconBox}>
              <Calendar size={22} color={COLORS.primaryLight} />
            </View>
            <View>
              <Text style={styles.myVisitsTitle}>My Visits</Text>
              <Text style={styles.myVisitsSubtitle}>Schedule your first visit</Text>
            </View>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Section: TOTAL EARNED */}
        <View style={styles.earnedCard}>
          <View style={styles.earnedTopRow}>
            <View>
              <Text style={styles.earnedLabel}>TOTAL EARNED</Text>
              <Text style={styles.earnedAmount}>{profile.total_earned || "₹0"}</Text>
            </View>
            <TouchableOpacity
              style={styles.earnedCircleBtn}
              activeOpacity={0.8}
              onPress={() => onNavigateTab("Earnings")}
            >
              <ChevronRight size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.earnedNotice}>
            Submit your first unit to start earning commission.
          </Text>
        </View>

        {/* Section: YOUR ACTIVITY - Lifetime */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>YOUR ACTIVITY</Text>
          <Text style={styles.sectionMeta}>Lifetime</Text>
        </View>

        <View style={styles.activityGrid}>
          {/* Card 1: Submitted */}
          <View style={styles.activityCard}>
            <View style={[styles.actIconBox, { backgroundColor: "#f3e8ff" }]}>
              <Box size={20} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.actCount}>0</Text>
            <Text style={styles.actLabel}>Submitted</Text>
          </View>

          {/* Card 2: Offers */}
          <View style={styles.activityCard}>
            <View style={[styles.actIconBox, { backgroundColor: "#fff7ed" }]}>
              <TrendingUp size={20} color="#f97316" />
            </View>
            <Text style={styles.actCount}>0</Text>
            <Text style={styles.actLabel}>Offers</Text>
          </View>

          {/* Card 3: Sourced */}
          <View style={styles.activityCard}>
            <View style={[styles.actIconBox, { backgroundColor: "#ecfdf5" }]}>
              <CheckCircle2 size={20} color="#16a34a" />
            </View>
            <Text style={styles.actCount}>0</Text>
            <Text style={styles.actLabel}>Sourced</Text>
          </View>

          {/* Card 4: Visits done */}
          <View style={styles.activityCard}>
            <View style={[styles.actIconBox, { backgroundColor: "#eff6ff" }]}>
              <Calendar size={20} color="#2563eb" />
            </View>
            <Text style={styles.actCount}>0</Text>
            <Text style={styles.actLabel}>Visits done</Text>
          </View>

          {/* Card 5: Revisits */}
          <View style={styles.activityCard}>
            <View style={[styles.actIconBox, { backgroundColor: "#ecfeff" }]}>
              <RotateCcw size={20} color="#06b6d4" />
            </View>
            <Text style={styles.actCount}>0</Text>
            <Text style={styles.actLabel}>Revisits</Text>
          </View>

          {/* Card 6: Units sold */}
          <View style={styles.activityCard}>
            <View style={[styles.actIconBox, { backgroundColor: "#fdf4ff" }]}>
              <KeyRound size={20} color="#c026d3" />
            </View>
            <Text style={styles.actCount}>0</Text>
            <Text style={styles.actLabel}>Units sold</Text>
          </View>
        </View>

        {/* Section: Tutorial Videos */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Tutorial Videos</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tutorialsScroll}
        >
          {/* Video 1 */}
          <TouchableOpacity
            style={styles.tutorialCard}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                "How to Book Visits",
                "Video Tutorial:\n1. Choose any live property under 'Selling'\n2. Pick a time slot between 9 AM - 7 PM\n3. An instant 6-digit door OTP will unlock access."
              )
            }
          >
            <View style={styles.tutorialThumb}>
              <View style={styles.tutorialPlayBadge}>
                <Play size={20} color={COLORS.primary} fill={COLORS.primary} />
              </View>
              <Text style={styles.thumbTitle}>HOW TO BOOK VISIT FOR SELLING</Text>
              <Text style={styles.thumbSub}>on the Aashrayo Partner App</Text>
            </View>
            <Text style={styles.tutorialTitle}>How to Book Visits</Text>
          </TouchableOpacity>

          {/* Video 2 */}
          <TouchableOpacity
            style={styles.tutorialCard}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                "How to Submit Unit",
                "Video Tutorial:\n1. Open 'Sourcing' tab\n2. Search and select society\n3. Fill unit details & attach photos\n4. Our team evaluates within 48 hours."
              )
            }
          >
            <View style={[styles.tutorialThumb, { backgroundColor: "#1e1b4b" }]}>
              <View style={styles.tutorialPlayBadge}>
                <Play size={20} color={COLORS.primary} fill={COLORS.primary} />
              </View>
              <Text style={styles.thumbTitle}>HOW TO SUBMIT UNIT FOR SOURCING</Text>
              <Text style={styles.thumbSub}>on the Aashrayo Partner App</Text>
            </View>
            <Text style={styles.tutorialTitle}>How to Submit Unit</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Section: Why Aashrayo works */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Why Aashrayo works</Text>
        </View>

        <View style={styles.whyGrid}>
          <View style={styles.whyItem}>
            <View style={[styles.whyIconBox, { backgroundColor: "#dcfce7" }]}>
              <CheckCircle2 size={20} color="#16a34a" />
            </View>
            <Text style={styles.whyText}>Verified units</Text>
          </View>

          <View style={styles.whyItem}>
            <View style={[styles.whyIconBox, { backgroundColor: "#dbeafe" }]}>
              <FileCheck2 size={20} color="#2563eb" />
            </View>
            <Text style={styles.whyText}>Legal-checked</Text>
          </View>

          <View style={styles.whyItem}>
            <View style={[styles.whyIconBox, { backgroundColor: "#f3e8ff" }]}>
              <Lock size={20} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.whyText}>Smart-lock access</Text>
          </View>

          <View style={styles.whyItem}>
            <View style={[styles.whyIconBox, { backgroundColor: "#fef3c7" }]}>
              <Coins size={20} color="#d97706" />
            </View>
            <Text style={styles.whyText}>Fast payout</Text>
          </View>
        </View>

        {/* CP Policy Card */}
        <TouchableOpacity
          style={styles.policyCard}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              "Aashrayo Channel Partner Policy",
              "• 60-Day Lead Protection: When you register a buyer or visit, your referral is locked for 60 days.\n• 2% Commission: Calculated on final agreement value.\n• Guaranteed Payouts: Directly disbursed via bank NEFT/RTGS with verified UTR within 48h of closure."
            )
          }
        >
          <View style={styles.policyLeft}>
            <FileText size={22} color={COLORS.textPrimary} />
            <View>
              <Text style={styles.policyTitle}>CP Policy</Text>
              <Text style={styles.policySubtitle}>Attribution, commission, payout</Text>
            </View>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Support Floating Button */}
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
    paddingBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingGroup: {
    gap: 2,
  },
  salutation: {
    fontSize: 14,
    color: "#e9d5ff",
    fontWeight: "500",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bannerCard: {
    backgroundColor: "#2e0854",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#2e0854",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerTagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  bannerTag: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bannerTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2e0854",
  },
  festiveTag: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  festiveTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#e9d5ff",
    lineHeight: 18,
    marginBottom: 12,
  },
  bannerLinkRow: {
    alignSelf: "flex-start",
  },
  bannerLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  kycCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  kycLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  kycIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  kycSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  myVisitsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  myVisitsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  myVisitsIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#faf5ff",
    justifyContent: "center",
    alignItems: "center",
  },
  myVisitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  myVisitsSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  earnedCard: {
    backgroundColor: "#2e0854",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  earnedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  earnedLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#c084fc",
    letterSpacing: 0.5,
  },
  earnedAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 4,
  },
  earnedCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  earnedNotice: {
    fontSize: 13,
    color: "#e9d5ff",
    lineHeight: 18,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  activityCard: {
    width: "31%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    gap: 6,
  },
  actIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actCount: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  actLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
  },
  tutorialsScroll: {
    gap: 14,
    paddingRight: 10,
    marginBottom: 18,
  },
  tutorialCard: {
    width: 250,
  },
  tutorialThumb: {
    height: 140,
    backgroundColor: "#2e0854",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
  },
  tutorialPlayBadge: {
    position: "absolute",
    top: 50,
    left: 105,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    width: "70%",
  },
  thumbSub: {
    fontSize: 11,
    color: "#e9d5ff",
    fontWeight: "500",
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  whyGrid: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  whyItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  whyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  whyText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  policyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#e5e7eb",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  policyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  policySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
