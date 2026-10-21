# Proho Channel Partner Platform — Admin Web Portal

A high-performance, responsive web-based operational management portal built for Proho Operations Leads, Admins, and Superadmins to supervise channel partner activities, inventory verification, negotiations, and financial disbursements.

---

## 1. Technology Stack

- **Framework**: React 19 (`^19.0.0`)
- **Language**: TypeScript (`^5.8.0`)
- **Build Tool**: Vite (`^8.3.5`)
- **Styling**: Vanilla CSS Design System (`src/index.css`) with CSS custom properties, dark-mode glassmorphic cards, and responsive grids (no TailwindCSS)
- **Icons**: `lucide-react`
- **Typography**: Outfit (headings) and Inter (body)

---

## 2. Core Functional Modules

1. **Operations Overview (`OverviewView`)**:
   - Executive KPI cards for Pending KYC, Sourced Properties Under Review, Active Offers & Negotiations, and Pending Partner Payouts.
   - High-priority action queues with direct navigational jumps.

2. **Partner KYC Queue (`KycView` & `KycModal`)**:
   - Status filters (`ALL`, `PENDING`, `APPROVED`, `REJECTED`).
   - Detailed document inspection for PAN, Aadhaar (last 4), and RERA credentials.
   - Modal workflow for one-click approval and mandatory rejection justification notes.

3. **Property Inventory Curation (`PropertiesView` & `PropertyReviewModal`)**:
   - Resale vs. verified inventory management with BHK, pricing, super/carpet area, and unit specs.
   - Sourcing broker attribution and rate/sq.ft analytics.
   - Actions to approve for active marketplace, reject with reason, or archive stale listings.

4. **Offers & Negotiations Queue (`OffersView` & `OfferReviewModal`)**:
   - Supervise formal purchase offers submitted by channel partners on behalf of buyers.
   - Negotiation chain inspection with original offer amount vs. counteroffer terms.
   - Accept, reject, or issue structured counteroffers with terms/notes.

5. **Site Visits & Door Access (`VisitsView`)**:
   - Scheduled property visits with field representative attribution.
   - 6-digit door OTP generation and verification audit status.
   - Cancellation modal with mandatory cancellation reasons.

6. **Commissions & Finance Hub (`FinanceView`, `PayoutDisburseModal`, `NewDealModal`)**:
   - **Payout Requests**: Review partner withdrawal requests with masked bank account and IFSC details.
   - **Disbursements**: One-click disbursement modal requiring bank UTR reference numbers.
   - **Closed Deals & Tax Invoices**: Record registered property sales with automated 2% commission calculations and 5% Section 194H TDS withholding.

7. **Audit Trail & Compliance (`AuditLogsView`)**:
   - Append-only compliance log table recording every administrative decision (actor, timestamp, IP address, target model, and sanitized JSON metadata snapshot).

---

## 3. Local Development

### Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- npm or pnpm

### Getting Started

```bash
# 1. Navigate to the admin portal
cd admin

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start the development server
npm run dev
```

The portal runs at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

The production bundle will be generated in `dist/`.
