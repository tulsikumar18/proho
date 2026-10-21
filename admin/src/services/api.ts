import type {
  AuditLog,
  Deal,
  Invoice,
  KycSubmission,
  Offer,
  PayoutRequest,
  Property,
  User,
  Visit,
} from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// =============================================================================
// Mock Baseline Data for Instantaneous Testing and Offline Fallback
// =============================================================================

import {
  generatePanCardSvg,
  generateAadhaarFrontSvg,
  generateAadhaarBackSvg,
  generateCancelledChequeSvg,
} from "./mockDocs";

export const initialMockUser: User = {
  id: "usr-admin-001",
  phone: "+919999999999",
  email: "admin@aashrayo.in",
  full_name: "Aashrayo Operations Lead",
  role: "ADMIN",
  preferred_language: "en",
  is_active: true,
  created_at: "2026-10-21T09:00:00Z",
};

export const initialMockKycSubmissions: KycSubmission[] = [
  {
    id: "kyc-000",
    partner_id: "prt-kritaank",
    partner_name: "Kritaank Krishna",
    partner_phone: "+91 8073526342",
    partner_email: "kritaank.krishna@aashrayopartner.in",
    profile_type: "Individual",
    base_location: "Greater Noida West",
    work_areas: ["Sector 16B", "Gaur City", "Techzone", "Noida Expressway", "Central Noida"],
    partner_since: "Oct 2026",
    agency_name: "Individual Channel Partner",
    pan_number: "ABCDE1234F",
    pan_document_url: generatePanCardSvg("ABCDE1234F", "Kritaank Krishna"),
    pan_photo_url: generatePanCardSvg("ABCDE1234F", "Kritaank Krishna"),
    aadhaar_number: "9823 4512 4321",
    aadhaar_last_four: "4321",
    address_document_url: generateAadhaarFrontSvg("9823 4512 4321", "Kritaank Krishna"),
    aadhaar_front_url: generateAadhaarFrontSvg("9823 4512 4321", "Kritaank Krishna"),
    aadhaar_back_url: generateAadhaarBackSvg("Flat 1204, Tower 2, Express Astra, Sector 1, Greater Noida West, UP - 201306"),
    bank_name: "HDFC Bank Ltd",
    bank_account_holder: "Kritaank Krishna",
    bank_account_number: "123456789012",
    bank_ifsc: "HDFC0001234",
    bank_branch: "Sector 62, Noida Branch",
    cheque_photo_url: generateCancelledChequeSvg("123456789012", "HDFC0001234", "Kritaank Krishna"),
    status: "PENDING",
    created_at: "2026-10-21T18:30:00Z",
  },
  {
    id: "kyc-001",
    partner_id: "prt-001",
    partner_name: "Rajesh Sharma",
    partner_phone: "+919876543210",
    partner_email: "rajesh.sharma@sharmarealtors.com",
    profile_type: "Firm",
    base_location: "Central Noida",
    work_areas: ["Sector 78", "Sector 79", "Sector 107", "Noida Expressway"],
    partner_since: "Aug 2026",
    agency_name: "Sharma Real Estate Consultants",
    pan_number: "ABCDE1234F",
    pan_document_url: generatePanCardSvg("ABCDE1234F", "Rajesh Sharma"),
    pan_photo_url: generatePanCardSvg("ABCDE1234F", "Rajesh Sharma"),
    aadhaar_number: "8712 3456 4321",
    aadhaar_last_four: "4321",
    address_document_url: generateAadhaarFrontSvg("8712 3456 4321", "Rajesh Sharma"),
    aadhaar_front_url: generateAadhaarFrontSvg("8712 3456 4321", "Rajesh Sharma"),
    aadhaar_back_url: generateAadhaarBackSvg("House 45, Sector 50, Central Noida - 201301"),
    bank_name: "ICICI Bank",
    bank_account_holder: "Sharma Real Estate Consultants",
    bank_account_number: "987654321098",
    bank_ifsc: "ICIC0005678",
    bank_branch: "Sector 18, Noida Commercial Branch",
    cheque_photo_url: generateCancelledChequeSvg("987654321098", "ICIC0005678", "Sharma Real Estate"),
    rera_number: "UPRERAAGT12345",
    status: "PENDING",
    created_at: "2026-10-21T10:15:00Z",
  },
  {
    id: "kyc-002",
    partner_id: "prt-002",
    partner_name: "Amit Verma",
    partner_phone: "+919811223344",
    partner_email: "verma.homes@gmail.com",
    profile_type: "Firm",
    base_location: "Greater Noida West",
    work_areas: ["Gaur City 1", "Gaur City 2", "Sector 1"],
    partner_since: "Jul 2026",
    agency_name: "Verma Homes & Properties",
    pan_number: "XYZPK9876L",
    pan_document_url: generatePanCardSvg("XYZPK9876L", "Amit Verma"),
    pan_photo_url: generatePanCardSvg("XYZPK9876L", "Amit Verma"),
    aadhaar_number: "4412 8899 8899",
    aadhaar_last_four: "8899",
    address_document_url: generateAadhaarFrontSvg("4412 8899 8899", "Amit Verma"),
    aadhaar_front_url: generateAadhaarFrontSvg("4412 8899 8899", "Amit Verma"),
    aadhaar_back_url: generateAadhaarBackSvg("Tower 4, Gaur City 1, Greater Noida West - 201306"),
    bank_name: "State Bank of India",
    bank_account_holder: "Amit Verma",
    bank_account_number: "554433221100",
    bank_ifsc: "SBIN0004567",
    bank_branch: "Gaur City Branch",
    cheque_photo_url: generateCancelledChequeSvg("554433221100", "SBIN0004567", "Amit Verma"),
    status: "APPROVED",
    reviewed_by: "Aashrayo Admin",
    reviewed_at: "2026-10-21T11:00:00Z",
    created_at: "2026-10-20T14:30:00Z",
  },
  {
    id: "kyc-003",
    partner_id: "prt-003",
    partner_name: "Sunita Reddy",
    partner_phone: "+919988776655",
    partner_email: "sunita.reddy@realty.in",
    profile_type: "Individual",
    base_location: "Ghaziabad",
    work_areas: ["Indirapuram", "Vasundhara", "Vaishali"],
    partner_since: "Sep 2026",
    pan_number: "PQRST5678M",
    pan_document_url: generatePanCardSvg("PQRST5678M", "Sunita Reddy"),
    pan_photo_url: generatePanCardSvg("PQRST5678M", "Sunita Reddy"),
    aadhaar_number: "7711 2233 1122",
    aadhaar_last_four: "1122",
    address_document_url: generateAadhaarFrontSvg("7711 2233 1122", "Sunita Reddy"),
    aadhaar_front_url: generateAadhaarFrontSvg("7711 2233 1122", "Sunita Reddy"),
    aadhaar_back_url: generateAadhaarBackSvg("Flat 302, Shipra Sun City, Indirapuram, Ghaziabad - 201014"),
    bank_name: "Axis Bank",
    bank_account_holder: "Sunita Reddy",
    bank_account_number: "919010045892",
    bank_ifsc: "UTIB0001239",
    bank_branch: "Indirapuram Branch",
    cheque_photo_url: generateCancelledChequeSvg("919010045892", "UTIB0001239", "Sunita Reddy"),
    status: "REJECTED",
    rejection_reason: "Aadhaar address proof blurred and unreadable. Please upload a clear photo or utility bill.",
    reviewed_by: "Aashrayo Admin",
    reviewed_at: "2026-10-21T12:00:00Z",
    created_at: "2026-10-20T16:00:00Z",
  },
];

export const initialMockProperties: Property[] = [
  {
    id: "prop-001",
    owner_id: "prt-001",
    owner_name: "Rajesh Sharma",
    owner_phone: "+919876543210",
    title: "Gaur City 2 — 3 BHK High Floor Park View",
    category: "SOURCED",
    society_name: "Gaur City 2 - 14th Avenue",
    tower: "Tower F",
    unit_number: "1604",
    floor_number: 16,
    total_floors: 24,
    bhk_type: "3BHK",
    super_area_sqft: "1450.00",
    carpet_area_sqft: "1080.00",
    furnishing: "SEMI_FURNISHED",
    tenancy_status: "VACANT",
    price: "8500000.00",
    rate_per_sqft: "5862.07",
    status: "PENDING_REVIEW",
    media_count: 5,
    created_at: "2026-10-21T09:30:00Z",
  },
  {
    id: "prop-002",
    owner_id: "prt-002",
    owner_name: "Amit Verma",
    owner_phone: "+919811223344",
    title: "ACE Divino — Luxury 2 BHK Corner Unit",
    category: "AASHRAYO_VERIFIED_POOL",
    society_name: "ACE Divino",
    tower: "Tower A",
    unit_number: "802",
    floor_number: 8,
    total_floors: 20,
    bhk_type: "2BHK",
    super_area_sqft: "1050.00",
    carpet_area_sqft: "780.00",
    furnishing: "FULLY_FURNISHED",
    tenancy_status: "VACANT",
    price: "6800000.00",
    rate_per_sqft: "6476.19",
    status: "APPROVED",
    media_count: 8,
    created_at: "2026-10-20T11:20:00Z",
  },
  {
    id: "prop-003",
    owner_id: "prt-001",
    owner_name: "Rajesh Sharma",
    owner_phone: "+919876543210",
    title: "Supertech Eco Village 1 — 2 BHK",
    category: "SOURCED",
    society_name: "Supertech Eco Village",
    tower: "Tower B2",
    unit_number: "401",
    floor_number: 4,
    total_floors: 18,
    bhk_type: "2BHK",
    super_area_sqft: "890.00",
    furnishing: "UNFURNISHED",
    tenancy_status: "TENANTED",
    price: "4200000.00",
    rate_per_sqft: "4719.10",
    status: "REJECTED",
    rejection_reason: "Seller authorization letter missing and carpet area does not match society master deed.",
    media_count: 2,
    created_at: "2026-10-19T14:00:00Z",
  },
];

export const initialMockOffers: Offer[] = [
  {
    id: "off-001",
    property_id: "prop-002",
    property_title: "ACE Divino — Luxury 2 BHK Corner Unit",
    partner_id: "prt-001",
    partner_name: "Rajesh Sharma",
    customer_name: "Dr. Sandeep Gupta",
    offer_amount: "6500000.00",
    status: "UNDER_REVIEW",
    notes: "Buyer ready with 20% down payment cheque; expects registry within 21 days.",
    created_at: "2026-10-21T11:45:00Z",
  },
  {
    id: "off-002",
    property_id: "prop-001",
    property_title: "Gaur City 2 — 3 BHK High Floor Park View",
    partner_id: "prt-002",
    partner_name: "Amit Verma",
    customer_name: "Neha Tandon",
    offer_amount: "8000000.00",
    status: "COUNTERED",
    counter_amount: "8300000.00",
    notes: "Aashrayo counteroffer issued at ₹83,00,000 including covered basement car parking.",
    created_at: "2026-10-21T08:15:00Z",
  },
  {
    id: "off-003",
    property_id: "prop-002",
    property_title: "ACE Divino — Luxury 2 BHK Corner Unit",
    partner_id: "prt-003",
    partner_name: "Sunita Reddy",
    customer_name: "Rahul Saxena",
    offer_amount: "6700000.00",
    status: "ACCEPTED",
    notes: "Accepted by Aashrayo Acquisition Team. Deal token generated.",
    created_at: "2026-10-20T16:30:00Z",
  },
];

export const initialMockVisits: Visit[] = [
  {
    id: "vis-001",
    property_id: "prop-002",
    property_title: "ACE Divino — Luxury 2 BHK Corner Unit",
    society_name: "ACE Divino, Sector 1, Greater Noida West",
    partner_name: "Rajesh Sharma",
    partner_phone: "+919876543210",
    customer_name: "Dr. Sandeep Gupta",
    assigned_representative: "Vikas Mehra (Field Manager)",
    scheduled_start: "2026-10-21T16:00:00Z",
    scheduled_end: "2026-10-21T17:00:00Z",
    status: "SCHEDULED",
    otp_status: "PENDING",
    created_at: "2026-10-21T10:00:00Z",
  },
  {
    id: "vis-002",
    property_id: "prop-002",
    property_title: "ACE Divino — Luxury 2 BHK Corner Unit",
    society_name: "ACE Divino, Sector 1, Greater Noida West",
    partner_name: "Amit Verma",
    partner_phone: "+919811223344",
    customer_name: "Rahul Saxena",
    assigned_representative: "Vikas Mehra",
    scheduled_start: "2026-10-20T14:00:00Z",
    scheduled_end: "2026-10-20T15:00:00Z",
    status: "VERIFIED_COMPLETED",
    otp_status: "VERIFIED",
    created_at: "2026-10-20T09:00:00Z",
  },
];

export const initialMockPayouts: PayoutRequest[] = [
  {
    id: "pay-001",
    partner_id: "prt-002",
    partner_name: "Amit Verma",
    partner_phone: "+919811223344",
    bank_name: "HDFC Bank",
    account_number_masked: "****4321",
    ifsc_code: "HDFC0001234",
    amount: "75000.00",
    status: "REQUESTED",
    created_at: "2026-10-21T12:30:00Z",
  },
  {
    id: "pay-002",
    partner_id: "prt-001",
    partner_name: "Rajesh Sharma",
    partner_phone: "+919876543210",
    bank_name: "ICICI Bank",
    account_number_masked: "****9876",
    ifsc_code: "ICIC0005678",
    amount: "45000.00",
    status: "APPROVED",
    created_at: "2026-10-21T09:15:00Z",
  },
  {
    id: "pay-003",
    partner_id: "prt-001",
    partner_name: "Rajesh Sharma",
    partner_phone: "+919876543210",
    bank_name: "ICICI Bank",
    account_number_masked: "****9876",
    ifsc_code: "ICIC0005678",
    amount: "120000.00",
    status: "PAID",
    utr_reference: "ICICN20261020008432",
    payment_date: "2026-10-20T17:45:00Z",
    created_at: "2026-10-20T11:00:00Z",
  },
];

export const initialMockDeals: Deal[] = [
  {
    id: "deal-001",
    property_id: "prop-002",
    property_title: "ACE Divino — Luxury 2 BHK Corner Unit",
    partner_id: "prt-002",
    partner_name: "Amit Verma",
    lead_name: "Rahul Saxena",
    agreement_value: "6700000.00",
    status: "REGISTERED",
    deal_date: "2026-10-20T16:30:00Z",
    registered_at: "2026-10-20T18:00:00Z",
    notes: "2% Standard commission credited to partner ledger.",
    created_at: "2026-10-20T16:30:00Z",
  },
];

export const initialMockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoice_number: "AASHRAYO/2026-27/0001",
    partner_name: "Amit Verma",
    gross_commission: "134000.00",
    tds_rate: "5.00",
    tds_deducted: "6700.00",
    net_payable: "127300.00",
    status: "ISSUED",
    issued_at: "2026-10-20T18:00:00Z",
  },
];

export const initialMockAuditLogs: AuditLog[] = [
  {
    id: "log-001",
    actor_name: "Aashrayo Admin",
    action: "KYC_APPROVED",
    target_model: "KycSubmission",
    target_id: "kyc-002",
    ip_address: "127.0.0.1",
    metadata: { partner: "Amit Verma", status: "APPROVED" },
    created_at: "2026-10-21T11:00:00Z",
  },
  {
    id: "log-002",
    actor_name: "Aashrayo Admin",
    action: "PAYOUT_PAID",
    target_model: "PayoutRequest",
    target_id: "pay-003",
    ip_address: "127.0.0.1",
    metadata: { amount: "120000.00", utr: "ICICN20261020008432" },
    created_at: "2026-10-20T17:45:00Z",
  },
  {
    id: "log-003",
    actor_name: "Aashrayo Admin",
    action: "DEAL_REGISTERED",
    target_model: "Deal",
    target_id: "deal-001",
    ip_address: "127.0.0.1",
    metadata: { agreement_value: "6700000.00", invoice_number: "AASHRAYO/2026-27/0001" },
    created_at: "2026-10-20T18:00:00Z",
  },
];

// =============================================================================
// State Management for Local Testing & Hybrid Backend Integration
// =============================================================================

class AdminDataStore {
  private user: User = initialMockUser;
  private kycList: KycSubmission[] = [...initialMockKycSubmissions];
  private propertyList: Property[] = [...initialMockProperties];
  private offerList: Offer[] = [...initialMockOffers];
  private visitList: Visit[] = [...initialMockVisits];
  private payoutList: PayoutRequest[] = [...initialMockPayouts];
  private dealList: Deal[] = [...initialMockDeals];
  private invoiceList: Invoice[] = [...initialMockInvoices];
  private auditLogList: AuditLog[] = [...initialMockAuditLogs];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const storedKyc = window.localStorage.getItem("aashrayo_kyc_list");
        if (storedKyc) {
          const parsed = JSON.parse(storedKyc);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.kycList = parsed;
          }
        }
      } catch (e) {}
    }
  }

  private saveKycToStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("aashrayo_kyc_list", JSON.stringify(this.kycList));
      } catch (e) {}
    }
  }

  getUser(): User {
    return this.user;
  }

  // --- KYC ---
  getKycSubmissions(): KycSubmission[] {
    this.loadFromStorage();
    return this.kycList;
  }

  submitKyc(submission: Partial<KycSubmission>): KycSubmission {
    const name = submission.partner_name || "Kritaank Krishna";
    const pan = submission.pan_number || "ABCDE1234F";
    const aadhaarFour = submission.aadhaar_last_four || "4321";
    const aadhaarFull = submission.aadhaar_number || `9823 4512 ${aadhaarFour}`;
    const bankAcc = submission.bank_account_number || "123456789012";
    const ifsc = submission.bank_ifsc || "HDFC0001234";

    const item: KycSubmission = {
      id: submission.id || `kyc-${Date.now().toString().slice(-4)}`,
      partner_id: submission.partner_id || "prt-kritaank",
      partner_name: name,
      partner_phone: submission.partner_phone || "+91 8073526342",
      partner_email: submission.partner_email || "kritaank.krishna@aashrayopartner.in",
      profile_type: submission.profile_type || "Individual",
      base_location: submission.base_location || "Greater Noida West",
      work_areas: submission.work_areas || ["Sector 16B", "Gaur City", "Techzone", "Noida Expressway"],
      partner_since: submission.partner_since || "Oct 2026",
      agency_name: submission.agency_name || "Individual",
      pan_number: pan,
      pan_document_url: submission.pan_document_url || generatePanCardSvg(pan, name),
      pan_photo_url: submission.pan_photo_url || generatePanCardSvg(pan, name),
      aadhaar_number: aadhaarFull,
      aadhaar_last_four: aadhaarFour,
      address_document_url: submission.address_document_url || generateAadhaarFrontSvg(aadhaarFull, name),
      aadhaar_front_url: submission.aadhaar_front_url || generateAadhaarFrontSvg(aadhaarFull, name),
      aadhaar_back_url: submission.aadhaar_back_url || generateAadhaarBackSvg("Flat 1204, Tower 2, Express Astra, Sector 1, Greater Noida West"),
      bank_name: submission.bank_name || "HDFC Bank Ltd",
      bank_account_holder: submission.bank_account_holder || name,
      bank_account_number: bankAcc,
      bank_ifsc: ifsc,
      bank_branch: submission.bank_branch || "Sector 62, Noida Branch",
      cheque_photo_url: submission.cheque_photo_url || generateCancelledChequeSvg(bankAcc, ifsc, name),
      status: "PENDING",
      created_at: new Date().toISOString(),
    };
    this.kycList = this.kycList.filter((k) => k.partner_id !== item.partner_id);
    this.kycList.unshift(item);
    this.saveKycToStorage();
    this.addAuditLog("KYC_SUBMITTED", "KycSubmission", item.id, {
      partner: item.partner_name,
      pan: item.pan_number,
    });
    return item;
  }

  reviewKyc(id: string, newStatus: "APPROVED" | "REJECTED", reason?: string): KycSubmission {
    const item = this.kycList.find((k) => k.id === id);
    if (!item) throw new Error("KYC submission not found");
    item.status = newStatus;
    item.reviewed_by = this.user.full_name;
    item.reviewed_at = new Date().toISOString();
    if (newStatus === "REJECTED") {
      item.rejection_reason = reason || "Documents failed verification checks.";
    }
    this.saveKycToStorage();
    this.addAuditLog(`KYC_${newStatus}`, "KycSubmission", id, { status: newStatus, reason });
    return { ...item };
  }

  // --- Properties ---
  getProperties(): Property[] {
    return this.propertyList;
  }

  reviewProperty(id: string, newStatus: "APPROVED" | "REJECTED" | "ARCHIVED", reason?: string): Property {
    const item = this.propertyList.find((p) => p.id === id);
    if (!item) throw new Error("Property not found");
    item.status = newStatus;
    if (newStatus === "REJECTED") {
      item.rejection_reason = reason || "Listing failed pricing or title checks.";
    }
    this.addAuditLog(`PROPERTY_${newStatus}`, "Property", id, { status: newStatus, reason });
    return { ...item };
  }

  // --- Offers ---
  getOffers(): Offer[] {
    return this.offerList;
  }

  reviewOffer(id: string, newStatus: "ACCEPTED" | "REJECTED", reason?: string): Offer {
    const item = this.offerList.find((o) => o.id === id);
    if (!item) throw new Error("Offer not found");
    item.status = newStatus;
    if (newStatus === "REJECTED") {
      item.rejection_reason = reason;
    }
    this.addAuditLog(`OFFER_${newStatus}`, "Offer", id, { status: newStatus, reason });
    return { ...item };
  }

  counterOffer(id: string, counterAmount: string, notes: string): Offer {
    const item = this.offerList.find((o) => o.id === id);
    if (!item) throw new Error("Offer not found");
    item.status = "COUNTERED";
    item.counter_amount = counterAmount;
    item.notes = notes;
    this.addAuditLog("OFFER_COUNTERED", "Offer", id, { counterAmount, notes });
    return { ...item };
  }

  // --- Visits ---
  getVisits(): Visit[] {
    return this.visitList;
  }

  cancelVisit(id: string, reason: string): Visit {
    const item = this.visitList.find((v) => v.id === id);
    if (!item) throw new Error("Visit not found");
    item.status = "CANCELLED";
    item.cancellation_reason = reason;
    this.addAuditLog("VISIT_CANCELLED", "Visit", id, { reason });
    return { ...item };
  }

  // --- Payouts ---
  getPayouts(): PayoutRequest[] {
    return this.payoutList;
  }

  reviewPayout(id: string, newStatus: "UNDER_REVIEW" | "APPROVED" | "REJECTED", reason?: string): PayoutRequest {
    const item = this.payoutList.find((p) => p.id === id);
    if (!item) throw new Error("Payout request not found");
    item.status = newStatus;
    if (newStatus === "REJECTED") {
      item.rejection_reason = reason;
    }
    this.addAuditLog(`PAYOUT_${newStatus}`, "PayoutRequest", id, { status: newStatus, reason });
    return { ...item };
  }

  disbursePayout(id: string, utr: string): PayoutRequest {
    const item = this.payoutList.find((p) => p.id === id);
    if (!item) throw new Error("Payout request not found");
    item.status = "PAID";
    item.utr_reference = utr;
    item.payment_date = new Date().toISOString();
    this.addAuditLog("PAYOUT_PAID", "PayoutRequest", id, { utr, amount: item.amount });
    return { ...item };
  }

  // --- Deals & Finance ---
  getDeals(): Deal[] {
    return this.dealList;
  }

  getInvoices(): Invoice[] {
    return this.invoiceList;
  }

  createAndRegisterDeal(propertyId: string, partnerName: string, amount: string): { deal: Deal; invoice: Invoice } {
    const prop = this.propertyList.find((p) => p.id === propertyId);
    const agreementNum = parseFloat(amount) || 5000000;
    const grossComm = agreementNum * 0.02; // 2%
    const tds = grossComm * 0.05; // 5%
    const net = grossComm - tds;

    const newDeal: Deal = {
      id: `deal-${Date.now().toString().slice(-4)}`,
      property_id: propertyId,
      property_title: prop ? prop.title : "Registered Unit",
      partner_id: "prt-001",
      partner_name: partnerName,
      agreement_value: agreementNum.toFixed(2),
      status: "REGISTERED",
      deal_date: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const newInvoice: Invoice = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      invoice_number: `AASHRAYO/2026-27/${(this.invoiceList.length + 1).toString().padStart(4, "0")}`,
      partner_name: partnerName,
      gross_commission: grossComm.toFixed(2),
      tds_rate: "5.00",
      tds_deducted: tds.toFixed(2),
      net_payable: net.toFixed(2),
      status: "ISSUED",
      issued_at: new Date().toISOString(),
    };

    this.dealList.unshift(newDeal);
    this.invoiceList.unshift(newInvoice);
    this.addAuditLog("DEAL_REGISTERED", "Deal", newDeal.id, {
      agreement_value: newDeal.agreement_value,
      invoice: newInvoice.invoice_number,
    });

    return { deal: newDeal, invoice: newInvoice };
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.auditLogList;
  }

  private addAuditLog(action: string, target_model: string, target_id: string, metadata: Record<string, any>) {
    this.auditLogList.unshift({
      id: `log-${Date.now()}`,
      actor_name: this.user.full_name,
      action,
      target_model,
      target_id,
      ip_address: "127.0.0.1",
      metadata,
      created_at: new Date().toISOString(),
    });
  }
}

export const adminStore = new AdminDataStore();
