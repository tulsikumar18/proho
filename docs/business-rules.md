# Proho Platform — Confirmed Business Rules

This document outlines the authoritative business logic and regulatory safeguards for the Proho Channel Partner Platform. All backend service classes and API validations must adhere strictly to these rules.

---

## 1. Partner Eligibility & Approval Requirements
- **Eligibility**: Any individual broker or real estate consultancy firm operating in supported micro-markets (e.g., Delhi-NCR, Noida, Greater Noida, Ghaziabad).
- **Mandatory Profile Information**: Full legal name, primary mobile number, email address, primary operating market (base location), and secondary work areas.
- **Approval Prerequisite**: A newly registered partner can browse live inventory ("Selling" tab) and submit seller units ("Sourcing" tab), but **CANNOT** schedule client site visits or request commission payouts until their KYC is formally reviewed and set to `APPROVED` by an administrator.

---

## 2. Required KYC Fields & Documents
- **Identity & Tax Information**:
  - Permanent Account Number (PAN): 10-character alphanumeric string; regex validated (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`). Upload of PAN document (PDF/JPEG/PNG) mandatory.
  - Aadhaar / Address Proof: 12-digit number (masked in DB and UI to show only last 4 digits); address proof document upload mandatory.
  - RERA Registration Number: Optional for individual sub-agents, mandatory if registering as a licensed agency/firm.
- **Bank Account Information**:
  - Beneficiary Name (must match PAN name).
  - Bank Account Number & Confirmation.
  - IFSC Code: 11-character code (`^[A-Z]{4}0[A-Z0-9]{6}$`).
  - Bank Name and Branch.
  - Document: Cancelled cheque, bank statement, or passbook front page.
- **Verification Workflow**:
  - Initial state: `PENDING`.
  - Admin review: Admin evaluates document authenticity.
  - Outcome: `APPROVED` (unlocks visits & payouts) or `REJECTED` (with mandatory rejection reason code and text note). Partners can resubmit rejected documents.
  - **No automated approval is ever permitted.**

---

## 3. Property Listing & Submission Rules
- **Sourcing Submissions**:
  - Partner submits property details: Society name, Tower, Floor, Unit number, BHK type, Carpet/Super area, Expected price, Tenancy status, and at least 3 photos.
  - Initial status: `SUBMITTED`.
  - Evaluation: Proho acquisition team inspects the unit and delivers an offer within 48 hours (`UNDER_EVALUATION` -> `OFFER_MADE`).
  - **Editing Submitted Listings**: While status is `SUBMITTED`, the partner can make minor edits. Once status moves to `UNDER_EVALUATION`, `OFFER_MADE`, or `ACCEPTED`, partner edits are locked. Modifications must be requested via Proho support/admin.
- **Selling Inventory (Proho Pool)**:
  - Curated, verified units listed by Proho operations.
  - Available for all verified partners to share with prospective buyers via WhatsApp/PDF flyers.

---

## 4. Property Ownership & Duplicate Listing Rules
- A property is uniquely keyed by: `(society_name, tower_number, unit_number)`.
- If an active sourced listing already exists for that exact unit in `SUBMITTED`, `UNDER_EVALUATION`, or `INVENTORY`, subsequent submissions for the same unit by another partner are flagged as `DUPLICATE_FLAGGED` and require admin arbitration.
- Priority is awarded to the submission with earliest timestamp accompanied by valid seller authorization/contact verification.

---

## 5. Referral Attribution & Duplicate Customer Rules
- **Lead Referral Creation**: Partner submits buyer lead (Name, Phone number, Email, BHK interest, Budget).
- **Attribution Window / Lock-in**:
  - A lead is locked to the referring partner for **60 calendar days** from the date of submission or last verified interaction (site visit).
  - If Partner A registers Customer X, and within 60 days Partner B attempts to submit Customer X (matched by normalized 10-digit mobile number), Partner B's submission is rejected with: *"Lead already actively registered by another partner."*
- **Cooling-Off Expiration**: If 60 days pass with zero scheduled visits or active offers, the customer lead becomes open for re-referral by another partner.

---

## 6. Offer & Counteroffer State Transitions
- **State Machine**:
  - `DRAFT`: Initial draft.
  - `SUBMITTED`: Formal offer submitted with earnest deposit or validity window.
  - `UNDER_REVIEW`: Proho acquisitions/sales team reviewing.
  - `COUNTERED`: Counteroffer proposed with adjusted price or terms.
  - `ACCEPTED`: Both parties agree to terms. Triggers contract/token generation.
  - `REJECTED`: Offer declined.
  - `EXPIRED`: Offer validity window (default: 72 hours) passed without acceptance.
- Offers cannot be deleted; full negotiation history and counteroffer chains are preserved for audit purposes.

---

## 7. Booking & Visit Cancellation / Rescheduling Rules
- **Booking Window**: Visits can be scheduled between 09:00 AM and 07:00 PM in 1-hour slots.
- **Concurrency**: Only one active visit can be scheduled per unit per slot to prevent overcrowding.
- **Rescheduling / Cancellation**:
  - Partner or admin can cancel or reschedule up to 2 hours before the scheduled slot without penalty.
  - Cancellation reason must be selected from a standardized list (e.g., *Client unavailable*, *Weather*, *Unit access issue*).

---

## 8. Visit OTP Verification Rules
- **Security & Integrity**:
  - OTP is a cryptographically secure 6-digit numeric string generated only when the visit is within 1 hour of the scheduled time.
  - OTP is visible in the partner app and/or sent via SMS to the verified visitor.
  - **Expiry**: OTP expires exactly 300 seconds (5 minutes) after issuance or at the conclusion of the visit time window.
  - **Attempt Limits**: Maximum **3 failed attempts**. Upon the 3rd failure, the OTP is invalidated, the visit is flagged as `FAILED_VERIFICATION`, and a new OTP must be authorized by an admin.
  - **One-Time Use**: Once successfully verified, the OTP is marked `CONSUMED` with an exact UTC timestamp. An OTP cannot be reused or applied to any other visit.

---

## 9. Commission Rules & Earnings Ledger
- **Calculation Formula**:
  - Standard Commission = `Agreement Value × Commission Percentage` (e.g., ₹1,00,00,000 × 2% = ₹2,00,000).
  - Special Incentives: Fixed bonus (e.g., ₹10,000 per meeting milestone or festive campaign incentives).
  - Stored strictly using `DecimalField(max_digits=12, decimal_places=2)`.
  - Stored currency: `INR`.
- **Eligible Event**: Commission is credited to the partner's ledger only upon verified registration of the sale deed or receipt of full developer/seller brokerage fee (as defined in the deal contract).
- **Double-Entry Ledger**:
  - `CREDIT`: Deal closure commission, bonus incentive.
  - `DEBIT`: Payout disbursement, tax deduction, or approved dispute adjustment.
  - Balance = `SUM(Credits) - SUM(Debits)`. Balance cannot be negative.

---

## 10. Commission Adjustments & Reversals
- Reversals occur if a transaction is cancelled prior to registration or if a deal falls through post-token refund.
- Reversals require dual-approval in the admin panel (Operations Manager + Finance Admin).
- An audit note explaining the reversal reason is attached to the ledger reversal entry.

---

## 11. Payout Requests & Manual Disbursement Rules
- **Eligibility**:
  - Partner KYC must be in `APPROVED` status.
  - Bank account details must be verified.
  - Minimum payout amount: **₹5,000 INR**.
  - Payout request cannot exceed available (unlocked) earnings balance.
- **Processing Safeguards**:
  - **No automated money transfer** via payment gateway without admin sign-off.
  - Payout status workflow: `REQUESTED` -> `UNDER_REVIEW` -> `APPROVED` -> `PAID` (or `REJECTED`).
  - When marked `PAID`, the administrator must input:
    1. Transaction Reference Number (Bank UTR / NEFT reference).
    2. Exact payment date/time.
    3. Payment receipt / bank confirmation attachment (optional/recommended).
  - Multiple rapid submissions are blocked via database-level idempotency locks.

---

## 12. Invoices & Commission Statements
- Invoices are generated automatically when a deal's commission is credited.
- **Mandatory Fields**:
  - Invoice Number (Sequential: `PROHO/YYYY-YY/XXXX`).
  - Date of Issue.
  - Partner Legal Name, PAN, Address, RERA registration (if registered).
  - Proho Corporate Entity details & GSTIN.
  - Property description (Project, Unit ID, Sale Value).
  - Gross Commission, Applicable TDS (e.g., Section 194H - 5%), Net Payable.

---

## 13. Data Retention, Privacy & Administrative Access
- KYC documents are stored in a private S3 bucket with signed URL access (time-limited to 15 minutes).
- Passwords, OTPs, raw tokens, and full account numbers are never logged in application logs.
- Audit logs are append-only; deletion of audit records is strictly prohibited in the database schema.
