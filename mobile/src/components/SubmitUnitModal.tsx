import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Building2, X, ChevronRight, Check } from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const SubmitUnitModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmitSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [society, setSociety] = useState("Gaur City 2 - 14th Avenue");
  const [tower, setTower] = useState("Tower G");
  const [unit, setUnit] = useState("1204");
  const [bhk, setBhk] = useState<"2 BHK" | "3 BHK" | "4 BHK">("3 BHK");
  const [superArea, setSuperArea] = useState("1450");
  const [price, setPrice] = useState("8500000");

  const handleSubmit = () => {
    onSubmitSuccess();
    onClose();
    Alert.alert(
      "Resale Unit Submitted! 🏢",
      `Your unit in "${society}" has been submitted for Proho appraisal. An evaluation offer will be prepared within 48 hours.`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.badge}>
                <Building2 size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Submit Resale Unit</Text>
                <Text style={styles.subtitle}>Step {step} of 3 · Sourcing Flow</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {step === 1 && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Society / Project Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Gaur City 2"
                    placeholderTextColor={COLORS.textMuted}
                    value={society}
                    onChangeText={setSociety}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Tower / Block</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tower G"
                      placeholderTextColor={COLORS.textMuted}
                      value={tower}
                      onChangeText={setTower}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Unit / Flat Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1204"
                      placeholderTextColor={COLORS.textMuted}
                      value={unit}
                      onChangeText={setUnit}
                    />
                  </View>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>BHK Configuration</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {(["2 BHK", "3 BHK", "4 BHK"] as const).map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[styles.bhkChip, bhk === b && styles.bhkChipActive]}
                        onPress={() => setBhk(b)}
                      >
                        <Text style={[styles.bhkChipText, bhk === b && styles.bhkChipTextActive]}>
                          {b}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Super Area (Sq.Ft)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1450"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    value={superArea}
                    onChangeText={setSuperArea}
                  />
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Owner Expected Price (INR)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="8500000"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>

                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Summary</Text>
                  <Text style={styles.previewText}>{society} ({tower} - {unit})</Text>
                  <Text style={styles.previewText}>{bhk} · {superArea} sqft</Text>
                  <Text style={[styles.previewText, { fontWeight: "800", color: COLORS.primary }]}>
                    Expected: ₹{(parseFloat(price) / 100000).toFixed(1)} Lakhs
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footerRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : null}

            {step < 3 ? (
              <TouchableOpacity
                style={[styles.nextBtn, { flex: 1 }]}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.nextBtnText}>Next Step</Text>
                <ChevronRight size={18} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, { flex: 1 }]}
                onPress={handleSubmit}
              >
                <Text style={styles.nextBtnText}>Submit Unit</Text>
                <Check size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  form: {
    gap: 16,
    paddingBottom: 20,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  bhkChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  bhkChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bhkChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  bhkChipTextActive: {
    color: "#ffffff",
  },
  previewBox: {
    backgroundColor: "#faf5ff",
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    gap: 12,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
