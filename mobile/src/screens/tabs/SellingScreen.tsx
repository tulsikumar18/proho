import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Search,
  SlidersHorizontal,
  Share2,
  Calendar,
  MapPin,
  Lock,
  User,
  Sparkles,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { PropertyItem } from "../../types";
import { SupportFab } from "../../components/SupportFab";

interface Props {
  properties: PropertyItem[];
  onSelectPropertyForVisit: (prop: PropertyItem) => void;
  onSelectPropertyForShare: (prop: PropertyItem) => void;
  onShareFullList: () => void;
}

export const SellingScreen: React.FC<Props> = ({
  properties,
  onSelectPropertyForVisit,
  onSelectPropertyForShare,
  onShareFullList,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredProperties = properties.filter((item) => {
    const matchesSearch =
      item.society_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bhk_type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "Instant visit") {
      return item.instant_visit;
    }
    if (activeFilter !== "ALL") {
      return item.bhk_type === activeFilter;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Selling</Text>
          <Text style={styles.headerSubtitle}>38 units available</Text>
        </View>

        <TouchableOpacity
          style={styles.shareListBtn}
          activeOpacity={0.85}
          onPress={onShareFullList}
        >
          <Share2 size={16} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.shareListText}>Share List</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoTagRow}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>2% COMMISSION</Text>
            </View>
            <View style={styles.festiveTag}>
              <Sparkles size={11} color="#ffffff" />
              <Text style={styles.festiveTagText}>IPHONE 17 + ₹10K EXTRA</Text>
            </View>
          </View>
          <Text style={styles.promoTitle}>NAVRATRI SALES DHAMAKA!</Text>
          <Text style={styles.promoSubtitle}>
            Special festive incentives on every closed resale deal.
          </Text>
        </View>

        {/* Search Bar & Filter Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search society, sector, BHK"
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <SlidersHorizontal size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Quick Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === "Instant visit" && styles.filterChipActive,
            ]}
            onPress={() =>
              setActiveFilter(activeFilter === "Instant visit" ? "ALL" : "Instant visit")
            }
          >
            <Lock
              size={13}
              color={activeFilter === "Instant visit" ? "#ffffff" : COLORS.primary}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === "Instant visit" && styles.filterChipTextActive,
              ]}
            >
              Instant visit
            </Text>
          </TouchableOpacity>

          {["2 BHK", "3 BHK", "4 BHK"].map((bhk) => (
            <TouchableOpacity
              key={bhk}
              style={[
                styles.filterChip,
                activeFilter === bhk && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(activeFilter === bhk ? "ALL" : bhk)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === bhk && styles.filterChipTextActive,
                ]}
              >
                {bhk}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Property Cards List */}
        <View style={styles.propertiesList}>
          {filteredProperties.map((prop) => (
            <View key={prop.id} style={styles.propertyCard}>
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: prop.image_url }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                />

                {/* Commission Incentive Badge */}
                <View style={styles.commissionBadge}>
                  <Text style={styles.commissionBadgeText}>
                    {prop.commission_tag}
                  </Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <Text style={styles.societyName}>{prop.society_name}</Text>

                <View style={styles.locationRow}>
                  <MapPin size={14} color={COLORS.textMuted} />
                  <Text style={styles.locationText}>{prop.sector_location}</Text>
                </View>

                {/* Specs Line */}
                <Text style={styles.specsLine}>
                  {prop.tower_unit} · {prop.bhk_type} · {prop.super_area_sqft} sqft
                </Text>

                {/* Tenancy / Instant Lock Tag */}
                <View style={styles.metaTagsRow}>
                  {prop.instant_visit ? (
                    <View style={styles.instantTag}>
                      <Lock size={12} color={COLORS.primary} />
                      <Text style={styles.instantTagText}>Instant visit</Text>
                    </View>
                  ) : (
                    <View style={styles.tenantedTag}>
                      <User size={12} color={COLORS.textSecondary} />
                      <Text style={styles.tenantedTagText}>{prop.tenancy_status}</Text>
                    </View>
                  )}
                </View>

                {/* Price Display */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceMain}>{prop.price_display}</Text>
                  <Text style={styles.pricePerSqft}> · {prop.rate_per_sqft_display}</Text>
                </View>

                {/* Action Buttons: Share & Visit */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    activeOpacity={0.8}
                    onPress={() => onSelectPropertyForShare(prop)}
                  >
                    <Share2 size={16} color={COLORS.textPrimary} />
                    <Text style={styles.cardActionText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cardActionBtn, styles.visitBtn]}
                    activeOpacity={0.8}
                    onPress={() => onSelectPropertyForVisit(prop)}
                  >
                    <Calendar size={16} color={COLORS.primary} />
                    <Text style={[styles.cardActionText, { color: COLORS.primary }]}>
                      Visit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e9d5ff",
    marginTop: 2,
  },
  shareListBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  shareListText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  promoBanner: {
    backgroundColor: "#2e0854",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  promoTagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  promoTag: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2e0854",
  },
  festiveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e11d48",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  festiveTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
    color: "#e9d5ff",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  propertiesList: {
    gap: 16,
  },
  propertyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  commissionBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  commissionBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803d",
  },
  cardBody: {
    padding: 16,
  },
  societyName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  specsLine: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  metaTagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  instantTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  instantTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  tenantedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tenantedTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  priceMain: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  pricePerSqft: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  visitBtn: {
    backgroundColor: "#faf5ff",
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});
