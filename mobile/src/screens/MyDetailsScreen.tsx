import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Camera,
  User as UserIcon,
  ChevronRight,
  Pencil,
  FileText,
  Upload,
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { PartnerProfile } from "../types";
import { SupportFab } from "../components/SupportFab";
import { submitKycToAdmin } from "../services/api";

interface Props {
  profile: PartnerProfile;
  onBack: () => void;
  onUpdateProfile?: (updated: Partial<PartnerProfile>) => void;
}

export const MyDetailsScreen: React.FC<Props> = ({ profile, onBack, onUpdateProfile }) => {
  const [profileType, setProfileType] = useState("Individual");
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const [firstName, setFirstName] = useState(profile.user.first_name || "Kritaank");
  const [lastName, setLastName] = useState(profile.user.last_name || "Krishna");
  const [showEditNameModal, setShowEditNameModal] = useState(false);

  // KYC States
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);
  const [panUploaded, setPanUploaded] = useState(false);
  const [chequeUploaded, setChequeUploaded] = useState(false);

  const [activeUploadDoc, setActiveUploadDoc] = useState<"aadhaar" | "pan" | "cheque" | null>(null);
  const [panNumberInput, setPanNumberInput] = useState("");
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [bankAccInput, setBankAccInput] = useState("");
  const [ifscInput, setIfscInput] = useState("");

  const maskedPhone = profile.user.phone
    ? profile.user.phone.replace(/(\+91\s?)?(\d{5})\d{2}(\d{3})/, "$2xx $3")
    : "80735xx 6342";

  const handleUploadConfirm = () => {
    if (activeUploadDoc === "aadhaar") {
      setAadhaarUploaded(true);
      Alert.alert("Aadhaar Uploaded", "Front and back photos have been attached successfully.");
    } else if (activeUploadDoc === "pan") {
      setPanUploaded(true);
      Alert.alert("PAN Card Uploaded", `PAN ${panNumberInput} attached successfully.`);
    } else if (activeUploadDoc === "cheque") {
      setChequeUploaded(true);
      Alert.alert("Cancelled Cheque Uploaded", "Bank details attached successfully.");
    }
    setActiveUploadDoc(null);

    // Sync submission with Admin Dashboard & Backend
    submitKycToAdmin({
      partner_name: `${firstName} ${lastName}`.trim(),
      partner_phone: profile.user.phone || "+91 8073526342",
      pan_number: panNumberInput,
      aadhaar_last_four: aadhaarInput,
      bank_account: bankAccInput,
      agency_name: profileType,
    });

    if (onUpdateProfile) {
      onUpdateProfile({ kyc_status: "PENDING" });
    }

    // If all three uploaded, notify partner
    if (
      (activeUploadDoc === "aadhaar" && panUploaded && chequeUploaded) ||
      (activeUploadDoc === "pan" && aadhaarUploaded && chequeUploaded) ||
      (activeUploadDoc === "cheque" && aadhaarUploaded && panUploaded)
    ) {
      Alert.alert(
        "KYC Submitted to Operations",
        "Your documents have been submitted to Aashrayo Operations for review and will reflect on the Admin Dashboard."
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to delete your Aashrayo Partner account? This permanently removes your account, leads, and earnings history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your account has been deleted.");
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBack}
        >
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Hero Banner with Avatar */}
        <View style={styles.heroBanner}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {firstName.charAt(0).toUpperCase() || "K"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Profile Photo", "Choose photo from gallery or take a new picture.")}
            >
              <Camera size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroTextGroup}>
            <Text style={styles.heroName}>
              {firstName} {lastName}
            </Text>
            <Text style={styles.heroPhone}>{maskedPhone}</Text>
          </View>
        </View>

        {/* Section: REGISTERED AS */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>REGISTERED AS</Text>
          <View style={styles.card}>
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#f3e8ff" }]}>
                  <UserIcon size={20} color={COLORS.primaryLight} />
                </View>
                <View>
                  <Text style={styles.rowSub}>Profile type</Text>
                  <Text style={styles.rowMain}>{profileType}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeBtn}
                activeOpacity={0.7}
                onPress={() =>
                  Alert.alert("Change Profile Type", "Select business type", [
                    { text: "Individual", onPress: () => setProfileType("Individual") },
                    { text: "Proprietorship", onPress: () => setProfileType("Proprietorship") },
                    { text: "Private Limited", onPress: () => setProfileType("Private Limited") },
                    { text: "Cancel", style: "cancel" },
                  ])
                }
              >
                <Text style={styles.changeText}>Change</Text>
                <ChevronRight size={16} color={COLORS.primaryLight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section: YOUR CONTACT */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>YOUR CONTACT</Text>
          <View style={styles.card}>
            <View style={styles.rowItem}>
              <View>
                <Text style={styles.rowSub}>Mobile number</Text>
                <Text style={styles.rowMain}>{maskedPhone}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={13} color="#16a34a" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowItem}>
              <View>
                <Text style={styles.rowSub}>Email</Text>
                <Text style={[styles.rowMain, !email && { color: COLORS.textMuted }]}>
                  {email || "Not added"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.actionLink}
                activeOpacity={0.7}
                onPress={() => {
                  setEmailInput(email);
                  setShowEmailModal(true);
                }}
              >
                <Text style={styles.actionLinkText}>{email ? "Edit" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section: YOUR DETAILS */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>YOUR DETAILS</Text>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => setShowEditNameModal(true)}
            >
              <Pencil size={14} color={COLORS.primaryLight} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.rowItem}>
              <View>
                <Text style={styles.rowSub}>First name</Text>
                <Text style={styles.rowMain}>{firstName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowItem}>
              <View>
                <Text style={styles.rowSub}>Last name</Text>
                <Text style={styles.rowMain}>{lastName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: KYC 1 · IDENTITY */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>KYC 1 · IDENTITY</Text>
            <Text style={styles.statusBadgeText}>
              {aadhaarUploaded ? "Submitted" : "Pending"}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.docRow}>
              <View style={[styles.iconBox, { backgroundColor: "#f3f4f6" }]}>
                <FileText size={20} color={COLORS.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.docTitle}>Aadhaar card</Text>
                  <View style={[styles.reqTag, aadhaarUploaded && { backgroundColor: "#dcfce7" }]}>
                    <Text style={[styles.reqTagText, aadhaarUploaded && { color: "#16a34a" }]}>
                      {aadhaarUploaded ? "Uploaded" : "Required"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.docSubtitle}>Upload front & back photo</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.outlineUploadBtn, aadhaarUploaded && styles.outlineUploadBtnDone]}
              activeOpacity={0.8}
              onPress={() => setActiveUploadDoc("aadhaar")}
            >
              <Upload size={16} color={aadhaarUploaded ? "#16a34a" : COLORS.primaryLight} />
              <Text style={[styles.outlineUploadText, aadhaarUploaded && { color: "#16a34a" }]}>
                {aadhaarUploaded ? "Re-upload Aadhaar" : "Upload Aadhaar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: KYC 2 · FINANCIAL */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>KYC 2 · FINANCIAL</Text>
            <Text style={styles.statusBadgeText}>
              {panUploaded && chequeUploaded ? "Submitted" : "Pending"}
            </Text>
          </View>

          <View style={styles.card}>
            {/* PAN Card */}
            <View style={styles.docRow}>
              <View style={[styles.iconBox, { backgroundColor: "#f3f4f6" }]}>
                <FileText size={20} color={COLORS.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.docTitle}>PAN card</Text>
                  <View style={[styles.reqTag, panUploaded && { backgroundColor: "#dcfce7" }]}>
                    <Text style={[styles.reqTagText, panUploaded && { color: "#16a34a" }]}>
                      {panUploaded ? "Uploaded" : "Required"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.docSubtitle}>Upload a clear photo</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.outlineUploadBtn, panUploaded && styles.outlineUploadBtnDone]}
              activeOpacity={0.8}
              onPress={() => setActiveUploadDoc("pan")}
            >
              <Upload size={16} color={panUploaded ? "#16a34a" : COLORS.primaryLight} />
              <Text style={[styles.outlineUploadText, panUploaded && { color: "#16a34a" }]}>
                {panUploaded ? "Re-upload PAN" : "Upload PAN"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Bank Account */}
            <View style={styles.docRow}>
              <View style={[styles.iconBox, { backgroundColor: "#f3f4f6" }]}>
                <FileText size={20} color={COLORS.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.docTitle}>Bank account</Text>
                  <View style={[styles.reqTag, chequeUploaded && { backgroundColor: "#dcfce7" }]}>
                    <Text style={[styles.reqTagText, chequeUploaded && { color: "#16a34a" }]}>
                      {chequeUploaded ? "Uploaded" : "Required"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.docSubtitle}>Upload a cancelled cheque</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.outlineUploadBtn, chequeUploaded && styles.outlineUploadBtnDone]}
              activeOpacity={0.8}
              onPress={() => setActiveUploadDoc("cheque")}
            >
              <Upload size={16} color={chequeUploaded ? "#16a34a" : COLORS.primaryLight} />
              <Text style={[styles.outlineUploadText, chequeUploaded && { color: "#16a34a" }]}>
                {chequeUploaded ? "Re-upload cheque" : "Upload cheque"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: AASHRAYO PARTNER */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>AASHRAYO PARTNER</Text>
          <View style={styles.card}>
            <View style={styles.rowItem}>
              <View>
                <Text style={styles.rowSub}>Partner since</Text>
                <Text style={styles.rowMain}>Oct 2026</Text>
              </View>
              <Lock size={18} color={COLORS.textMuted} />
            </View>
          </View>
        </View>

        {/* Security Callout */}
        <View style={styles.securityBox}>
          <ShieldCheck size={20} color={COLORS.primaryLight} />
          <Text style={styles.securityText}>
            Your details are used only for verification and payouts.
          </Text>
        </View>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.8}
          onPress={handleDeleteAccount}
        >
          <Trash2 size={18} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Delete account</Text>
        </TouchableOpacity>
        <Text style={styles.deleteSubtitle}>
          This permanently removes your account and all your data.
        </Text>
      </ScrollView>

      {/* Upload Document Modal */}
      <Modal visible={!!activeUploadDoc} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalSheet}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>
                {activeUploadDoc === "aadhaar"
                  ? "Upload Aadhaar Card"
                  : activeUploadDoc === "pan"
                  ? "Upload PAN Card"
                  : "Upload Bank Cheque"}
              </Text>
              <TouchableOpacity onPress={() => setActiveUploadDoc(null)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {activeUploadDoc === "pan" && (
              <View style={styles.modalFieldWrap}>
                <Text style={styles.modalFieldLabel}>10-Digit PAN Number</Text>
                <TextInput
                  style={styles.modalInput}
                  maxLength={10}
                  autoCapitalize="characters"
                  placeholder="e.g. ABCDE1234F"
                  placeholderTextColor={COLORS.textMuted}
                  value={panNumberInput}
                  onChangeText={setPanNumberInput}
                />
              </View>
            )}

            {activeUploadDoc === "aadhaar" && (
              <View style={styles.modalFieldWrap}>
                <Text style={styles.modalFieldLabel}>Last 4 Digits of Aadhaar</Text>
                <TextInput
                  style={styles.modalInput}
                  maxLength={4}
                  keyboardType="number-pad"
                  placeholder="e.g. 4321"
                  placeholderTextColor={COLORS.textMuted}
                  value={aadhaarInput}
                  onChangeText={setAadhaarInput}
                />
              </View>
            )}

            {activeUploadDoc === "cheque" && (
              <>
                <View style={styles.modalFieldWrap}>
                  <Text style={styles.modalFieldLabel}>Bank Account Number</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    placeholder="e.g. 123456789012"
                    placeholderTextColor={COLORS.textMuted}
                    value={bankAccInput}
                    onChangeText={setBankAccInput}
                  />
                </View>
                <View style={styles.modalFieldWrap}>
                  <Text style={styles.modalFieldLabel}>IFSC Code</Text>
                  <TextInput
                    style={styles.modalInput}
                    autoCapitalize="characters"
                    placeholder="e.g. HDFC0001234"
                    placeholderTextColor={COLORS.textMuted}
                    value={ifscInput}
                    onChangeText={setIfscInput}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.selectFileBox}
              activeOpacity={0.8}
              onPress={() => Alert.alert("Select File", "Camera / Gallery file attached: sample_doc.jpg")}
            >
              <Upload size={24} color={COLORS.primaryLight} />
              <Text style={styles.selectFileText}>Tap to choose document from gallery</Text>
              <Text style={styles.selectFileSub}>Supports JPG, PNG, PDF up to 5MB</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={handleUploadConfirm}
            >
              <Text style={styles.modalConfirmBtnText}>Attach & Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Email Modal */}
      <Modal visible={showEmailModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalSheet}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Add Email Address</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalFieldWrap}>
              <Text style={styles.modalFieldLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="partner@example.com"
                value={emailInput}
                onChangeText={setEmailInput}
              />
            </View>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={() => {
                setEmail(emailInput.trim());
                setShowEmailModal(false);
              }}
            >
              <Text style={styles.modalConfirmBtnText}>Save Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showEditNameModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalSheet}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Edit Name</Text>
              <TouchableOpacity onPress={() => setShowEditNameModal(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalFieldWrap}>
              <Text style={styles.modalFieldLabel}>First Name</Text>
              <TextInput
                style={styles.modalInput}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.modalFieldWrap}>
              <Text style={styles.modalFieldLabel}>Last Name</Text>
              <TextInput
                style={styles.modalInput}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={() => setShowEditNameModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Support Floating Action Button */}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroBanner: {
    backgroundColor: "#2e0854",
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextGroup: {
    gap: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroPhone: {
    fontSize: 14,
    color: "#e9d5ff",
    fontWeight: "500",
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rowSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  rowMain: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
  },
  actionLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 14,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  docSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  reqTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reqTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  outlineUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
  },
  outlineUploadBtnDone: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  outlineUploadText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f5f3ff",
    marginHorizontal: 16,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: "#5b21b6",
    fontWeight: "500",
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ef4444",
  },
  deleteSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  uploadModalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  uploadModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  uploadModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalFieldWrap: {
    gap: 6,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  modalInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  selectFileBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#faf5ff",
    gap: 6,
  },
  selectFileText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryLight,
  },
  selectFileSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalConfirmBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
