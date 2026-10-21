import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Building2,
  Plus,
  TrendingUp,
  CircleDollarSign,
  Search,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Tag,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { SupportFab } from "../../components/SupportFab";
import { SourcedUnitData } from "../sourcing/AddUnitWizardScreen";

interface Props {
  onOpenSubmitUnit: () => void;
  units?: SourcedUnitData[];
  onSelectUnit?: (unit: SourcedUnitData) => void;
}

export const sampleSourcedUnits: SourcedUnitData[] = [
  {
    id: "UNT-2026-1204",
    society: "Express Astra",
    sublocality: "Sector 1, Greater Noida West",
    tower: "Tower 2",
    flatNo: "1204",
    bhk: "3 BHK",
    toilets: "2",
    extraRooms: ["Study Room"],
    superArea: "1450",
    carpetArea: "1120",
    floor: "12",
    totalFloors: "24",
    furnishing: "Semi-Furnished",
    registrationType: "Sub-lease / Registry",
    priceNumeric: 11500000,
    priceDisplay: "₹1.15 Cr",
    photosCount: 6,
    hasFloorPlan: true,
    status: "Evaluating",
    submittedAt: "Today, 4:15 PM",
  },
];

export const SourcingScreen: React.FC<Props> = ({
  onOpenSubmitUnit,
  units = sampleSourcedUnits,
  onSelectUnit,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Evaluating" | "Active" | "Sold">("All");

  const filteredUnits = units.filter((u) => {
    if (filter !== "All" && u.status !== filter) return false;
    if (
      searchQuery.trim() &&
      !u.society.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.tower.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.flatNo.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const evaluatingCount = units.filter((u) => u.status === "Evaluating").length;
  const activeCount = units.filter((u) => u.status === "Active").length;
  const soldCount = units.filter((u) => u.status === "Sold").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sourcing</Text>
          <Text style={styles.headerSubtitle}>Submit & track your resale listings</Text>
        </View>

        <TouchableOpacity
          style={styles.addUnitHeaderBtn}
          activeOpacity={0.85}
          onPress={onOpenSubmitUnit}
        >
          <Plus size={16} color="#ffffff" strokeWidth={3} />
          <Text style={styles.addUnitHeaderBtnText}>Add unit</Text>
        </TouchableOpacity>
      </View>

      {/* If No Units exist: Empty State (Image 4) */}
      {units.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Illustration Hero */}
          <View style={styles.heroSection}>
            <View style={styles.iconBadgeLarge}>
              <Building2 size={44} color="#ffffff" strokeWidth={2} />
              <View style={styles.miniPlusCircle}>
                <Plus size={16} color={COLORS.primaryLight} strokeWidth={3} />
              </View>
            </View>

            <Text style={styles.heroTitle}>Submit your first unit</Text>
            <Text style={styles.heroDescription}>
              Bring your resale units to Aashrayo — we evaluate, make an offer, and help you close for a 2% commission.
            </Text>
          </View>

          {/* HOW IT WORKS Section */}
          <View style={styles.howItWorksHeader}>
            <Text style={styles.howItWorksLabel}>HOW IT WORKS</Text>
          </View>

          <View style={styles.stepsCard}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: "#f3e8ff" }]}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Building2 size={24} color={COLORS.primaryLight} />
              </View>
              <View style={styles.stepTextGroup}>
                <Text style={styles.stepHeading}>Submit a unit</Text>
                <Text style={styles.stepSub}>Pick a society, add details & photos</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: "#fef3c7" }]}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <TrendingUp size={24} color="#b45309" />
              </View>
              <View style={styles.stepTextGroup}>
                <Text style={styles.stepHeading}>Get an Aashrayo inspection</Text>
                <Text style={styles.stepSub}>Executive inspects & verifies in 24 hrs</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={[styles.stepItem, { borderBottomWidth: 0 }]}>
              <View style={[styles.stepIconWrap, { backgroundColor: "#dcfce7" }]}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <CircleDollarSign size={24} color="#15803d" />
              </View>
              <View style={styles.stepTextGroup}>
                <Text style={styles.stepHeading}>Earn 2% commission</Text>
                <Text style={styles.stepSub}>Paid to your bank when the deal closes</Text>
              </View>
            </View>
          </View>

          {/* Submit CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={onOpenSubmitUnit}
          >
            <Plus size={20} color="#ffffff" strokeWidth={3} />
            <Text style={styles.ctaButtonText}>Add a unit</Text>
          </TouchableOpacity>
          <Text style={styles.ctaSubtext}>3 easy steps · about 2 minutes</Text>
        </ScrollView>
      ) : (
        /* If Active Units exist: Active Inventory State (Image 11) */
        <View style={styles.activeContent}>
          {/* Search Box */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBarBox}>
              <Search size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Search your units..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Filter Chips Bar */}
          <View style={styles.filterChipsRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === "All" && styles.filterChipActive]}
              onPress={() => setFilter("All")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === "All" && styles.filterChipTextActive,
                ]}
              >
                All · {units.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === "Evaluating" && styles.filterChipActive,
              ]}
              onPress={() => setFilter("Evaluating")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === "Evaluating" && styles.filterChipTextActive,
                ]}
              >
                Evaluating · {evaluatingCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === "Active" && styles.filterChipActive,
              ]}
              onPress={() => setFilter("Active")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === "Active" && styles.filterChipTextActive,
                ]}
              >
                Active · {activeCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === "Sold" && styles.filterChipActive,
              ]}
              onPress={() => setFilter("Sold")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === "Sold" && styles.filterChipTextActive,
                ]}
              >
                Sold · {soldCount}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Units List */}
          <ScrollView
            contentContainerStyle={styles.unitsListScroll}
            showsVerticalScrollIndicator={false}
          >
            {filteredUnits.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.unitCard}
                activeOpacity={0.88}
                onPress={() => onSelectUnit && onSelectUnit(item)}
              >
                <View style={styles.unitCardTop}>
                  <View style={styles.statusPill}>
                    <Clock size={12} color="#b45309" />
                    <Text style={styles.statusPillText}>Under Evaluation</Text>
                  </View>
                  <Text style={styles.unitSubmittedDate}>{item.submittedAt}</Text>
                </View>

                <View style={styles.unitCardBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.unitSocietyName}>{item.society}</Text>
                    <Text style={styles.unitTowerFlat}>
                      {item.tower} · Flat {item.flatNo}
                    </Text>
                    <Text style={styles.unitSpecs}>
                      {item.bhk} · {item.superArea} sq ft · {item.furnishing}
                    </Text>
                  </View>

                  <View style={styles.unitPriceCol}>
                    <Text style={styles.unitPriceVal}>{item.priceDisplay}</Text>
                    <View style={styles.viewDetailsRow}>
                      <Text style={styles.viewDetailsText}>View details</Text>
                      <ChevronRight size={14} color={COLORS.primaryLight} />
                    </View>
                  </View>
                </View>

                {/* CP Attribution badge */}
                <View style={styles.unitCardFooter}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <Text style={styles.attributionText}>
                    60-day client attribution active · 2% Commission protected
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredUnits.length === 0 && (
              <View style={styles.emptyFilterBox}>
                <Text style={styles.emptyFilterText}>No units match this filter.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

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
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#e9d5ff",
    marginTop: 2,
  },
  addUnitHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addUnitHeaderBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconBadgeLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  miniPlusCircle: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  howItWorksHeader: {
    marginBottom: 12,
  },
  howItWorksLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  stepsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    position: "relative",
  },
  stepNumberBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepTextGroup: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  ctaSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  activeContent: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterChipsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
  },
  filterChipActive: {
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.primaryLight,
    fontWeight: "700",
  },
  unitsListScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  unitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  unitCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400e",
  },
  unitSubmittedDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  unitCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  unitSocietyName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  unitTowerFlat: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  unitSpecs: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  unitPriceCol: {
    alignItems: "flex-end",
  },
  unitPriceVal: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.accentGreen,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryLight,
  },
  unitCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 6,
  },
  attributionText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "600",
  },
  emptyFilterBox: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyFilterText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
