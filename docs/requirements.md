# Proho Platform — Product Requirements Document (PRD)

## 1. Overview & Vision
The Proho-Style Channel Partner Platform is a specialized real estate channel partner (broker/agent) management platform designed to streamline resale property sourcing, inventory distribution ("selling"), site visits with digital/smart OTP verification, lead referrals, offer negotiation, commission accounting, and manual payout workflows.

The system connects three core components:
1. **Mobile Application (React Native / Expo)**: Used by Channel Partners (CPs) on iOS and Android for onboarding, multi-language support (English/Hindi), market area selection, KYC submission, property sourcing, browsing/sharing Proho inventory, scheduling verified client visits, tracking earnings, and requesting payouts.
2. **Admin Web Dashboard (React + TypeScript)**: Used by Proho operations and finance teams to review KYC, approve/price property submissions, manage live inventory, oversee visits, review/counter offers, manage commission ledger entries, audit partner activities, and manually review/approve payout disbursements.
3. **Backend API & Database (Django, DRF, PostgreSQL)**: Single source of truth providing versioned REST endpoints (`/api/v1/`), server-side business rule enforcement, strict RBAC, transactional integrity, and OpenAPI specifications.

---

## 2. User Roles & Personas
- **Channel Partner (CP)**: Real estate agent or broker. Operates in specific micro-markets (e.g., Greater Noida West, Gaur City, Indirapuram). Sources resale properties, refers buyers, schedules site visits with OTP door access, tracks commissions, and requests payouts.
- **Admin**: Internal operations, inventory managers, and transaction coordinators who review KYC, evaluate sourced properties, issue Proho offers, verify listings, manage booking workflows, and review payout requests.
- **Superadmin**: Executive or finance controller who has permissions to modify commission structures, approve manual payouts, and view company-wide financial audit trails.

---

## 3. Visual References & Core Mobile Screens
Based on design specifications and reference screens:
1. **Language Onboarding**:
   - Bilingual selection: English ("Continue in English") and Hindi ("हिंदी में जारी रखें").
   - Can be modified at any time from user account settings.
2. **Work Area / Location Selection**:
   - Primary Base Location (e.g., Central Noida, Greater Noida West, Indirapuram, Ghaziabad).
   - Additional Work Areas (multi-select chip tags).
3. **Home Dashboard**:
   - Greeting ("Namaste, [Partner Name]"), notification bell, language switch toggle.
   - Promotional carousel / banner (e.g., "Navratri Sales Dhamaka: 2% + iPhone 17 + ₹10k per meeting").
   - Quick Action Grid:
     - *Submit Seller Unit* (Sourcing flow - 3 steps)
     - *Schedule a Visit* (OTP door access)
     - *Sell Proho Unit* (Browse verified live inventory)
     - *Share Inventory* (WhatsApp / PDF flyers)
   - Actionable Onboarding Banner: *Complete your KYC - Unlock visits & payouts*.
   - *My Tasks* & *Floating Quick Call Support*.
   - 5-tab Bottom Navigation: `Home`, `Sourcing`, `Selling`, `Earnings`, `More`.
4. **Sourcing Module**:
   - Resale unit submission: 1. Submit unit details & photos -> 2. Proho evaluation & offer within 48 hours -> 3. Earn commission upon closure.
5. **Selling Module**:
   - Search by society, sector, BHK.
   - Filters: Instant visit, BHK types (1/2/3/4 BHK), Price, Ready/Tenanted status.
   - Property cards: Unit code, BHK configuration, super area (sqft), pricing (in ₹ Lakhs / ₹ Crores), rate/sqft, commission badge ("2% Commission + Incentive"), "Share" and "Visit" quick triggers.

---

## 4. Functional Modules (Backend & API)
The platform is organized into 15 cohesive feature modules:

1. **Accounts & Authentication**:
   - Phone number OTP-based login / registration.
   - JWT authentication (access & refresh tokens).
   - Custom User model (`is_partner`, `is_staff`, `is_superuser`).
   - Profile completion (Language preference, Base location, Secondary work areas).
2. **Partner Profiles & KYC**:
   - Individual vs Firm registration.
   - PAN card number & document upload.
   - Aadhaar number (masked) & address proof document upload.
   - RERA registration number (optional/mandatory per state rules) & certificate upload.
   - Bank details (Account holder name, Account number, IFSC, Bank name, cancelled cheque / passbook copy).
   - Mandatory admin verification workflow (`PENDING`, `APPROVED`, `REJECTED` with reason).
   - Non-approved partners cannot schedule visits or request payouts.
3. **Properties & Inventory**:
   - Two categories of inventory:
     - **Sourced Units (Partner Submissions)**: Resale units submitted by CPs for Proho evaluation.
     - **Proho Verified Inventory (Selling Pool)**: Approved, verified units available for partners to pitch to buyers.
   - Unit metadata: Society/Project, Tower, Floor, Unit Number, BHK type, Size (sqft), Carpet area, Furnishing, Tenancy status (Vacant/Tenanted), Facing, Base Price, Expected Selling Price.
4. **Property Media**:
   - Multi-asset image uploads (hall, bedrooms, kitchen, bathrooms, balcony, view).
   - Floor plans and video walk-through URLs.
   - Stored in Amazon S3 with CDN delivery; validation of MIME type and max file size (e.g., 10MB per image).
5. **Leads & Referrals**:
   - Customer referral submission (Customer Name, Mobile number, Email, Preferred BHK, Budget, Location).
   - Partner attribution tracking with unique referral link generation.
   - Duplicate referral prevention within cooling-off period (e.g., 60 days).
6. **Offers & Counteroffers**:
   - Sourcing offer: Proho evaluation team issues an offer to the seller/CP within 48 hours.
   - Selling offer: Buyer/CP submits purchase offer; Proho reviews, accepts, rejects, or counteroffers.
   - Strict state machine: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `COUNTERED`, `ACCEPTED`, `REJECTED`, `EXPIRED`.
7. **Bookings & Visits**:
   - Partner schedules visit on behalf of buyer.
   - Slot selection (date and time window).
   - Lockout of overlapping visits for the same unit.
8. **Visit OTP Verification**:
   - Secure visit authorization.
   - One-Time Password generated for confirmed visit slot.
   - Short expiration (300 seconds around visit time window) and attempt limitation (max 3 tries).
   - Partner or site manager submits OTP at door to log physical presence and unlock access.
9. **Commission Rules & Earnings Ledger**:
   - Configurable rules: percentage of agreement value (e.g., 1%, 2%) and/or fixed meeting incentive / festive campaign bonus.
   - Double-entry-style immutable earnings ledger (`CREDIT` on closed deal, `DEBIT` on payout or reversal).
   - Currency strictly in `INR`, calculated with `DecimalField`.
10. **Invoices / Statements**:
    - Automatic generation of commission statements per closed deal.
    - PDF download support with GST breakdown (TDS deductions per tax compliance).
11. **Payout Requests & Manual Processing**:
    - Partner submits payout request against cleared earnings balance.
    - Minimum payout threshold (e.g., ₹5,000).
    - Requires approved KYC and verified bank details.
    - Manual admin review: Admin marks as `PAID` with transaction reference (UTR) and bank proof, or `REJECTED` with reason.
    - Zero automated money transfers — strict human-in-the-loop compliance.
12. **Notifications**:
    - In-app notifications and SMS/Push dispatch for KYC updates, offer updates, visit reminders, OTP issuance, and payout approval.
13. **Audit Trail**:
    - Centralized log of all critical operations: KYC approval/rejection, price changes, offer acceptance, ledger adjustments, payout processing.
    - Records user, action, timestamp, IP address, and before/after snapshot.
14. **Smart-Lock Integration Interface**:
    - Vendor-neutral abstraction layer (`LockProviderInterface`).
    - Mock/Simulated provider for development and testing.
    - Ready for future hardware vendor SDKs (e.g., TTLock, Tuya, Yale) without refactoring domain logic.
15. **Administrative Reporting & CSV Exports**:
    - Sourcing velocity, conversion rate, visit completion rate, partner performance, pending payouts, commission liabilities.
    - CSV/Excel export for finance and audit reconciliation.
