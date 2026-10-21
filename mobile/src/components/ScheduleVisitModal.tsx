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
import { Calendar, X, KeyRound } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { PropertyItem, ScheduledVisit } from "../types";

interface Props {
  visible: boolean;
  property: PropertyItem | null;
  onClose: () => void;
  onConfirmVisit: (visit: ScheduledVisit) => void;
}

export const ScheduleVisitModal: React.FC<Props> = ({
  visible,
  property,
  onClose,
  onConfirmVisit,
}) => {
  const [clientName, setClientName] = useState("Vikram Malhotra");
  const [clientPhone, setClientPhone] = useState("+91 98765 43210");
  const [selectedSlot, setSelectedSlot] = useState("Today, 5:00 PM");

  if (!property) return null;

  const slots = property.available_slots || [
    "Today, 4:00 PM",
    "Today, 5:30 PM",
    "Tomorrow, 11:00 AM",
    "Tomorrow, 3:00 PM",
  ];

  const handleConfirm = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      Alert.alert("Missing Details", "Please provide the client name and mobile number.");
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newVisit: ScheduledVisit = {
      id: `vst-${Date.now()}`,
      property_id: property.id,
      property_title: `${property.society_name} - ${property.tower_unit}`,
      society_name: property.society_name,
      client_name: clientName,
      client_phone: clientPhone,
      date_time_display: selectedSlot,
      otp_code: randomOtp,
      otp_status: "PENDING",
    };

    onConfirmVisit(newVisit);
    onClose();

    Alert.alert(
      "Visit Booked! 🔑",
      `Your smart door lock OTP is: ${randomOtp}\nSlot: ${selectedSlot}\nAttribution: Client locked for 60 days.`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.badge}>
                <Calendar size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Schedule Property Visit</Text>
                <Text style={styles.subtitle}>{property.society_name} · {property.tower_unit}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* Slot Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Visit Time Slot</Text>
              <View style={styles.slotsRow}>
                {slots.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.slotPill,
                      selectedSlot === s && styles.slotPillActive,
                    ]}
                    onPress={() => setSelectedSlot(s)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selectedSlot === s && styles.slotTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Client Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Prospective Buyer Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Client full name"
                placeholderTextColor={COLORS.textMuted}
                value={clientName}
                onChangeText={setClientName}
              />
            </View>

            {/* Client Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Buyer Mobile Number (60-Day Lock)</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={clientPhone}
                onChangeText={setClientPhone}
              />
            </View>

            {/* Smart Lock Notice */}
            <View style={styles.noticeBox}>
              <KeyRound size={18} color={COLORS.primary} />
              <Text style={styles.noticeText}>
                A 6-digit door OTP will be generated instantly and valid during your chosen slot. No keys needed.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Confirm Visit & Generate OTP</Text>
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
    fontSize: 13,
    color: COLORS.textMuted,
  },
  form: {
    gap: 16,
    paddingBottom: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  slotPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  slotTextActive: {
    color: "#ffffff",
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
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#faf5ff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
