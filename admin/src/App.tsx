import { useState } from "react";
import { Sidebar, type NavTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { OverviewView } from "./views/OverviewView";
import { KycView } from "./views/KycView";
import { PropertiesView } from "./views/PropertiesView";
import { OffersView } from "./views/OffersView";
import { VisitsView } from "./views/VisitsView";
import { FinanceView } from "./views/FinanceView";
import { AuditLogsView } from "./views/AuditLogsView";
import { adminStore } from "./services/api";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load state from admin data store
  const [currentUser] = useState(adminStore.getUser());
  const [kycList, setKycList] = useState(adminStore.getKycSubmissions());
  const [propertyList, setPropertyList] = useState(adminStore.getProperties());
  const [offerList, setOfferList] = useState(adminStore.getOffers());
  const [visitList, setVisitList] = useState(adminStore.getVisits());
  const [payoutList, setPayoutList] = useState(adminStore.getPayouts());
  const [dealList, setDealList] = useState(adminStore.getDeals());
  const [invoiceList, setInvoiceList] = useState(adminStore.getInvoices());
  const [auditLogs, setAuditLogs] = useState(adminStore.getAuditLogs());

  // Show temporary toast notification
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Synchronize state helpers
  const refreshAudit = () => {
    setAuditLogs([...adminStore.getAuditLogs()]);
  };

  // Handlers for KYC
  const handleApproveKyc = (id: string) => {
    const updated = adminStore.reviewKyc(id, "APPROVED");
    setKycList([...adminStore.getKycSubmissions()]);
    refreshAudit();
    notify(`KYC approved for ${updated.partner_name}`);
  };

  const handleRejectKyc = (id: string, reason: string) => {
    const updated = adminStore.reviewKyc(id, "REJECTED", reason);
    setKycList([...adminStore.getKycSubmissions()]);
    refreshAudit();
    notify(`KYC rejected for ${updated.partner_name}`);
  };

  // Handlers for Properties
  const handleApproveProperty = (id: string) => {
    const updated = adminStore.reviewProperty(id, "APPROVED");
    setPropertyList([...adminStore.getProperties()]);
    refreshAudit();
    notify(`Property "${updated.society_name}" approved for active listings`);
  };

  const handleRejectProperty = (id: string, reason: string) => {
    const updated = adminStore.reviewProperty(id, "REJECTED", reason);
    setPropertyList([...adminStore.getProperties()]);
    refreshAudit();
    notify(`Property "${updated.society_name}" rejected`);
  };

  const handleArchiveProperty = (id: string) => {
    const updated = adminStore.reviewProperty(id, "ARCHIVED");
    setPropertyList([...adminStore.getProperties()]);
    refreshAudit();
    notify(`Property "${updated.society_name}" moved to archives`);
  };

  // Handlers for Offers
  const handleAcceptOffer = (id: string) => {
    const updated = adminStore.reviewOffer(id, "ACCEPTED");
    setOfferList([...adminStore.getOffers()]);
    refreshAudit();
    notify(`Offer accepted on "${updated.property_title}"`);
  };

  const handleRejectOffer = (id: string, reason: string) => {
    const updated = adminStore.reviewOffer(id, "REJECTED", reason);
    setOfferList([...adminStore.getOffers()]);
    refreshAudit();
    notify(`Offer rejected on "${updated.property_title}"`);
  };

  const handleCounterOffer = (id: string, counterAmount: string, notes: string) => {
    adminStore.counterOffer(id, counterAmount, notes);
    setOfferList([...adminStore.getOffers()]);
    refreshAudit();
    notify(`Counteroffer issued for ₹${parseFloat(counterAmount).toLocaleString("en-IN")}`);
  };

  // Handlers for Visits
  const handleCancelVisit = (id: string, reason: string) => {
    adminStore.cancelVisit(id, reason);
    setVisitList([...adminStore.getVisits()]);
    refreshAudit();
    notify("Visit cancelled successfully and partner notified");
  };

  // Handlers for Finance & Payouts
  const handleReviewPayout = (id: string, status: "APPROVED" | "REJECTED", reason?: string) => {
    const updated = adminStore.reviewPayout(id, status, reason);
    setPayoutList([...adminStore.getPayouts()]);
    refreshAudit();
    notify(`Payout request ${status.toLowerCase()} for ${updated.partner_name}`);
  };

  const handleDisbursePayout = (id: string, utr: string) => {
    const updated = adminStore.disbursePayout(id, utr);
    setPayoutList([...adminStore.getPayouts()]);
    refreshAudit();
    notify(`Disbursement recorded! UTR: ${utr} for ${updated.partner_name}`);
  };

  const handleCreateDeal = (propertyId: string, partnerName: string, amount: string) => {
    const { invoice } = adminStore.createAndRegisterDeal(propertyId, partnerName, amount);
    setDealList([...adminStore.getDeals()]);
    setInvoiceList([...adminStore.getInvoices()]);
    refreshAudit();
    notify(`Deal registered! Invoice ${invoice.invoice_number} generated with TDS deduction.`);
  };

  // Calculations for badges and dashboard
  const pendingCounts = {
    kyc: kycList.filter((k) => k.status === "PENDING").length,
    properties: propertyList.filter((p) => p.status === "PENDING_REVIEW").length,
    offers: offerList.filter((o) => o.status === "UNDER_REVIEW").length,
    payouts: payoutList.filter((p) => p.status === "REQUESTED").length,
  };

  const stats = {
    pendingKyc: pendingCounts.kyc,
    pendingProperties: pendingCounts.properties,
    activeOffers: offerList.filter((o) => o.status === "UNDER_REVIEW" || o.status === "COUNTERED").length,
    pendingPayouts: pendingCounts.payouts,
    totalProperties: propertyList.length,
    verifiedVisits: visitList.filter((v) => v.status === "VERIFIED_COMPLETED").length,
  };

  const tabTitles: Record<NavTab, string> = {
    overview: "Operations Overview",
    kyc: "Partner KYC Verifications",
    properties: "Property Inventory & Resale Curation",
    offers: "Negotiations, Offers & Counteroffers",
    visits: "Site Visits & Digital Lock Supervision",
    finance: "Commissions, Deals & Payout Disbursements",
    audit: "System Audit Trail & Compliance Records",
  };

  return (
    <div className="admin-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            border: "1px solid var(--accent-primary)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
            color: "#f8fafc",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-emerald)" }} />
          {toastMessage}
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCounts={pendingCounts}
      />

      {/* Main Application Area */}
      <div className="admin-main">
        <Header user={currentUser} activeTabTitle={tabTitles[activeTab]} />

        <main className="admin-content">
          {activeTab === "overview" && (
            <OverviewView stats={stats} onNavigate={setActiveTab} />
          )}

          {activeTab === "kyc" && (
            <KycView
              submissions={kycList}
              onApprove={handleApproveKyc}
              onReject={handleRejectKyc}
            />
          )}

          {activeTab === "properties" && (
            <PropertiesView
              properties={propertyList}
              onApprove={handleApproveProperty}
              onReject={handleRejectProperty}
              onArchive={handleArchiveProperty}
            />
          )}

          {activeTab === "offers" && (
            <OffersView
              offers={offerList}
              onAccept={handleAcceptOffer}
              onReject={handleRejectOffer}
              onCounter={handleCounterOffer}
            />
          )}

          {activeTab === "visits" && (
            <VisitsView
              visits={visitList}
              onCancelVisit={handleCancelVisit}
            />
          )}

          {activeTab === "finance" && (
            <FinanceView
              payouts={payoutList}
              deals={dealList}
              invoices={invoiceList}
              properties={propertyList}
              onReviewPayout={handleReviewPayout}
              onDisbursePayout={handleDisbursePayout}
              onCreateDeal={handleCreateDeal}
            />
          )}

          {activeTab === "audit" && (
            <AuditLogsView logs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
