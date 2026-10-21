import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Polygon,
} from "react-native-svg";
import { COLORS } from "../constants/theme";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "stacked";
  theme?: "dark" | "light";
  subtitle?: string;
}

export const AashrayoIcon: React.FC<{ size?: number }> = ({ size = 44 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="m-grad-primary" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#4318FF" />
          <Stop offset="50%" stopColor="#7c3aed" />
          <Stop offset="100%" stopColor="#9333ea" />
        </LinearGradient>

        <LinearGradient id="m-grad-facet" x1="50" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#a855f7" />
          <Stop offset="50%" stopColor="#6366f1" />
          <Stop offset="100%" stopColor="#3b0764" />
        </LinearGradient>

        <LinearGradient id="m-grad-beacon" x1="30" y1="40" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="60%" stopColor="#818cf8" />
          <Stop offset="100%" stopColor="#6366f1" />
        </LinearGradient>
      </Defs>

      {/* Rounded Arch Shield */}
      <Rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="22"
        fill="url(#m-grad-primary)"
      />

      {/* Grid Circle Accent */}
      <Circle cx="50" cy="50" r="36" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />

      {/* A Apex / Modern Haven */}
      <Path
        d="M50 20L76 74H60L50 51L40 74H24L50 20Z"
        fill="#ffffff"
        fillRule="evenodd"
      />

      {/* Inner Sanctuary */}
      <Path
        d="M50 36L61 58H39L50 36Z"
        fill="url(#m-grad-facet)"
      />

      {/* Core Pillar */}
      <Path
        d="M50 49L54.5 58H45.5L50 49Z"
        fill="url(#m-grad-beacon)"
      />

      {/* Apex Diamond Keystone */}
      <Polygon
        points="50,15 54,20 50,25 46,20"
        fill="#f8fafc"
      />
    </Svg>
  );
};

export const AashrayoLogo: React.FC<LogoProps> = ({
  size = 48,
  variant = "stacked",
  theme = "light",
  subtitle = "CHANNEL PARTNER APP",
}) => {
  const isDark = theme === "dark";
  const titleColor = isDark ? "#ffffff" : COLORS.textPrimary;
  const subColor = isDark ? "#c4b5fd" : COLORS.primaryLight;

  if (variant === "icon") {
    return <AashrayoIcon size={size} />;
  }

  if (variant === "full") {
    return (
      <View style={styles.horizontalWrap}>
        <AashrayoIcon size={size} />
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: titleColor, fontSize: size * 0.44 }]}>
            AASHRAYO
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stackedWrap}>
      <AashrayoIcon size={size} />
      <Text style={[styles.title, { color: titleColor, fontSize: size * 0.48 }]}>
        AASHRAYO
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stackedWrap: {
    alignItems: "center",
    gap: 6,
  },
  textWrap: {
    flexDirection: "column",
  },
  title: {
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
