export type UserRole = "CHANNEL_PARTNER" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name: string;
  role: UserRole;
  preferred_language: "en" | "hi";
  is_active: boolean;
  created_at: string;
}

export type KycStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

export interface PartnerProfile {
  id: string;
  user: User;
  agency_name?: string;
  base_location: string;
  work_areas: string[];
  rera_number?: string;
  kyc_status: KycStatus;
  total_earned: string;
  current_balance: string;
  created_at: string;
}

export interface KycSubmission {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_phone: string;
  agency_name?: string;
  pan_number: string;
  pan_document_url?: string;
  aadhaar_last_four: string;
  address_document_url?: string;
  rera_number?: string;
  rera_document_url?: string;
  status: KycStatus;
  reviewed_by?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface BankAccount {
  id: string;
  partner_id: string;
  account_holder_name: string;
  account_number_masked: string;
  ifsc_code: string;
  bank_name: string;
  branch_name?: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

export type PropertyStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";

export interface Property {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  title: string;
  description?: string;
  category: string;
  society_name: string;
  tower?: string;
  unit_number?: string;
  floor_number?: number;
  total_floors?: number;
  bhk_type: string;
  super_area_sqft?: string;
  carpet_area_sqft?: string;
  furnishing: string;
  tenancy_status: string;
  price: string;
  rate_per_sqft?: string;
  status: PropertyStatus;
  rejection_reason?: string;
  media_count?: number;
  created_at: string;
}

export type OfferStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "COUNTERED" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface Offer {
  id: string;
  property_id: string;
  property_title: string;
  partner_id: string;
  partner_name: string;
  customer_name?: string;
  offer_amount: string;
  status: OfferStatus;
  counter_to_id?: string;
  counter_amount?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export type VisitStatus = "SCHEDULED" | "VERIFIED_COMPLETED" | "CANCELLED" | "NO_SHOW" | "FAILED_VERIFICATION";

export interface Visit {
  id: string;
  property_id: string;
  property_title: string;
  society_name: string;
  partner_name: string;
  partner_phone: string;
  customer_name?: string;
  assigned_representative?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: VisitStatus;
  cancellation_reason?: string;
  otp_status?: "PENDING" | "VERIFIED" | "FAILED";
  created_at: string;
}

export type PayoutStatus = "REQUESTED" | "UNDER_REVIEW" | "APPROVED" | "PAID" | "REJECTED";

export interface PayoutRequest {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_phone: string;
  bank_name: string;
  account_number_masked: string;
  ifsc_code: string;
  amount: string;
  status: PayoutStatus;
  utr_reference?: string;
  payment_date?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Deal {
  id: string;
  property_id: string;
  property_title: string;
  partner_id: string;
  partner_name: string;
  lead_name?: string;
  agreement_value: string;
  status: "PENDING_REGISTRATION" | "REGISTERED" | "CANCELLED";
  deal_date: string;
  registered_at?: string;
  notes?: string;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  partner_id: string;
  partner_name: string;
  entry_type: "CREDIT" | "DEBIT";
  amount: string;
  currency: string;
  category: string;
  reference_id: string;
  running_balance: string;
  description: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  partner_name: string;
  gross_commission: string;
  tds_rate: string;
  tds_deducted: string;
  net_payable: string;
  status: "ISSUED" | "PAID" | "CANCELLED";
  issued_at: string;
}

export interface AuditLog {
  id: string;
  actor_name: string;
  action: string;
  target_model: string;
  target_id?: string;
  ip_address?: string;
  metadata: Record<string, any>;
  created_at: string;
}
