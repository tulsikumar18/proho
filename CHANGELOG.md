# Changelog

All notable changes to the Proho Channel Partner Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [Phase 7] - 2026-10-21
### Added
- **Cross-Platform Mobile Application (React Native + Expo SDK 52 + TypeScript)**:
  - Complete, faithful implementation of all 15 visual reference design screens in `mobile/`:
    - **Language Selection Screen (`LanguageSelectScreen`)**: Bilingual choice (`English` vs. `हिंदी`) with custom Proho purple branding, card selection radio circles, and continue navigation.
    - **Onboarding Walkthrough Carousel (`OnboardingCarouselScreen`)**: 3-slide visual carousel with custom vector graphics:
      1. *"Earn more on every unit"* (Commission & 72-hour bank payout).
      2. *"Instant visits with door OTP"* (Smart-lock door access with 6-digit OTP).
      3. *"Track earnings & unit status"* (Live unit tracking, offers, payouts, and invoices).
    - **Phone OTP Login Screen (`LoginScreen`)**: Mobile number input with `+91` country code selector, Terms & Privacy disclaimer, and 6-box OTP verification with resend support.
    - **Partner Name Setup Screen (`NameSetupScreen`)**: *"What's your name?"* (First Name required, optional Last Name).
    - **Operating Territory Screen (`LocationSetupScreen`)**:
      - Step 1: Base Location dropdown picker (e.g. `Greater Noida West`, `Noida`, `Greater Noida`, `Ghaziabad`, `Gurugram`, `Delhi`, `Faridabad`, `Yamuna Expressway`).
      - Step 2: Searchable multi-select chips covering **all 60+ micro-market locations** in the Delhi NCR region (`Central Noida`, `Crossing Republik`, `Gaur City`, `Indirapuram`, `Noida Expressway`, `Sector 16B`, `Techzone`, `Knowledge Park`, `Pari Chowk`, `Raj Nagar Extension`, `Wave City`, etc.).
    - **Home Tab Screen (`HomeScreen`)**:
      - Header greeting (`"Namaste, Kritaank"`), Language switcher (`अ/A`), and Notification bell.
      - Navratri Sales Dhamaka promotional banner (2% commission + iPhone 17 + ₹10,000 meeting incentive).
      - 2x2 Quick Action Grid: *Submit Seller Unit*, *Schedule a visit*, *Sell Proho Unit*, *Share inventory*.
      - In-App Guided Tour overlay card (`InAppGuideModal` - 1/6 steps).
      - Priority *Complete your KYC* prompt card.
      - *My Tasks* section and floating support call FAB (`SupportFab`).
    - **Sourcing Tab Screen (`SourcingScreen`)**:
      - *"Submit your first unit"* hero with 3-step "HOW IT WORKS" guide:
        1. Submit a unit -> 2. Get a Proho offer in 48 hours -> 3. Earn commission upon closing.
      - Interactive 3-step property resale submission modal (`SubmitUnitModal`).
    - **Selling Tab Screen (`SellingScreen`)**:
      - Live unit counter (*"38 units available"*) and *Share List* header action.
      - Search input (*"Search society, sector, BHK"*) and filter modal trigger.
      - Quick filter chips (`Instant visit`, `2 BHK`, `3 BHK`, `4 BHK`).
      - Rich property cards with high-res photos, `2% Commission + iPhone 17` badges, specs, tenancy/lock tags, pricing (`₹79 L` / `₹1.78 Cr`), rate/sqft, and direct *Share* & *Visit* triggers.
    - **Earnings Tab Screen (`EarningsScreen`)**:
      - Purple gradient hero displaying *Total Earned* (`₹0`, `+₹0 This month`).
      - 3 KPI summary cards: `Pending payout` (clock), `Paid` (check), and `Referrals` (gift).
      - Quick action links for unit submission and visit scheduling.
    - **More Tab Screen (`MoreScreen`)**:
      - Profile header with initials avatar (`KK`), name, and masked phone (`+91 80××××6342`).
      - Business section: *CP Policy*, *My policy tracker* (60-day attribution lock), and *Invoices*.
      - Profile section: *My details & KYC* with dynamic status indicator.
      - App section: *Language*, *App guide* (restart guided tour), and *Help & FAQ*.
      - *Log out* button and app version footer (`App Versions · v3.2.0`).
    - **Interactive Modals**:
      - `KycModal`: PAN, Aadhaar (last 4), and RERA upload workflow.
      - `ScheduleVisitModal`: Slot picker, client details, and 6-digit door OTP generation.
      - `SubmitUnitModal`: 3-step resale submission sheet.
      - `ShareModal`: WhatsApp and PDF referral flyer sharing with partner attribution token.
      - `InvoicesModal`: Section 194H TDS breakdown statement.
  - Metro bundler export passing cleanly (`Android Bundled 13803ms index.ts (2675 modules)`).
  - TypeScript strict compile verification passing (`tsc --noEmit`, 0 errors).

## [Phase 6] - 2026-10-21
### Added
- **Admin Web Dashboard (React 19 + TypeScript + Vite)**:
  - High-performance, responsive admin portal in `admin/` built with React 19, TypeScript 5.8, and Vite.
  - Bespoke Vanilla CSS design system (`admin/src/index.css`) featuring modern dark theme, glassmorphic cards, responsive KPI grids, accessible form controls, modals, and status badges (zero TailwindCSS dependency).
  - Clean modular architecture:
    - **Overview Module (`OverviewView`)**: Operations KPI summary cards for pending KYC, properties under review, active offers/negotiations, and pending payouts, with priority action shortcuts.
    - **Partner KYC Queue (`KycView` & `KycModal`)**: Filterable verification queue for PAN, Aadhaar (last 4), and RERA documents, featuring document inspection links, one-click approval, and mandatory rejection justification notes.
    - **Property Inventory Curation (`PropertiesView` & `PropertyReviewModal`)**: Sourced resale listings vs. Proho verified selling inventory, unit specifications, floor numbers, carpet/super areas, pricing analytics, and administrative approval, rejection, or archiving workflows.
    - **Offers & Negotiations Queue (`OffersView` & `OfferReviewModal`)**: Supervise formal buyer purchase offers, inspect counteroffer chains, and issue structured counteroffers with updated price terms and negotiation notes.
    - **Site Visits & Door Access (`VisitsView`)**: Calendar overview of scheduled property visits, field representative attribution, door OTP status monitoring, and visit cancellation with mandatory client rescheduling notes.
    - **Commissions & Finance Hub (`FinanceView`, `PayoutDisburseModal`, `NewDealModal`)**:
      - Partner payout request queue with masked bank account and IFSC verification.
      - Disbursement workflow requiring bank UTR transaction references with instant audit trail.
      - Deal recording and closure modal calculating 2% gross commission and automated 5% Section 194H TDS withholding with tax invoice generation (`PROHO/YYYY-YY/XXXX`).
    - **System Audit Trail (`AuditLogsView`)**: Append-only compliance log table recording every administrative action, actor, timestamp, IP address, target model, and sanitized JSON metadata snapshot.
  - State store (`adminStore`) in `admin/src/services/api.ts` providing operational reactive state and offline/fallback mock data for seamless testing and demonstration.
  - Production build passing cleanly via `tsc -b && vite build` (zero type errors, 284kB bundle).

## [Phase 5] - 2026-10-21
### Added
- `apps.finance` application for commission calculations, double-entry immutable ledger, tax invoices, and payout processing:
  - `CommissionRule` model supporting percentage (e.g. 2.00%) or fixed monetary bonus amounts in INR.
  - `Deal` model linking properties, partners, referred buyer leads, and accepted offers with registration tracking (`PENDING_REGISTRATION`, `REGISTERED`, `CANCELLED`).
  - `LedgerEntry` model enforcing strict immutable double-entry accounting with running balance validation (cannot be negative), concurrency row locking via `select_for_update()`, and immutable record deletion safeguards.
  - `Invoice` model generating sequential tax statements (`PROHO/YYYY-YY/XXXX`) with automatic Section 194H TDS calculation (5% for approved KYC with PAN, 20% for unverified/missing PAN).
  - `PayoutRequest` model managing partner withdrawal workflows (`REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `PAID`, `REJECTED`) with idempotency keys and mandatory bank transaction UTR reference.
  - `FinanceService` domain logic:
    - `get_financial_summary`: Real-time cleared balance, lifetime total earned, pending payouts, and available withdrawal balance.
    - `record_ledger_entry`: Atomic double-entry credits and debits with non-negative running balance validation and append-only audit trail.
    - `register_deal_and_credit_commission`: Deal closing workflow computing gross commission, applying TDS deduction, generating sequential invoice, crediting net payable to ledger, and closing linked buyer lead.
    - `reverse_deal_commission`: Commission reversal debiting partner balance and cancelling deal and invoice.
    - `create_payout_request`: Withdrawal validation enforcing Approved KYC, verified partner bank account, minimum ₹5,000 threshold, available balance checks, and preventing duplicate pending requests.
    - `review_payout` and `disburse_payout`: Multi-step admin authorization requiring bank UTR reference for disbursement and atomic ledger debit.
  - Partner endpoints:
    - `GET /api/v1/finance/summary/`: Partner earnings, balance, and payout summary.
    - `GET /api/v1/finance/ledger/`: Paginated double-entry ledger entries.
    - `GET /api/v1/finance/invoices/`: List commission invoices and statements.
    - `GET /api/v1/finance/invoices/{id}/`: Invoice details with TDS breakdown.
    - `GET /api/v1/finance/payouts/`: List partner payout requests.
    - `POST /api/v1/finance/payouts/`: Submit payout withdrawal request (minimum ₹5,000, Approved KYC).
    - `GET /api/v1/finance/payouts/{id}/`: Payout request status and details.
  - Administrative finance endpoints:
    - `GET /api/v1/admin/finance/payouts/`: Filterable list of all partner payout requests.
    - `GET /api/v1/admin/finance/payouts/{id}/`: Payout detail.
    - `POST /api/v1/admin/finance/payouts/{id}/review/`: Review payout (`UNDER_REVIEW`, `APPROVED`, or `REJECTED` with reason).
    - `POST /api/v1/admin/finance/payouts/{id}/disburse/`: Mark payout `PAID` with bank UTR reference and atomic ledger debit.
    - `GET /api/v1/admin/finance/deals/`: List all deals.
    - `POST /api/v1/admin/finance/deals/`: Create deal (with optional immediate registration and commission crediting).
    - `POST /api/v1/admin/finance/deals/{id}/register/`: Register deal and issue invoice.
    - `POST /api/v1/admin/finance/deals/{id}/reverse/`: Reverse registered deal commission with audit justification.
    - `POST /api/v1/admin/finance/ledger/adjustment/`: Post administrative ledger adjustment.
- 16 new automated pytest tests (95 tests total across the platform) verifying ledger invariants, commission formulas, TDS rates, deal closures, reversals, KYC payout restrictions, balance thresholds, and admin workflows with 88% total code coverage.

## [Phase 4] - 2026-10-21
### Added
- `apps.leads` application for leads, referral attribution, and secure token sharing:
  - `Lead` model tracking customer contact info, property interest, explicit lifecycle (`NEW`, `CONTACTED`, `VISITING`, `OFFER_MADE`, `CLOSED`, `LOST`, `EXPIRED`), 60-day attribution lock-in window (`attribution_expires_at`), and `last_interaction_at`.
  - `ReferralToken` model supporting opaque, cryptographically secure 32-character URL tokens (`secrets.token_urlsafe`) linking partner profiles to approved properties.
  - Duplicate referral attribution engine in `LeadService`: duplicate customer phone submissions within 60 days by competing partners are rejected with privacy safeguards without disclosing previous partner data.
  - Automatic attribution extension upon site visits and offer submissions.
  - Endpoints:
    - `GET /api/v1/leads/`: List partner's buyer leads.
    - `POST /api/v1/leads/`: Create lead with 60-day attribution lock and duplicate phone check.
    - `GET /api/v1/leads/{id}/`: Lead detail view.
    - `PATCH /api/v1/leads/{id}/`: Update customer and interest details.
    - `POST /api/v1/leads/referral-tokens/`: Generate referral token for approved property.
    - `GET /api/v1/leads/referral-tokens/{token}/resolve/`: Public resolution returning sanitized property details and partner attribution without leaking private contact info or internal IDs.
- `apps.offers` application for offer and counteroffer lifecycle management:
  - `Offer` model with `DecimalField(max_digits=14, decimal_places=2)` for INR amounts, explicit lifecycle (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `COUNTERED`, `ACCEPTED`, `REJECTED`, `EXPIRED`), notes, rejection reason, validity expiration, and self-referential `counter_to` foreign key for full negotiation audit chains.
  - `OfferService` ensuring atomic status transitions, partner draft editing, admin review justification, counteroffer generation, and automatic lead status synchronization.
  - Endpoints:
    - `GET /api/v1/offers/`: List partner or all (admin) offers.
    - `POST /api/v1/offers/`: Create draft offer.
    - `GET /api/v1/offers/{id}/`: Retrieve offer details.
    - `PATCH /api/v1/offers/{id}/`: Update draft offer.
    - `POST /api/v1/offers/{id}/submit/`: Submit draft offer.
    - `POST /api/v1/offers/{id}/review/`: Admin review (`ACCEPT`, `REJECT`, `UNDER_REVIEW`).
    - `POST /api/v1/offers/{id}/counter/`: Counteroffer linking to parent offer.
- `apps.visits` application for bookings, site visits, and OTP door verification:
  - `Booking` model with lifecycle (`REQUESTED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`), linking property, lead, and partner.
  - `Visit` model supporting scheduled 1-hour slots (09:00 AM - 07:00 PM), representative assignment, lifecycle (`SCHEDULED`, `VERIFIED_COMPLETED`, `CANCELLED`, `NO_SHOW`, `FAILED_VERIFICATION`), and cancellation reasons.
  - `VisitOtp` model storing salted PBKDF2 hashes of 6-digit cryptographic verification codes, 300-second expiration, 3-attempt brute-force protection, replay protection, and one-time consumption.
  - `BookingService` and `VisitService` enforcing partner approved KYC prerequisite, unit slot non-overlap concurrency, 2-hour cancellation window, and lead attribution extension upon visit completion.
  - Endpoints:
    - `GET /api/v1/visits/bookings/`: List bookings.
    - `POST /api/v1/visits/bookings/`: Create booking request.
    - `GET /api/v1/visits/bookings/{id}/`: Booking details.
    - `POST /api/v1/visits/bookings/{id}/cancel/`: Cancel booking.
    - `POST /api/v1/visits/bookings/{id}/confirm/`: Admin confirm booking.
    - `GET /api/v1/visits/`: List scheduled visits.
    - `POST /api/v1/visits/`: Schedule site visit (requires Approved KYC, 1-hour slot, no slot conflict).
    - `GET /api/v1/visits/{id}/`: Retrieve visit details.
    - `POST /api/v1/visits/{id}/cancel/`: Cancel visit (requires >= 2 hours prior to slot).
    - `POST /api/v1/visits/{id}/reschedule/`: Reschedule visit.
    - `POST /api/v1/visits/{id}/otp/request/`: Request 6-digit OTP (development preview in non-prod, plaintext never stored in DB).
    - `POST /api/v1/visits/{id}/otp/verify/`: Verify OTP at door (atomic consumption, brute-force lockout, marks visit completed).
- 25 new automated pytest tests (79 tests total across the platform) with 89% total code coverage and 0 linting errors.

## [Phase 3] - 2026-10-21
### Added
- `apps.properties` Django application for property and inventory management.
- `Property` model with UUID PK, `owner` foreign key to `PartnerProfile`, status workflow (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `ARCHIVED`), BHK choices, pricing in INR, and auto-computed `rate_per_sqft`.
- `PropertyMedia` model supporting property images, floor plans, cover image designation, and display ordering.
- `PropertyService` enforcing strict partner listing ownership, draft editing safeguards, validation of mandatory fields before submission, admin approval/rejection with mandatory justification, media attachment (10MB limit, JPG/PNG/WebP), and audit trail logging.
- Partner API endpoints:
  - `GET /api/v1/properties/`: List authenticated partner's properties.
  - `POST /api/v1/properties/`: Create draft property listing.
  - `GET /api/v1/properties/{id}/`: Retrieve partner property details.
  - `PATCH /api/v1/properties/{id}/`: Update draft/rejected property.
  - `DELETE /api/v1/properties/{id}/`: Delete draft property.
  - `POST /api/v1/properties/{id}/submit/`: Submit draft property for review.
  - `GET /api/v1/properties/{id}/media/`: List media assets for property.
  - `POST /api/v1/properties/{id}/media/`: Upload media photo/document.
  - `DELETE /api/v1/properties/{id}/media/{media_id}/`: Remove media item.
  - `PATCH /api/v1/properties/{id}/media/{media_id}/`: Update cover/caption/order.
- Public/Selling inventory discovery endpoint:
  - `GET /api/v1/properties/inventory/`: Browse verified approved inventory with filters (`bhk`, `society`, `min_price`, `max_price`, `search`).
- Administrative property management endpoints:
  - `GET /api/v1/admin/properties/`: List all properties with status filter.
  - `POST /api/v1/admin/properties/{id}/review/`: Approve or reject property listing.
  - `POST /api/v1/admin/properties/{id}/archive/`: Archive property listing.
- 15 new automated pytest tests (54 tests total across the project) verifying lifecycle transitions, ownership isolation, media restrictions, and review actions with 92% total code coverage.

## [Phase 2] - 2026-10-21
### Added
- Phone OTP authentication flow (`POST /api/v1/auth/otp/request/` and `POST /api/v1/auth/otp/verify/`) with 300-second expiration, 3-attempt brute-force protection, salted SHA256/PBKDF2 hashing, and JWT issuance (`access` and `refresh`).
- User profile endpoints (`GET /api/v1/auth/me/` and `PATCH /api/v1/auth/me/`) supporting bilingual preference (`en`/`hi`) and name management.
- `apps.partners` application with models:
  - `PartnerProfile`: business profile, base location, work areas list, RERA number, and KYC status.
  - `KycSubmission`: document upload tracking for PAN, Aadhaar (last 4 digits only), and address proof.
  - `BankAccount`: payout bank account records with masked account numbers (`****1234`) and regex-validated IFSC codes (`^[A-Z]{4}0[A-Z0-9]{6}$`).
- Post-save signal automatically creating a `PartnerProfile` whenever a `CHANNEL_PARTNER` user is created.
- `KycService` enforcing PAN format validation (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`), Aadhaar 4-digit masking, 5MB file size limits, and manual admin review workflows (`APPROVED` or `REJECTED` with mandatory justification).
- Administrative KYC review endpoints (`GET /api/v1/admin/kyc/` with status filtering, `GET /api/v1/admin/kyc/{id}/`, and `POST /api/v1/admin/kyc/{id}/review/`).
- Automated audit log recording for `KYC_SUBMITTED`, `KYC_APPROVED`, and `KYC_REJECTED` actions with actor, IP, and sanitized metadata.
- 20 new automated pytest tests (39 tests total) covering OTP auth, KYC submission, PAN/Aadhaar/IFSC validation, file size limits, admin review, and partner isolation with 95% total code coverage.

## [Phase 1] - 2026-10-21
### Added
- SQLite-first backend architecture (`backend/db.sqlite3`) for local development without PostgreSQL dependencies.
- Documented PostgreSQL production migration configuration and fail-safe environment variable checks (`DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).
- Custom `User` model (`apps.accounts.models.User`) with UUID primary key, phone-based identity, preferred language (`en`/`hi`), and explicit roles (`CHANNEL_PARTNER`, `ADMIN`, `SUPERADMIN`).
- `CustomUserManager` supporting phone-based user and superuser creation.
- Custom authentication permissions: `IsPartner`, `IsAdmin`, `IsSuperAdmin`, `IsOwnerOrAdmin`.
- RFC-7807 inspired standardized API exception handler returning `{ "success": false, "error": { "code", "message", "details" } }`.
- Request Correlation ID middleware (`X-Correlation-ID`) with context-var propagation and non-sensitive structured logging.
- Read-only, append-only `AuditLog` model and `AuditService` with automatic redaction of sensitive credentials (passwords, tokens, OTPs, full bank details).
- OpenAPI documentation generator using `drf-spectacular` (`/api/v1/schema/`, `/api/v1/docs/`).
- 19 automated pytest tests in SQLite test environment covering user creation, permissions, errors, correlation ID, audit logging, and database configuration with 92% code coverage.
- Configured code quality tools: `flake8` and `black`.

## [Phase 0] - 2026-10-21
### Added
- Initialized empty Git repository on branch `main`.
- Defined comprehensive monorepo architecture for `backend/`, `admin/`, and `mobile/`.
- Created product requirements document (`docs/requirements.md`) covering all 15 feature modules, user roles, and reference mobile screens.
- Defined authoritative business rules (`docs/business-rules.md`) for KYC, property sourcing, duplicate referral attribution, OTP rules, commission calculations, and manual payouts.
- Created open decisions log (`docs/open-decisions.md`) tracking assumptions and vendor dependencies.
- Created system architecture document (`docs/architecture.md`) detailing service layer patterns, REST API standards, and smart lock abstraction.
- Created relational database schema specification (`docs/database-schema.md`) with models, fields, types, indexes, and Mermaid ER diagram.
- Created REST API contract (`docs/api-contract.md`) with request/response schemas, HTTP error codes, and endpoint specifications.
- Created security specification (`docs/security.md`) detailing RBAC, Aadhaar masking, private S3 presigned URLs, OTP brute-force limits, and financial transaction safeguards.
- Created testing strategy (`docs/testing.md`) covering pytest, branch coverage expectations, and critical scenario test matrices.
- Created deployment and infrastructure specification (`docs/deployment.md`) for AWS Lightsail, managed PostgreSQL, S3, and Expo EAS.
- Added root `.gitignore` and `.env.example`.
- Created backend, admin, and mobile directory placeholders and setup guides.
