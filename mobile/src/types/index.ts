export type Language = "en" | "hi";

export interface User {
  id: string;
  phone: string;
  first_name: string;
  last_name?: string;
  full_name: string;
  preferred_language: Language;
  is_partner: boolean;
}

export type KycStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

export interface PartnerProfile {
  id: string;
  user: User;
  base_location: string;
  work_areas: string[];
  kyc_status: KycStatus;
  total_earned: string;
  this_month_earned: string;
  pending_payout: string;
  paid_amount: string;
  referral_earnings: string;
  agency_name?: string;
  pan_number?: string;
  aadhaar_last_four?: string;
  rera_number?: string;
}

export interface PropertyItem {
  id: string;
  title: string;
  society_name: string;
  sector_location: string;
  tower_unit: string;
  bhk_type: "1 BHK" | "2 BHK" | "3 BHK" | "4 BHK";
  super_area_sqft: number;
  carpet_area_sqft?: number;
  price_display: string;
  price_numeric: number;
  rate_per_sqft_display: string;
  commission_tag: string;
  instant_visit: boolean;
  tenancy_status: "Vacant" | "Tenanted";
  image_url: string;
  available_slots?: string[];
}

export interface ScheduledVisit {
  id: string;
  property_id: string;
  property_title: string;
  society_name: string;
  client_name: string;
  client_phone: string;
  date_time_display: string;
  otp_code: string;
  otp_status: "PENDING" | "VERIFIED" | "EXPIRED";
}

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  property_title: string;
  deal_value: string;
  gross_commission: string;
  tds_deduction: string;
  net_paid: string;
  status: "GENERATED" | "APPROVED" | "PAID";
  date: string;
}
