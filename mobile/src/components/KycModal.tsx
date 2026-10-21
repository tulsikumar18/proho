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
import { ShieldCheck, X, CheckCircle2, Upload } from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pan: string, aadhaarLast4: string, rera: string) => void;
}

export const KycModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [rera, setRera] = useState("");
  const [panUploaded, setPanUploaded] = useState(false);
  const [addressUploaded, setAddressUploaded] = useState(false);

  const handleSubmit = () => {
    if (pan.length !== 10) {
      Alert.alert("Invalid PAN", "Please enter a valid 10-character PAN number.");
      return;
    }
    if (aadhaar.length !== 4) {
      Alert.alert("Invalid Aadhaar", "Please enter the last 4 digits of your Aadhaar card.");
      return;
    }
    onSubmit(pan, aadhaar, rera);
    onClose();
    Alert.alert(
      "KYC Submitted",
      "Your documents have been submitted to Proho Operations for verification. Approvals typically take under 2 hours."
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.badge}>
                <ShieldCheck size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Partner KYC Verification</Text>
                <Text style={styles.subtitle}>Unlock unlimited visits & payouts</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* PAN Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Permanent Account Number (PAN)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ABCDE1234F"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                maxLength={10}
                value={pan}
                onChangeText={setPan}
              />
              <TouchableOpacity
                style={styles.uploadRow}
                onPress={() => setPanUploaded(!panUploaded)}
              >
                {panUploaded ? (
                  <CheckCircle2 size={16} color={COLORS.accentGreen} />
                ) : (
                  <Upload size={16} color={COLORS.primary} />
                )}
                <Text style={styles.uploadText}>
                  {panUploaded ? "pan_card_copy.pdf attached" : "Attach PAN Card (PDF/Image)"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Aadhaar Last 4 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Aadhaar Number (Last 4 Digits)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 4321"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={aadhaar}
                onChangeText={setAadhaar}
              />
              <TouchableOpacity
                style={styles.uploadRow}
                onPress={() => setAddressUploaded(!addressUploaded)}
              >
                {addressUploaded ? (
                  <CheckCircle2 size={16} color={COLORS.accentGreen} />
                ) : (
                  <Upload size={16} color={COLORS.primary} />
                )}
                <Text style={styles.uploadText}>
                  {addressUploaded ? "address_proof.pdf attached" : "Attach Address Proof (Aadhaar/Voter ID)"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* RERA Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>RERA Registration Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. UPRERAAGT12345"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                value={rera}
                onChangeText={setRera}
              />
            </View>
          </ScrollView>

          {/* Submit CTA */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>Submit KYC for Approval</Text>
          </TouchableOpacity>
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
    fontSize: 12,
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
    backgroundColor: "#ffffff",
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  uploadText: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
