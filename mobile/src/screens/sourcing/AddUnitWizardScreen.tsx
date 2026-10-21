import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Search,
  Building2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Pencil,
  ShieldCheck,
  MapPin,
  X,
  FileText,
  Clock,
  Sparkles,
  Check,
} from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { searchSocieties, SocietyItem } from "../../services/societyService";

export interface SourcedUnitData {
  id: string;
  society: string;
  sublocality: string;
  tower: string;
  flatNo: string;
  bhk: string;
  toilets: string;
  extraRooms: string[];
  superArea: string;
  carpetArea: string;
  floor: string;
  totalFloors: string;
  furnishing: string;
  registrationType: string;
  priceNumeric: number;
  priceDisplay: string;
  photosCount: number;
  hasFloorPlan: boolean;
  status: "Evaluating" | "Active" | "Sold";
  submittedAt: string;
}

interface Props {
  onBack: () => void;
  onSubmitSuccess: (unit: SourcedUnitData) => void;
  onViewUnits: () => void;
}

export const AddUnitWizardScreen: React.FC<Props> = ({
  onBack,
  onSubmitSuccess,
  onViewUnits,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 is Confirmation

  // Step 1: Property Details
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSociety, setSelectedSociety] = useState<SocietyItem | null>(null);
  const [societyResults, setSocietyResults] = useState<SocietyItem[]>([]);
  const [isSearchingSocieties, setIsSearchingSocieties] = useState(false);
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);

  const [bhk, setBhk] = useState("3 BHK");
  const [toilets, setToilets] = useState("2");
  const [extraRooms, setExtraRooms] = useState<string[]>([]);
  const [tower, setTower] = useState("Tower 2");
  const [flatNo, setFlatNo] = useState("1204");
  const [superArea, setSuperArea] = useState("1450");
  const [carpetArea, setCarpetArea] = useState("1120");
  const [floor, setFloor] = useState("12");
  const [totalFloors, setTotalFloors] = useState("24");
  const [furnishing, setFurnishing] = useState("Semi-Furnished");
  const [registrationType, setRegistrationType] = useState("Sub-lease / Registry");
  const [expectedPrice, setExpectedPrice] = useState("11500000");

  // Step 2: Media
  const [photos, setPhotos] = useState<string[]>([
    "living_room.jpg",
    "master_bedroom.jpg",
    "kitchen_modular.jpg",
  ]);
  const [hasFloorPlan, setHasFloorPlan] = useState(true);
  const [ownerConsent, setOwnerConsent] = useState(true);

  // Step 3: Review & Terms
  const [maintenanceAmt, setMaintenanceAmt] = useState("3500");
  const [keyLocation, setKeyLocation] = useState("Lockbox at front door (Code: 4821)");
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Created unit result
  const [createdUnit, setCreatedUnit] = useState<SourcedUnitData | null>(null);

  // Live Society Search with Real Data + OpenStreetMap Fallback
  useEffect(() => {
    let active = true;
    const fetchSocieties = async () => {
      if (!searchQuery.trim()) {
        const res = await searchSocieties("");
        if (active) setSocietyResults(res.slice(0, 8));
        return;
      }
      setIsSearchingSocieties(true);
      try {
        const res = await searchSocieties(searchQuery);
        if (active) {
          setSocietyResults(res);
        }
      } catch (err) {
        // Fallback
      } finally {
        if (active) setIsSearchingSocieties(false);
      }
    };

    const timer = setTimeout(fetchSocieties, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Initial load
  useEffect(() => {
    searchSocieties("").then((res) => setSocietyResults(res.slice(0, 8)));
  }, []);

  const formatPriceDisplay = (amountStr: string) => {
    const num = parseFloat(amountStr) || 0;
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lac`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const toggleExtraRoom = (room: string) => {
    setExtraRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const handleStep1Continue = () => {
    if (!selectedSociety && !searchQuery.trim()) {
      Alert.alert("Society Required", "Please select or enter the residential society name.");
      return;
    }
    if (!flatNo.trim()) {
      Alert.alert("Flat Number Required", "Please enter the unit/flat number.");
      return;
    }
    if (!expectedPrice || parseFloat(expectedPrice) <= 0) {
      Alert.alert("Expected Price Required", "Please enter a valid expected price.");
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (photos.length < 3) {
      Alert.alert(
        "Photos Required",
        "Please attach at least 3 photos (living room, bedroom, kitchen) for physical verification."
      );
      return;
    }
    if (!ownerConsent) {
      Alert.alert("Owner Permission Required", "Please confirm that you have permission from the unit owner.");
      return;
    }
    setStep(3);
  };

  const handleSubmitUnit = () => {
    if (!agreedTerms) {
      Alert.alert("Agreement Required", "Please accept the Aashrayo Channel Partner Terms.");
      return;
    }

    const socName = selectedSociety ? selectedSociety.name : searchQuery.trim() || "Express Astra";
    const subloc = selectedSociety ? selectedSociety.sublocality : "Sector 1, Greater Noida West";

    const newUnit: SourcedUnitData = {
      id: `UNT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      society: socName,
      sublocality: subloc,
      tower: tower.trim() || "Tower 2",
      flatNo: flatNo.trim() || "1204",
      bhk,
      toilets,
      extraRooms,
      superArea: superArea.trim() || "1450",
      carpetArea: carpetArea.trim() || "1120",
      floor: floor.trim() || "12",
      totalFloors: totalFloors.trim() || "24",
      furnishing,
      registrationType,
      priceNumeric: parseFloat(expectedPrice) || 11500000,
      priceDisplay: formatPriceDisplay(expectedPrice),
      photosCount: photos.length,
      hasFloorPlan,
      status: "Evaluating",
      submittedAt: "Today, Just now",
    };

    setCreatedUnit(newUnit);
    onSubmitSuccess(newUnit);
    setStep(4);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => {
            if (step === 1) onBack();
            else if (step === 2) setStep(1);
            else if (step === 3) setStep(2);
            else onViewUnits();
          }}
        >
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 4 ? "Unit Submitted" : "Add unit"}
        </Text>
      </View>

      {/* Progress Stepper (Steps 1 to 3) */}
      {step < 4 && (
        <View style={styles.stepperWrap}>
          <View style={styles.stepperRow}>
            <Text style={styles.stepLabel}>
              {step === 1
                ? "Step 1 of 3 · Property details"
                : step === 2
                ? "Step 2 of 3 · Media & photos"
                : "Step 3 of 3 · Review & confirm"}
            </Text>
            <Text style={styles.stepPercent}>
              {step === 1 ? "33%" : step === 2 ? "66%" : "100%"}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" },
              ]}
            />
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: PROPERTY DETAILS                                                 */}
      {/* ========================================================================= */}
      {step === 1 && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Society Search & Selection with OSM Fallback */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Society <Text style={styles.reqStar}>*</Text>
            </Text>
            <View style={styles.searchBarBox}>
              <Search size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Search and select society..."
                placeholderTextColor="#9ca3af"
                value={selectedSociety ? selectedSociety.name : searchQuery}
                onChangeText={(text) => {
                  setSelectedSociety(null);
                  setSearchQuery(text);
                  setShowSocietyDropdown(true);
                }}
                onFocus={() => setShowSocietyDropdown(true)}
              />
              {isSearchingSocieties && (
                <ActivityIndicator size="small" color={COLORS.primaryLight} />
              )}
              {(searchQuery || selectedSociety) && !isSearchingSocieties && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSociety(null);
                    setSearchQuery("");
                  }}
                >
                  <X size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Society Suggestions Dropdown */}
            {showSocietyDropdown && (
              <View style={styles.dropdownList}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownHeaderText}>
                    {searchQuery.length >= 3
                      ? "Real data + OpenStreetMap locations"
                      : "Popular NCR Societies"}
                  </Text>
                </View>
                {societyResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedSociety(item);
                      setSearchQuery(item.name);
                      setShowSocietyDropdown(false);
                    }}
                  >
                    <Building2 size={16} color={COLORS.primaryLight} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.dropdownItemName}>{item.name}</Text>
                      <Text style={styles.dropdownItemSub}>{item.fullAddress}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Configuration (BHK) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Configuration <Text style={styles.reqStar}>*</Text>
            </Text>
            <View style={styles.chipRow}>
              {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, bhk === item && styles.chipActive]}
                  onPress={() => setBhk(item)}
                >
                  <Text
                    style={[styles.chipText, bhk === item && styles.chipTextActive]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Number of toilets */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Number of toilets <Text style={styles.reqStar}>*</Text>
            </Text>
            <View style={styles.chipRow}>
              {["1", "2", "3", "4", "5"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chipNumber, toilets === item && styles.chipActive]}
                  onPress={() => setToilets(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      toilets === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Extra rooms (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Extra rooms (Optional)</Text>
            <View style={styles.chipRow}>
              {["Servant Room", "Study Room", "Pooja Room", "Store Room"].map(
                (item) => {
                  const isSelected = extraRooms.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleExtraRoom(item)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          {/* Tower & Flat Number (2 column) */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>
                Tower / Block <Text style={styles.reqStar}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={tower}
                onChangeText={setTower}
                placeholder="e.g. Tower 2"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>
                Flat number <Text style={styles.reqStar}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={flatNo}
                onChangeText={setFlatNo}
                placeholder="e.g. 1204"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Super & Carpet Area (2 column) */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Super area (sq ft)</Text>
              <TextInput
                style={styles.textInput}
                value={superArea}
                onChangeText={setSuperArea}
                placeholder="1450"
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Carpet area (sq ft)</Text>
              <TextInput
                style={styles.textInput}
                value={carpetArea}
                onChangeText={setCarpetArea}
                placeholder="1120"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Floor & Total Floors (2 column) */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Floor number</Text>
              <TextInput
                style={styles.textInput}
                value={floor}
                onChangeText={setFloor}
                placeholder="12"
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Total floors</Text>
              <TextInput
                style={styles.textInput}
                value={totalFloors}
                onChangeText={setTotalFloors}
                placeholder="24"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Furnishing Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Furnishing status</Text>
            <View style={styles.chipRow}>
              {["Unfurnished", "Semi-Furnished", "Fully Furnished"].map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      furnishing === item && styles.chipActive,
                    ]}
                    onPress={() => setFurnishing(item)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        furnishing === item && styles.chipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Unit registration type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Unit registration type</Text>
            <View style={styles.chipRow}>
              {[
                "Power of Attorney",
                "Sub-lease / Registry",
                "Agreement to Sale",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    registrationType === item && styles.chipActive,
                  ]}
                  onPress={() => setRegistrationType(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      registrationType === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Expected price with Live ₹ Lakhs/Crores Chip */}
          <View style={styles.inputGroup}>
            <View style={styles.priceHeaderRow}>
              <Text style={styles.inputLabel}>
                Expected price (₹) <Text style={styles.reqStar}>*</Text>
              </Text>
              <View style={styles.livePriceChip}>
                <Sparkles size={13} color={COLORS.primaryLight} />
                <Text style={styles.livePriceText}>
                  {formatPriceDisplay(expectedPrice)}
                </Text>
              </View>
            </View>
            <TextInput
              style={styles.textInput}
              value={expectedPrice}
              onChangeText={setExpectedPrice}
              placeholder="e.g. 11500000"
              keyboardType="number-pad"
            />
          </View>

          {/* Continue CTA */}
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            activeOpacity={0.85}
            onPress={handleStep1Continue}
          >
            <Text style={styles.primaryCtaText}>Continue to Media</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MEDIA & PHOTOS                                                   */}
      {/* ========================================================================= */}
      {step === 2 && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tip Banner */}
          <View style={styles.tipBanner}>
            <Sparkles size={20} color={COLORS.primaryLight} />
            <Text style={styles.tipText}>
              Clear photos of living room, kitchen, and bedrooms speed up physical verification by 2x.
            </Text>
          </View>

          {/* Upload Photos Zone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Unit Photos (Min 3 required) <Text style={styles.reqStar}>*</Text>
            </Text>

            <TouchableOpacity
              style={styles.uploadDropzone}
              activeOpacity={0.8}
              onPress={() => {
                const nextNum = photos.length + 1;
                setPhotos([...photos, `room_photo_${nextNum}.jpg`]);
                Alert.alert("Photo Attached", `room_photo_${nextNum}.jpg attached.`);
              }}
            >
              <Upload size={32} color={COLORS.primaryLight} />
              <Text style={styles.uploadMainText}>Tap to add unit photos</Text>
              <Text style={styles.uploadSubText}>
                Living room · Master bedroom · Kitchen · Balcony
              </Text>
            </TouchableOpacity>

            {/* Thumbnail list */}
            <View style={styles.thumbnailRow}>
              {photos.map((item, idx) => (
                <View key={idx} style={styles.thumbnailBadge}>
                  <ImageIcon size={14} color={COLORS.primaryLight} />
                  <Text style={styles.thumbnailName} numberOfLines={1}>
                    {item}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  >
                    <X size={14} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Floor Plan Checkbox */}
          <TouchableOpacity
            style={styles.consentRow}
            activeOpacity={0.8}
            onPress={() => setHasFloorPlan(!hasFloorPlan)}
          >
            <View style={[styles.checkbox, hasFloorPlan && styles.checkboxChecked]}>
              {hasFloorPlan && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={styles.consentText}>
              Floor plan or layout map is available for this unit.
            </Text>
          </TouchableOpacity>

          {/* Owner Consent Checkbox */}
          <TouchableOpacity
            style={styles.consentRow}
            activeOpacity={0.8}
            onPress={() => setOwnerConsent(!ownerConsent)}
          >
            <View style={[styles.checkbox, ownerConsent && styles.checkboxChecked]}>
              {ownerConsent && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={styles.consentText}>
              I confirm that I have direct permission from the owner to market this unit on Aashrayo.
            </Text>
          </TouchableOpacity>

          {/* Continue CTA */}
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            activeOpacity={0.85}
            onPress={handleStep2Continue}
          >
            <Text style={styles.primaryCtaText}>Continue to Review</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: REVIEW & SUMMARY                                                 */}
      {/* ========================================================================= */}
      {step === 3 && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card 1: Property Details */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Property details</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setStep(1)}
              >
                <Pencil size={15} color={COLORS.primaryLight} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Society</Text>
              <Text style={styles.summaryVal}>
                {selectedSociety ? selectedSociety.name : searchQuery || "Express Astra"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Tower & Flat</Text>
              <Text style={styles.summaryVal}>{tower} · Flat {flatNo}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Configuration</Text>
              <Text style={styles.summaryVal}>{bhk} · {toilets} Toilets</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Super / Carpet Area</Text>
              <Text style={styles.summaryVal}>{superArea} / {carpetArea} sq ft</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Floor</Text>
              <Text style={styles.summaryVal}>{floor} of {totalFloors}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Furnishing</Text>
              <Text style={styles.summaryVal}>{furnishing}</Text>
            </View>

            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryKey}>Expected Price</Text>
              <Text style={[styles.summaryVal, { color: COLORS.accentGreen, fontWeight: "700" }]}>
                {formatPriceDisplay(expectedPrice)}
              </Text>
            </View>
          </View>

          {/* Summary Card 2: Media */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Media & documents</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setStep(2)}
              >
                <Pencil size={15} color={COLORS.primaryLight} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Photos uploaded</Text>
              <Text style={styles.summaryVal}>{photos.length} photos</Text>
            </View>

            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryKey}>Floor plan</Text>
              <Text style={styles.summaryVal}>
                {hasFloorPlan ? "Attached" : "Not attached"}
              </Text>
            </View>
          </View>

          {/* Optional Details: Maintenance & Key */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Monthly Maintenance (₹/mo)</Text>
            <TextInput
              style={styles.textInput}
              value={maintenanceAmt}
              onChangeText={setMaintenanceAmt}
              placeholder="e.g. 3500"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Key Location / Access</Text>
            <TextInput
              style={styles.textInput}
              value={keyLocation}
              onChangeText={setKeyLocation}
              placeholder="e.g. Lockbox at door / with security"
            />
          </View>

          {/* CP Policy Agreement Checkbox */}
          <TouchableOpacity
            style={styles.consentRow}
            activeOpacity={0.8}
            onPress={() => setAgreedTerms(!agreedTerms)}
          >
            <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
              {agreedTerms && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={styles.consentText}>
              I agree to Aashrayo Channel Partner Terms & Conditions and 60-day client attribution policy.
            </Text>
          </TouchableOpacity>

          {/* Submit Unit CTA */}
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            activeOpacity={0.85}
            onPress={handleSubmitUnit}
          >
            <Text style={styles.primaryCtaText}>Submit Unit for Verification</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SUBMISSION CONFIRMATION                                          */}
      {/* ========================================================================= */}
      {step === 4 && (
        <ScrollView
          contentContainerStyle={styles.confirmationContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Big Green Check Circle */}
          <View style={styles.confirmCheckCircle}>
            <CheckCircle2 size={54} color="#16a34a" />
          </View>

          <Text style={styles.confirmTitle}>Unit Submitted Successfully!</Text>
          <Text style={styles.confirmSubtitle}>
            Your resale unit has been queued for physical inspection.
          </Text>

          {/* Unit ID Badge */}
          <View style={styles.unitIdBadge}>
            <Text style={styles.unitIdLabel}>UNIT ID</Text>
            <Text style={styles.unitIdValue}>
              {createdUnit ? createdUnit.id : "UNT-2026-1204"}
            </Text>
          </View>

          {/* What happens next box */}
          <View style={styles.nextStepsBox}>
            <Text style={styles.nextStepsHeader}>What happens next?</Text>

            <View style={styles.stepPointRow}>
              <View style={styles.stepNumberDot}>
                <Text style={styles.stepNumberDotText}>1</Text>
              </View>
              <Text style={styles.stepPointText}>
                Aashrayo Field Executive will be assigned within 2 hours.
              </Text>
            </View>

            <View style={styles.stepPointRow}>
              <View style={styles.stepNumberDot}>
                <Text style={styles.stepNumberDotText}>2</Text>
              </View>
              <Text style={styles.stepPointText}>
                Physical inspection & photography will be completed in 24 hours.
              </Text>
            </View>

            <View style={styles.stepPointRow}>
              <View style={styles.stepNumberDot}>
                <Text style={styles.stepNumberDotText}>3</Text>
              </View>
              <Text style={styles.stepPointText}>
                Real-time WhatsApp updates will be sent to your registered phone.
              </Text>
            </View>
          </View>

          {/* 60-Day Policy Protection Notice */}
          <View style={styles.protectionCard}>
            <ShieldCheck size={22} color={COLORS.primaryLight} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.protectionTitle}>60-Day Policy Protection</Text>
              <Text style={styles.protectionBody}>
                This unit is exclusively attributed to your partner code for 60 days. Any buyer inquiry closed through Aashrayo guarantees your 2% commission.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.primaryCtaBtn}
            activeOpacity={0.85}
            onPress={onViewUnits}
          >
            <Text style={styles.primaryCtaText}>View my units</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryOutlineBtn}
            activeOpacity={0.85}
            onPress={() => {
              setStep(1);
              setSelectedSociety(null);
              setSearchQuery("");
            }}
          >
            <Text style={styles.secondaryOutlineText}>Add another unit</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepperWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#faf5ff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3e8ff",
  },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryLight,
  },
  stepPercent: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#e9d5ff",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  reqStar: {
    color: "#ef4444",
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    maxHeight: 220,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dropdownHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  dropdownItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  dropdownItemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
  },
  chipNumber: {
    width: 44,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
  },
  chipActive: {
    backgroundColor: "#faf5ff",
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primaryLight,
    fontWeight: "700",
  },
  twoColRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  priceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  livePriceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf5ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  livePriceText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  tipBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: "#f3e8ff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  uploadDropzone: {
    backgroundColor: "#fcfaff",
    borderWidth: 1.5,
    borderColor: "#d8b4fe",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryLight,
    marginTop: 10,
  },
  uploadSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  thumbnailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  thumbnailBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  thumbnailName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    maxWidth: 120,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryLight,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  summaryKey: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  primaryCtaBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryCtaText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  confirmationContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: "center",
  },
  confirmCheckCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  confirmSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  unitIdBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  unitIdLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  unitIdValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryLight,
  },
  nextStepsBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  nextStepsHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  stepPointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepNumberDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepNumberDotText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  stepPointText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  protectionCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: "#f3e8ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  protectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryLight,
    marginBottom: 4,
  },
  protectionBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  secondaryOutlineBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  secondaryOutlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
});
