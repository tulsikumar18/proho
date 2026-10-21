import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageSelectScreen } from "./src/screens/LanguageSelectScreen";
import { OnboardingCarouselScreen } from "./src/screens/OnboardingCarouselScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { NameSetupScreen } from "./src/screens/NameSetupScreen";
import { LocationSetupScreen } from "./src/screens/LocationSetupScreen";
import { HomeScreen } from "./src/screens/tabs/HomeScreen";
import { SourcingScreen } from "./src/screens/tabs/SourcingScreen";
import { SellingScreen } from "./src/screens/tabs/SellingScreen";
import { EarningsScreen } from "./src/screens/tabs/EarningsScreen";
import { MoreScreen } from "./src/screens/tabs/MoreScreen";
import { BottomTabBar, TabKey } from "./src/components/BottomTabBar";
import { KycModal } from "./src/components/KycModal";
import { ScheduleVisitModal } from "./src/components/ScheduleVisitModal";
import { SubmitUnitModal } from "./src/components/SubmitUnitModal";
import { ShareModal } from "./src/components/ShareModal";
import { InvoicesModal } from "./src/components/InvoicesModal";
import { MyDetailsScreen } from "./src/screens/MyDetailsScreen";
import { AddUnitWizardScreen, SourcedUnitData } from "./src/screens/sourcing/AddUnitWizardScreen";
import { SourcingUnitDetailScreen } from "./src/screens/sourcing/SourcingUnitDetailScreen";
import { sampleSourcedUnits } from "./src/screens/tabs/SourcingScreen";
import {
  initialPartnerProfile,
  sampleProperties,
  sampleInvoices,
} from "./src/services/api";
import { Language, PartnerProfile, PropertyItem, ScheduledVisit } from "./src/types";

type AppFlowStep = "language" | "onboarding" | "login" | "name" | "location" | "main";

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppFlowStep>("language");
  const [activeTab, setActiveTab] = useState<TabKey>("Home");

  // State Store
  const [profile, setProfile] = useState<PartnerProfile>(initialPartnerProfile);
  const [properties, setProperties] = useState<PropertyItem[]>(sampleProperties);
  const [invoices, setInvoices] = useState(sampleInvoices);
  const [sourcedUnits, setSourcedUnits] = useState<SourcedUnitData[]>(sampleSourcedUnits);
  const [selectedSourcedUnit, setSelectedSourcedUnit] = useState<SourcedUnitData | null>(null);

  // Modals & Sub-screens
  const [showMyDetails, setShowMyDetails] = useState(false);
  const [showAddUnitWizard, setShowAddUnitWizard] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<PropertyItem | null>(null);
  const [showSubmitUnitModal, setShowSubmitUnitModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPropertyForShare, setSelectedPropertyForShare] = useState<PropertyItem | null>(null);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  // Handlers for Onboarding & Auth Flow
  const handleSelectLanguage = (lang: Language) => {
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, preferred_language: lang },
    }));
  };

  const handleLanguageContinue = () => {
    setCurrentStep("onboarding");
  };

  const handleOnboardingFinish = () => {
    setCurrentStep("login");
  };

  const handleLoginSuccess = (phone: string) => {
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, phone },
    }));
    setCurrentStep("name");
  };

  const handleNameContinue = (firstName: string, lastName: string) => {
    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    }));
    setCurrentStep("location");
  };

  const handleLocationContinue = (baseLocation: string, selectedAreas: string[]) => {
    setProfile((prev) => ({
      ...prev,
      base_location: baseLocation,
      work_areas: selectedAreas,
    }));
    setCurrentStep("main");
  };

  // Modals & Action Triggers
  const handleTriggerScheduleVisit = (prop?: PropertyItem) => {
    setSelectedPropertyForVisit(prop || properties[1]); // Default ACE Divino
    setShowScheduleVisitModal(true);
  };

  const handleTriggerShare = (prop?: PropertyItem) => {
    setSelectedPropertyForShare(prop || properties[0]); // Default Gaur 14th
    setShowShareModal(true);
  };

  const handleConfirmVisit = (visit: ScheduledVisit) => {
    setProfile((prev) => ({
      ...prev,
      total_earned: prev.total_earned === "₹0" ? "₹0" : prev.total_earned,
    }));
  };

  const handleKycSubmit = (pan: string, aadhaar: string, rera: string) => {
    setProfile((prev) => ({
      ...prev,
      kyc_status: "PENDING",
      pan_number: pan,
      aadhaar_last_four: aadhaar,
      rera_number: rera,
    }));
  };

  const handleToggleLanguage = () => {
    const nextLang: Language = profile.user.preferred_language === "en" ? "hi" : "en";
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, preferred_language: nextLang },
    }));
    Alert.alert(
      "Language Changed",
      nextLang === "hi" ? "भाषा हिंदी में सेट हो गई है।" : "Language switched to English."
    );
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* Step 1: Language Selection */}
        {currentStep === "language" && (
          <LanguageSelectScreen
            selectedLanguage={profile.user.preferred_language}
            onSelectLanguage={handleSelectLanguage}
            onContinue={handleLanguageContinue}
          />
        )}

        {/* Step 2: Onboarding Walkthrough Carousel */}
        {currentStep === "onboarding" && (
          <OnboardingCarouselScreen onFinish={handleOnboardingFinish} />
        )}

        {/* Step 3: Login with Phone & 6-digit OTP */}
        {currentStep === "login" && (
          <LoginScreen onSuccessLogin={handleLoginSuccess} />
        )}

        {/* Step 4: Name Setup ("What's your name?") */}
        {currentStep === "name" && (
          <NameSetupScreen onContinue={handleNameContinue} />
        )}

        {/* Step 5: Location & Work Areas ("Where do you work?") */}
        {currentStep === "location" && (
          <LocationSetupScreen onContinue={handleLocationContinue} />
        )}

        {/* Step 6: Core 5-Tab Application */}
        {currentStep === "main" && (
          <View style={styles.mainContainer}>
            <View style={styles.tabContent}>
              {activeTab === "Home" && (
                <HomeScreen
                  profile={profile}
                  onNavigateTab={setActiveTab}
                  onOpenMyDetails={() => setShowMyDetails(true)}
                  onOpenSubmitUnit={() => setShowAddUnitWizard(true)}
                  onOpenScheduleVisit={() => handleTriggerScheduleVisit()}
                  onOpenShareModal={() => handleTriggerShare()}
                  onToggleLanguage={handleToggleLanguage}
                />
              )}

              {activeTab === "Sourcing" && (
                <SourcingScreen
                  units={sourcedUnits}
                  onOpenSubmitUnit={() => setShowAddUnitWizard(true)}
                  onSelectUnit={(unit) => setSelectedSourcedUnit(unit)}
                />
              )}

              {activeTab === "Selling" && (
                <SellingScreen
                  properties={properties}
                  onSelectPropertyForVisit={(p) => handleTriggerScheduleVisit(p)}
                  onSelectPropertyForShare={(p) => handleTriggerShare(p)}
                  onShareFullList={() => handleTriggerShare(properties[0])}
                />
              )}

              {activeTab === "Earnings" && (
                <EarningsScreen
                  profile={profile}
                  onOpenSubmitUnit={() => setShowAddUnitWizard(true)}
                  onOpenScheduleVisit={() => handleTriggerScheduleVisit()}
                />
              )}

              {activeTab === "More" && (
                <MoreScreen
                  profile={profile}
                  onOpenMyDetails={() => setShowMyDetails(true)}
                  onOpenKycModal={() => setShowKycModal(true)}
                  onOpenInvoicesModal={() => setShowInvoicesModal(true)}
                  onOpenCpPolicy={() =>
                    Alert.alert(
                      "Aashrayo Channel Partner Policy",
                      "• 2% Standard commission on closed resale units.\n• 60-day client attribution guarantee on registered leads.\n• Automated 5% Section 194H TDS withholding.\n• Bank disbursement within 72 hours of closing."
                    )
                  }
                  onOpenPolicyTracker={() =>
                    Alert.alert(
                      "Policy & Attribution Tracker",
                      "Active Referrals: 3 Clients\nProtected Attribution Window: 60 Days\nCompeting partner claims within window are automatically rejected."
                    )
                  }
                  onToggleLanguage={handleToggleLanguage}
                  onRestartAppGuide={() => {
                    setActiveTab("Home");
                    Alert.alert("App Guide", "Guided walkthrough resumed on Home Dashboard.");
                  }}
                  onLogout={() => {
                    Alert.alert("Logged Out", "You have been logged out of your session.", [
                      { text: "OK", onPress: () => setCurrentStep("login") },
                    ]);
                  }}
                />
              )}
            </View>

            {/* Bottom Tab Bar */}
            <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </View>
        )}

        {/* My Details / Full KYC Sub-screen */}
        {showMyDetails && (
          <View style={StyleSheet.absoluteFill}>
            <MyDetailsScreen
              profile={profile}
              onBack={() => setShowMyDetails(false)}
              onUpdateProfile={(updated) => {
                setProfile((prev) => ({
                  ...prev,
                  ...updated,
                  user: {
                    ...prev.user,
                    ...(updated.user || {}),
                  },
                }));
              }}
            />
          </View>
        )}

        {/* Add Unit 3-Step Wizard Sub-screen */}
        {showAddUnitWizard && (
          <View style={StyleSheet.absoluteFill}>
            <AddUnitWizardScreen
              onBack={() => setShowAddUnitWizard(false)}
              onSubmitSuccess={(newUnit) => {
                setSourcedUnits((prev) => [newUnit, ...prev]);
              }}
              onViewUnits={() => {
                setShowAddUnitWizard(false);
                setActiveTab("Sourcing");
              }}
            />
          </View>
        )}

        {/* Sourcing Unit Detail Sub-screen */}
        {selectedSourcedUnit && (
          <View style={StyleSheet.absoluteFill}>
            <SourcingUnitDetailScreen
              unit={selectedSourcedUnit}
              onBack={() => setSelectedSourcedUnit(null)}
              onWithdraw={(id) => {
                setSourcedUnits((prev) => prev.filter((u) => u.id !== id));
                setSelectedSourcedUnit(null);
              }}
            />
          </View>
        )}

        {/* Global Modals */}
        <KycModal
          visible={showKycModal}
          onClose={() => setShowKycModal(false)}
          onSubmit={handleKycSubmit}
        />

        <ScheduleVisitModal
          visible={showScheduleVisitModal}
          property={selectedPropertyForVisit}
          onClose={() => setShowScheduleVisitModal(false)}
          onConfirmVisit={handleConfirmVisit}
        />

        <SubmitUnitModal
          visible={showSubmitUnitModal}
          onClose={() => setShowSubmitUnitModal(false)}
          onSubmitSuccess={() => {}}
        />

        <ShareModal
          visible={showShareModal}
          property={selectedPropertyForShare}
          onClose={() => setShowShareModal(false)}
        />

        <InvoicesModal
          visible={showInvoicesModal}
          invoices={invoices}
          onClose={() => setShowInvoicesModal(false)}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
