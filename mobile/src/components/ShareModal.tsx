import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Share2, X, MessageCircle, FileText, Copy } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { PropertyItem } from "../types";

interface Props {
  visible: boolean;
  property: PropertyItem | null;
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ visible, property, onClose }) => {
  if (!property) return null;

  const referralToken = `ref_${property.id.slice(-6)}_${Date.now().toString().slice(-4)}`;
  const shareLink = `https://proho.in/p/${referralToken}`;

  const handleShareWhatsApp = () => {
    onClose();
    Alert.alert(
      "WhatsApp Referral Shared! 📲",
      `*${property.society_name}*\n${property.bhk_type} | ${property.super_area_sqft} sqft\nPrice: ${property.price_display}\n\nView details: ${shareLink}\n\n(Your 60-day client attribution is locked!)`
    );
  };

  const handleDownloadPdf = () => {
    onClose();
    Alert.alert(
      "Brochure PDF Generated! 📄",
      `Custom unbranded broker flyer with your contact details generated for "${property.society_name}".`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.badge}>
                <Share2 size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Share Property Listing</Text>
                <Text style={styles.subtitle}>{property.society_name} · 60-Day Lock</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.linkBox}>
            <Text style={styles.linkLabel}>Your Protected Referral Link</Text>
            <Text style={styles.linkUrl}>{shareLink}</Text>
          </View>

          <View style={styles.actionsList}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              activeOpacity={0.85}
              onPress={handleShareWhatsApp}
            >
              <MessageCircle size={20} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.whatsappBtnText}>Share via WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pdfBtn}
              activeOpacity={0.85}
              onPress={handleDownloadPdf}
            >
              <FileText size={20} color={COLORS.textPrimary} />
              <Text style={styles.pdfBtnText}>Download PDF Flyer</Text>
            </TouchableOpacity>
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
    paddingBottom: 36,
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
  linkBox: {
    backgroundColor: "#faf5ff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ede9fe",
    marginBottom: 20,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  actionsList: {
    gap: 12,
  },
  whatsappBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  whatsappBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  pdfBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  pdfBtnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
