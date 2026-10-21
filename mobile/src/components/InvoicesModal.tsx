import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FileCheck2, X, CheckCircle2 } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { InvoiceItem } from "../types";

interface Props {
  visible: boolean;
  invoices: InvoiceItem[];
  onClose: () => void;
}

export const InvoicesModal: React.FC<Props> = ({ visible, invoices, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.badge}>
                <FileCheck2 size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Tax Invoices & Statements</Text>
                <Text style={styles.subtitle}>Section 194H TDS compliant</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {invoices.map((inv) => (
              <View key={inv.id} style={styles.invoiceCard}>
                <View style={styles.invHeaderRow}>
                  <Text style={styles.invNumber}>{inv.invoice_number}</Text>
                  <View style={styles.statusBadge}>
                    <CheckCircle2 size={12} color="#15803d" />
                    <Text style={styles.statusBadgeText}>{inv.status}</Text>
                  </View>
                </View>

                <Text style={styles.propertyTitle}>{inv.property_title}</Text>
                <Text style={styles.dateText}>{inv.date}</Text>

                <View style={styles.breakdownBox}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Agreement Value:</Text>
                    <Text style={styles.breakdownVal}>{inv.deal_value}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Gross Commission (2%):</Text>
                    <Text style={styles.breakdownVal}>{inv.gross_commission}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>TDS Deducted (5% Sec 194H):</Text>
                    <Text style={[styles.breakdownVal, { color: "#ef4444" }]}>-{inv.tds_deduction}</Text>
                  </View>
                  <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 6, marginTop: 4 }]}>
                    <Text style={[styles.breakdownLabel, { fontWeight: "800", color: COLORS.textPrimary }]}>Net Paid to Bank:</Text>
                    <Text style={[styles.breakdownVal, { fontWeight: "800", color: COLORS.accentGreen, fontSize: 16 }]}>
                      {inv.net_paid}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
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
  list: {
    gap: 16,
    paddingBottom: 24,
  },
  invoiceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  invHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  invNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  breakdownBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
});
