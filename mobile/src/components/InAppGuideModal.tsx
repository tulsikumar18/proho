import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Home, X } from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const InAppGuideModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const [guideStep, setGuideStep] = useState(1);

  if (!visible) return null;

  const steps = [
    {
      step: 1,
      title: "Your dashboard",
      desc: "Today's tasks, earnings and updates — all in one place.",
    },
    {
      step: 2,
      title: "Sourcing resale units",
      desc: "Submit your client's units and receive cash offers in 48 hours.",
    },
    {
      step: 3,
      title: "Instant OTP visits",
      desc: "Access verified homes instantly with digital smart-lock OTPs.",
    },
    {
      step: 4,
      title: "Referral token sharing",
      desc: "Share inventory on WhatsApp with your protected 60-day buyer lock.",
    },
    {
      step: 5,
      title: "Transparent earnings",
      desc: "Track commission ledgers, TDS invoices, and disburse to bank.",
    },
    {
      step: 6,
      title: "KYC compliance",
      desc: "Upload PAN & Aadhaar to unlock unlimited visits and withdrawals.",
    },
  ];

  const current = steps[guideStep - 1];

  const handleNext = () => {
    if (guideStep < steps.length) {
      setGuideStep(guideStep + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.iconBadge}>
            <Home size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.guideBadgeText}>
            APP GUIDE · {current.step}/{steps.length}
          </Text>
        </View>

        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={styles.closeCircle}>
            <X size={16} color={COLORS.textPrimary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.desc}>{current.desc}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {steps.map((s) => (
            <View
              key={s.step}
              style={[
                styles.dot,
                s.step === current.step && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  guideBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
