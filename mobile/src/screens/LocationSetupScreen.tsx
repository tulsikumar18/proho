import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MapPin, Search, ChevronDown, Check, ChevronRight } from "lucide-react-native";
import { COLORS, BASE_LOCATIONS, ALL_WORK_AREAS } from "../constants/theme";

interface Props {
  onContinue: (baseLocation: string, selectedAreas: string[]) => void;
}

export const LocationSetupScreen: React.FC<Props> = ({ onContinue }) => {
  const [baseLocation, setBaseLocation] = useState("Greater Noida West");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    "Central Noida",
    "Gaur City",
    "Indirapuram",
    "Noida Expressway",
    "Sector 16B",
    "Techzone",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBaseModal, setShowBaseModal] = useState(false);

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const filteredAreas = ALL_WORK_AREAS.filter((a) =>
    a.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleContinue = () => {
    onContinue(baseLocation, selectedAreas);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Where do you work?</Text>
        <Text style={styles.subtitle}>
          Select your base location and work areas to get started
        </Text>

        {/* Step 1: Base Location */}
        <View style={styles.stepHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Your base location</Text>
            <Text style={styles.stepSubtitle}>Primary market where you operate</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dropdownButton}
          activeOpacity={0.8}
          onPress={() => setShowBaseModal(true)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MapPin size={20} color={COLORS.textMuted} />
            <Text style={styles.dropdownValue}>
              {baseLocation || "Select base location"}
            </Text>
          </View>
          <ChevronDown size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Step 2: Additional Work Areas */}
        <View style={[styles.stepHeader, { marginTop: 32 }]}>
          <View style={[styles.stepBadge, styles.stepBadgeSecondary]}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Additional work areas</Text>
            <Text style={styles.stepSubtitle}>Optional — areas where you also operate</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search to add more areas"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Work Area Chips (Comprehensive List) */}
        <View style={styles.chipsContainer}>
          {filteredAreas.map((area) => {
            const isSelected = selectedAreas.includes(area);
            return (
              <TouchableOpacity
                key={area}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
                activeOpacity={0.75}
                onPress={() => toggleArea(area)}
              >
                {isSelected && (
                  <Check size={14} color="#ffffff" strokeWidth={3} style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {area}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue ({selectedAreas.length} areas)
          </Text>
          <ChevronRight size={18} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Base Location Picker Modal */}
      <Modal visible={showBaseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Primary Market</Text>
            {BASE_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.modalItem,
                  baseLocation === loc && styles.modalItemSelected,
                ]}
                onPress={() => {
                  setBaseLocation(loc);
                  setShowBaseModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    baseLocation === loc && styles.modalItemTextSelected,
                  ]}
                >
                  {loc}
                </Text>
                {baseLocation === loc && (
                  <Check size={18} color={COLORS.primaryLight} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBaseModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeSecondary: {
    backgroundColor: "#a855f7",
  },
  stepBadgeText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  dropdownButton: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  searchBar: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  continueButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemSelected: {
    backgroundColor: "#faf5ff",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  modalItemTextSelected: {
    color: COLORS.primaryLight,
    fontWeight: "700",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCloseText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
});
