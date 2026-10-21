import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
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
  Sparkles,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { PartnerProfile } from "../../types";
import { InAppGuideModal } from "../../components/InAppGuideModal";
import { SupportFab } from "../../components/SupportFab";

interface Props {
  profile: PartnerProfile;
  onNavigateTab: (tab: "Home" | "Sourcing" | "Selling" | "Earnings" | "More") => void;
  onOpenKycModal: () => void;
  onOpenSubmitUnit: () => void;
  onOpenScheduleVisit: () => void;
  onOpenShareModal: () => void;
  onToggleLanguage: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  profile,
  onNavigateTab,
  onOpenKycModal,
  onOpenSubmitUnit,
  onOpenScheduleVisit,
  onOpenShareModal,
  onToggleLanguage,
}) => {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Purple Gradient Hero Header */}
      <View style={styles.header}>
        <View style={styles.greetingGroup}>
          <Text style={styles.salutation}>Namaste,</Text>
          <Text style={styles.userName}>{profile.user.first_name || "Partner"}</Text>
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
              Alert.alert("Notifications", "You have 2 new updates on Noida Extension verified units.")
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
        {/* Festive Navratri Dhamaka Promotional Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTagRow}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>SELLING OFFER</Text>
            </View>
            <View style={styles.festiveTag}>
              <Sparkles size={12} color="#ffffff" />
              <Text style={styles.festiveTagText}>NAVRATRI DHAMAKA</Text>
            </View>
          </View>

          <Text style={styles.bannerTitle}>
            2% + iPhone 17 + ₹10k per meeting
          </Text>
          <Text style={styles.bannerSubtitle} numberOfLines={2}>
            Earn 2% commission on every successful sale across all units, win an iPhone 17 on closing!
          </Text>

          <TouchableOpacity
            style={styles.bannerLinkRow}
            activeOpacity={0.8}
            onPress={() => onNavigateTab("Selling")}
          >
            <Text style={styles.bannerLinkText}>View Details</Text>
            <ChevronRight size={16} color="#ffffff" />
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

          {/* Card 3: Sell Proho Unit */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => onNavigateTab("Selling")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#faf5ff" }]}>
              <HomeIcon size={22} color={COLORS.primaryLight} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionTitle}>Sell Proho Unit</Text>
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
          onPress={onOpenKycModal}
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

        {/* Section: My Tasks */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>My Tasks</Text>
        </View>

        <View style={styles.emptyTasksBox}>
          <Text style={styles.emptyTasksTitle}>No pending tasks for today</Text>
          <Text style={styles.emptyTasksSubtitle}>
            Share inventory to start receiving buyer inquiries!
          </Text>
        </View>
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
    paddingBottom: 20,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e11d48",
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
    lineHeight: 26,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#e9d5ff",
    lineHeight: 18,
    marginBottom: 14,
  },
  bannerLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bannerLinkText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#ede9fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  kycCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kycLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  kycIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  kycSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  emptyTasksBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  emptyTasksTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptyTasksSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
