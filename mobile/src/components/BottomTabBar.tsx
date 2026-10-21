import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Home,
  Package,
  Store,
  CircleDollarSign,
  LayoutGrid,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";

export type TabKey = "Home" | "Sourcing" | "Selling" | "Earnings" | "More";

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: "Home" as TabKey, label: "Home", icon: Home },
    { key: "Sourcing" as TabKey, label: "Sourcing", icon: Package },
    { key: "Selling" as TabKey, label: "Selling", icon: Store },
    { key: "Earnings" as TabKey, label: "Earnings", icon: CircleDollarSign },
    { key: "More" as TabKey, label: "More", icon: LayoutGrid },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.key)}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <IconComponent
                size={22}
                color={isActive ? COLORS.primary : COLORS.textMuted}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: "#ede9fe",
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
