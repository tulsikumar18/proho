import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  KeyRound,
  CheckCircle2,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  onFinish: () => void;
}

export const OnboardingCarouselScreen: React.FC<Props> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Earn more on every unit",
      description:
        "Higher commission on every unit you source and sell — credited to your bank within 72 hours of closing.",
      iconType: "earnings",
    },
    {
      title: "Instant visits with door OTP",
      description:
        "Book a visit and unlock smart-lock homes with a one-time OTP — no keys, no waiting for anyone.",
      iconType: "door",
    },
    {
      title: "Track earnings & unit status",
      description:
        "See every unit's status, offers and payouts live — with all your invoices in one place.",
      iconType: "tracking",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header with App Logo and Skip */}
      <View style={styles.header}>
        <View style={styles.miniLogo}>
          <Text style={styles.miniLogoText}>P</Text>
        </View>
        <TouchableOpacity onPress={onFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Middle Illustration & Graphic */}
      <View style={styles.graphicArea}>
        <View style={styles.cardContainer}>
          {slide.iconType === "earnings" && (
            <View style={styles.illustrationHero}>
              <View style={styles.circleGraphicPurple}>
                <Text style={styles.rupeeSymbol}>₹</Text>
              </View>
              <View style={styles.chartBarGroup}>
                <View style={[styles.bar, { height: 35 }]} />
                <View style={[styles.bar, { height: 55 }]} />
                <View style={[styles.bar, { height: 80, backgroundColor: COLORS.primaryLight }]} />
                <TrendingUp size={28} color={COLORS.primaryLight} style={{ position: "absolute", top: -32, right: 0 }} />
              </View>
              <View style={styles.coinStack}>
                <View style={styles.coin}><Text style={styles.coinText}>₹</Text></View>
                <View style={[styles.coin, { marginTop: -6 }]}><Text style={styles.coinText}>₹</Text></View>
              </View>
            </View>
          )}

          {slide.iconType === "door" && (
            <View style={styles.illustrationHero}>
              <View style={styles.phoneMockup}>
                <ShieldCheck size={36} color={COLORS.primaryLight} style={{ alignSelf: "center", marginTop: 8 }} />
                <View style={styles.otpBox}>
                  <Text style={styles.otpDigits}>1 2 3 4 5 6</Text>
                </View>
                <KeyRound size={22} color={COLORS.primaryLight} style={{ alignSelf: "center", marginTop: 10 }} />
              </View>
              <View style={styles.smartDoorGraphic}>
                <View style={styles.doorKeypad}>
                  <View style={styles.keypadDot} />
                  <View style={styles.keypadDot} />
                  <View style={styles.keypadDot} />
                </View>
                <View style={styles.doorHandle} />
              </View>
            </View>
          )}

          {slide.iconType === "tracking" && (
            <View style={styles.illustrationHero}>
              <View style={styles.invoiceSheet}>
                <View style={styles.sheetHeader}>
                  <View style={styles.rupeePill}>
                    <Text style={styles.rupeePillText}>₹</Text>
                  </View>
                  <View style={styles.sheetLinesGroup}>
                    <View style={styles.sheetLine} />
                    <View style={[styles.sheetLine, { width: "60%" }]} />
                  </View>
                </View>

                <View style={styles.sheetBody}>
                  <TrendingUp size={30} color={COLORS.accentGreen} />
                  <CheckCircle2 size={24} color={COLORS.accentGreen} />
                </View>

                <View style={styles.sheetFooter}>
                  <View style={styles.avatarMini} />
                  <View style={styles.coinStackMini}>
                    <View style={styles.coinMini} />
                    <View style={[styles.coinMini, { marginTop: -4 }]} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Slide Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      {/* Pagination & Next Button */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  miniLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  miniLogoText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 18,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  graphicArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: 260,
    height: 260,
    backgroundColor: "#f5f3ff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  illustrationHero: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  circleGraphicPurple: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 30,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  rupeeSymbol: {
    fontSize: 48,
    color: "#ffffff",
    fontWeight: "800",
  },
  chartBarGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    position: "absolute",
    bottom: 35,
    right: 40,
  },
  bar: {
    width: 14,
    backgroundColor: "#c4b5fd",
    borderRadius: 4,
  },
  coinStack: {
    position: "absolute",
    bottom: 35,
    left: 40,
  },
  coin: {
    width: 38,
    height: 18,
    backgroundColor: "#a78bfa",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  coinText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "800",
  },
  phoneMockup: {
    width: 110,
    height: 170,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#e5e7eb",
    padding: 8,
    position: "absolute",
    left: 40,
    top: 45,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  otpBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: 10,
    alignItems: "center",
  },
  otpDigits: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.textPrimary,
  },
  smartDoorGraphic: {
    width: 80,
    height: 180,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    position: "absolute",
    right: 45,
    top: 40,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffffff",
  },
  doorKeypad: {
    width: 22,
    height: 40,
    backgroundColor: "#3b0764",
    borderRadius: 4,
    marginTop: 30,
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 4,
  },
  keypadDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c084fc",
  },
  doorHandle: {
    width: 18,
    height: 5,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    marginTop: 8,
  },
  invoiceSheet: {
    width: 150,
    height: 190,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: "#ede9fe",
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  rupeePill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  rupeePillText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  sheetLinesGroup: {
    flex: 1,
    gap: 4,
  },
  sheetLine: {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    width: "90%",
  },
  sheetBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 14,
  },
  sheetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  avatarMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
  },
  coinStackMini: {
    alignItems: "center",
  },
  coinMini: {
    width: 24,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#a855f7",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  textContainer: {
    paddingHorizontal: 28,
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  dotActive: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
  },
  nextButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
