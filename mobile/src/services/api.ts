import { PartnerProfile, PropertyItem, ScheduledVisit, InvoiceItem } from "../types";

export const initialPartnerProfile: PartnerProfile = {
  id: "prt-kritaank",
  user: {
    id: "usr-kritaank",
    phone: "+91 8073526342",
    first_name: "Kritaank",
    last_name: "Krishna",
    full_name: "Kritaank Krishna",
    preferred_language: "en",
    is_partner: true,
  },
  base_location: "Greater Noida West",
  work_areas: [
    "Central Noida",
    "Gaur City",
    "Indirapuram",
    "Noida Expressway",
    "Sector 16B",
    "Techzone",
  ],
  kyc_status: "PENDING",
  total_earned: "₹0",
  this_month_earned: "+₹0",
  pending_payout: "₹0",
  paid_amount: "₹0",
  referral_earnings: "₹0",
};

export const sampleProperties: PropertyItem[] = [
  {
    id: "prop-gaur-14th",
    title: "Gaur 14th Avenue",
    society_name: "Gaur 14th Avenue",
    sector_location: "Gaur City, Greater Noida",
    tower_unit: "N·160114",
    bhk_type: "2 BHK",
    super_area_sqft: 855,
    carpet_area_sqft: 640,
    price_display: "₹79 L",
    price_numeric: 7900000,
    rate_per_sqft_display: "₹9,239.77/sq ft",
    commission_tag: "2% Commission + iPhone 17",
    instant_visit: false,
    tenancy_status: "Tenanted",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    available_slots: ["Today, 4:00 PM", "Today, 5:30 PM", "Tomorrow, 11:00 AM"],
  },
  {
    id: "prop-ace-divino",
    title: "ACE Divino",
    society_name: "ACE Divino",
    sector_location: "Sector 1, Greater Noida",
    tower_unit: "4·2101",
    bhk_type: "3 BHK",
    super_area_sqft: 1565,
    carpet_area_sqft: 1180,
    price_display: "₹1.78 Cr",
    price_numeric: 17800000,
    rate_per_sqft_display: "₹11,373.80/sq ft",
    commission_tag: "2% Commission + iPhone 17",
    instant_visit: true,
    tenancy_status: "Vacant",
    image_url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80",
    available_slots: ["Instant Unlock Now", "Today, 6:00 PM", "Tomorrow, 12:00 PM"],
  },
  {
    id: "prop-eco-village",
    title: "Supertech Eco Village 1",
    society_name: "Eco Village 1",
    sector_location: "Greater Noida West",
    tower_unit: "B3·802",
    bhk_type: "2 BHK",
    super_area_sqft: 890,
    carpet_area_sqft: 670,
    price_display: "₹48 L",
    price_numeric: 4800000,
    rate_per_sqft_display: "₹5,393.25/sq ft",
    commission_tag: "2% Commission + iPhone 17",
    instant_visit: true,
    tenancy_status: "Vacant",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    available_slots: ["Instant Unlock Now", "Tomorrow, 10:00 AM", "Tomorrow, 3:00 PM"],
  },
  {
    id: "prop-express-astra",
    title: "Express Astra",
    society_name: "Express Astra",
    sector_location: "Sector 1, Greater Noida West",
    tower_unit: "Tower 2·1204",
    bhk_type: "3 BHK",
    super_area_sqft: 1450,
    carpet_area_sqft: 1100,
    price_display: "₹1.15 Cr",
    price_numeric: 11500000,
    rate_per_sqft_display: "₹7,931.03/sq ft",
    commission_tag: "2% Commission + iPhone 17",
    instant_visit: false,
    tenancy_status: "Vacant",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    available_slots: ["Today, 5:00 PM", "Tomorrow, 4:00 PM"],
  },
];

export const sampleInvoices: InvoiceItem[] = [
  {
    id: "inv-001",
    invoice_number: "AASHRAYO/2026-27/0014",
    property_title: "ACE Divino - Unit 4-2101",
    deal_value: "₹1,78,00,000",
    gross_commission: "₹3,56,000",
    tds_deduction: "₹17,800",
    net_paid: "₹3,38,200",
    status: "PAID",
    date: "14 Oct 2026",
  },
];

export const sampleVisits: ScheduledVisit[] = [
  {
    id: "vst-001",
    property_id: "prop-ace-divino",
    property_title: "ACE Divino - 4·2101",
    society_name: "ACE Divino",
    client_name: "Suresh Agarwal",
    client_phone: "+91 98112 33445",
    date_time_display: "Today at 5:00 PM",
    otp_code: "582914",
    otp_status: "PENDING",
  },
];

export const submitKycToAdmin = async (submission: {
  partner_name: string;
  partner_phone: string;
  pan_number: string;
  aadhaar_last_four: string;
  bank_account?: string;
  agency_name?: string;
}) => {
  const newSubmission = {
    id: `kyc-${Date.now().toString().slice(-4)}`,
    partner_id: "prt-kritaank",
    partner_name: submission.partner_name,
    partner_phone: submission.partner_phone,
    agency_name: submission.agency_name || "Individual",
    pan_number: submission.pan_number,
    pan_document_url: "https://proho-storage.s3.ap-southeast-2.amazonaws.com/kyc/pan_sample1.pdf",
    aadhaar_last_four: submission.aadhaar_last_four,
    address_document_url: "https://proho-storage.s3.ap-southeast-2.amazonaws.com/kyc/address_sample1.pdf",
    status: "PENDING",
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const existing = JSON.parse(window.localStorage.getItem("aashrayo_kyc_list") || "[]");
      const filtered = existing.filter((item: any) => item.partner_id !== "prt-kritaank");
      filtered.unshift(newSubmission);
      window.localStorage.setItem("aashrayo_kyc_list", JSON.stringify(filtered));
    } catch (e) {}
  }

  try {
    const formData = new FormData();
    formData.append("pan_number", submission.pan_number);
    formData.append("aadhaar_last_four", submission.aadhaar_last_four);
    await fetch("http://localhost:8000/api/v1/partner/kyc/", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    // Graceful offline fallback
  }

  return newSubmission;
};
