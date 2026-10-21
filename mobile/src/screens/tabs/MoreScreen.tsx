import React from "react";
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
  FileText,
  Flag,
  FileCheck2,
  User,
  Globe,
  Sparkles,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { PartnerProfile } from "../../types";
import { SupportFab } from "../../components/SupportFab";

interface Props {
  profile: PartnerProfile;
  onOpenKycModal: () => void;
  onOpenInvoicesModal: () => void;
  onOpenCpPolicy: () => void;
  onOpenPolicyTracker: () => void;
  onToggleLanguage: () => void;
  onRestartAppGuide: () => void;
  onLogout: () => void;
}

export const MoreScreen: React.FC<Props> = ({
  profile,
  onOpenKycModal,
  onOpenInvoicesModal,
  onOpenCpPolicy,
  onOpenPolicyTracker,
  onToggleLanguage,
  onRestartAppGuide,
  onLogout,
}) => {
  const getInitials = () => {
    const f = profile.user.first_name?.[0] || "K";
    const l = profile.user.last_name?.[0] || "K";
    return (f + l).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header Profile Bar */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{getInitials()}</Text>
        </View>
        <View style={styles.profileMeta}>
          <Text style={styles.profileName}>{profile.user.full_name || "Partner Name"}</Text>
          <Text style={styles.profilePhone}>
            {profile.user.phone ? profile.user.phone.replace(/(\+91\s\d{2})\d{4}(\d{4})/, "$1××××$2") : "+91 80××××6342"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: BUSINESS */}
        <Text style={styles.sectionHeaderLabel}>BUSINESS</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={onOpenCpPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <FileText size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>CP Policy</Text>
                <Text style={styles.menuSub}>Attribution · commission · payout</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={onOpenPolicyTracker}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <Flag size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>My policy tracker</Text>
                <Text style={styles.menuSub}>Per-unit attribution status</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.8}
            onPress={onOpenInvoicesModal}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <FileCheck2 size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Invoices</Text>
                <Text style={styles.menuSub}>Generated · approved · paid</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: PROFILE */}
        <Text style={styles.sectionHeaderLabel}>PROFILE</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.8}
            onPress={onOpenKycModal}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <User size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>My details & KYC</Text>
                <Text style={styles.menuSub}>
                  {profile.kyc_status === "APPROVED" ? "KYC approved" : "KYC pending"}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {profile.kyc_status !== "APPROVED" && (
                <View style={styles.redPendingDot} />
              )}
              <ChevronRight size={18} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: APP */}
        <Text style={styles.sectionHeaderLabel}>APP</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={onToggleLanguage}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <Globe size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Language</Text>
                <Text style={styles.menuSub}>
                  {profile.user.preferred_language === "hi" ? "हिंदी" : "English"}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.8}
            onPress={onRestartAppGuide}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <Sparkles size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>App guide</Text>
                <Text style={styles.menuSub}>Watch again</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                "Help & FAQ",
                "• Call Support: 9:00 AM - 8:00 PM\n• WhatsApp Support: +91 9999 123 456\n• Email: partners@proho.in"
              )
            }
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#faf5ff" }]}>
                <HelpCircle size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Help & FAQ</Text>
                <Text style={styles.menuSub}>Call · WhatsApp · chat</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={onLogout}
        >
          <LogOut size={18} color={COLORS.textPrimary} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* Version Footer */}
        <Text style={styles.versionFooter}>App Versions · v3.2.0</Text>
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
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
  },
  profileMeta: {
    gap: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  profilePhone: {
    fontSize: 14,
    color: "#e9d5ff",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  sectionHeaderLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  menuGroup: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  redPendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  logoutButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  versionFooter: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});
