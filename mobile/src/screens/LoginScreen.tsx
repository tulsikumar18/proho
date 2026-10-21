import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants/theme";

interface Props {
  onSuccessLogin: (phone: string) => void;
}

export const LoginScreen: React.FC<Props> = ({ onSuccessLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState("9876543210");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (otpStep) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpStep]);

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      setOtpStep(true);
    }
  };

  const handleVerifyOtp = () => {
    onSuccessLogin("+91 " + phoneNumber);
  };

  const handleOtpChange = (val: string, index: number) => {
    // Handle pasting multi-digit code (e.g. 6-digit SMS code)
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    // If backspacing an empty box, move focus to previous box
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Logo Badge */}
          <View style={styles.logoBadge}>
            <View style={styles.logoRoof} />
            <View style={styles.logoBase} />
            <Text style={styles.logoText}>PROHO</Text>
          </View>
          <Text style={styles.subBrand}>Channel Partner App</Text>

          {!otpStep ? (
            <>
              <Text style={styles.heading}>Login or sign up</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number — we will send a 6-digit OTP to verify.
              </Text>

              {/* Input Row */}
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <View style={styles.numberInputBox}>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholder="Enter phone number"
                    placeholderTextColor={COLORS.textMuted}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  phoneNumber.length >= 10
                    ? styles.continueButtonActive
                    : styles.continueButtonDisabled,
                ]}
                disabled={phoneNumber.length < 10}
                onPress={handleSendOtp}
                activeOpacity={0.85}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Verify OTP</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit verification code sent to +91 {phoneNumber}
              </Text>

              {/* 6-box OTP Input */}
              <View style={styles.otpRow}>
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <TextInput
                    key={idx}
                    ref={(ref) => {
                      inputRefs.current[idx] = ref;
                    }}
                    style={styles.otpBox}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[idx]}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.continueButton, styles.continueButtonActive, { marginTop: 28 }]}
                onPress={handleVerifyOtp}
                activeOpacity={0.85}
              >
                <Text style={styles.continueButtonText}>Verify & Proceed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20, alignSelf: "center" }}
                onPress={() => setOtpStep(false)}
              >
                <Text style={{ color: COLORS.primaryLight, fontWeight: "600", fontSize: 14 }}>
                  Change Mobile Number
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer Disclaimer */}
        <View style={styles.footer}>
          <Text style={styles.disclaimerText}>
            By continuing you agree to Proho's{" "}
            <Text style={styles.disclaimerLink}>Terms</Text> &{" "}
            <Text style={styles.disclaimerLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 50,
  },
  logoBadge: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoRoof: {
    width: 20,
    height: 16,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ffffff",
    marginBottom: 2,
  },
  logoBase: {
    width: 24,
    height: 20,
    backgroundColor: "#ffffff",
    borderRadius: 3,
    marginBottom: 3,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  subBrand: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 44,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 32,
    alignSelf: "flex-start",
  },
  phoneInputRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  countryCodeBox: {
    width: 76,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  countryCodeText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  numberInputBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  numberInput: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  continueButton: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  continueButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 16,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  disclaimerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  disclaimerLink: {
    color: COLORS.primaryLight,
    fontWeight: "600",
  },
});
