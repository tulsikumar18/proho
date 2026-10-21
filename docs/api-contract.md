# Proho Platform — API Contract & Standards

All client-server interactions (mobile app and admin web) use versioned REST endpoints under `/api/v1/`.

---

## 1. Request & Response Conventions

### Success Response Format
Standard individual resource:
```json
{
  "success": true,
  "data": { ... }
}
```

Paginated collection format:
```json
{
  "success": true,
  "count": 128,
  "next": "http://api.proho.in/api/v1/properties/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

### Error Response Format
Standard RFC 7807-inspired error envelope:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": {
      "pan_number": ["Invalid PAN format. Must be 5 uppercase letters, 4 digits, 1 uppercase letter."]
    }
  }
}
```

Standard Error Codes:
- `UNAUTHORIZED`: Invalid or expired JWT token.
- `PERMISSION_DENIED`: User does not possess the required role or ownership.
- `VALIDATION_ERROR`: Field validation failure.
- `NOT_FOUND`: Resource with given ID does not exist.
- `CONFLICT`: Duplicate listing, duplicate referral attribution, or overlapping visit slot.
- `KYC_REQUIRED`: Partner attempted an action (e.g. visit scheduling, payout) requiring approved KYC.
- `OTP_EXPIRED_OR_INVALID`: OTP attempt failed or expired.
- `INSUFFICIENT_FUNDS`: Payout request exceeds cleared ledger balance.

---

## 2. Core API Endpoints

### Accounts & Auth (`/api/v1/auth/`)
- `POST /api/v1/auth/otp/request/`: Send phone OTP for login/registration.
- `POST /api/v1/auth/otp/verify/`: Verify OTP, returns `{ access, refresh, user }`.
- `POST /api/v1/auth/token/refresh/`: Refresh JWT access token.
- `GET /api/v1/auth/me/`: Retrieve current user profile and role.
- `PATCH /api/v1/auth/me/`: Update profile (language, name, base location, work areas).

### Partner & KYC (`/api/v1/partner/`)
- `GET /api/v1/partner/profile/`: Get partner profile, business details, KYC status.
- `POST /api/v1/partner/kyc/`: Submit PAN, Aadhaar, RERA documents.
- `GET /api/v1/partner/kyc/`: View submitted KYC details and status.
- `POST /api/v1/partner/bank-accounts/`: Add or update payout bank account.
- `GET /api/v1/partner/bank-accounts/`: List registered bank accounts.

### Admin KYC Review (`/api/v1/admin/kyc/`)
- `GET /api/v1/admin/kyc/`: List submissions with filter `?status=PENDING`.
- `POST /api/v1/admin/kyc/{id}/approve/`: Approve partner KYC (Admin only).
- `POST /api/v1/admin/kyc/{id}/reject/`: Reject partner KYC with reason (Admin only).

### Properties & Inventory (`/api/v1/properties/`)
- `GET /api/v1/properties/`: List verified Proho inventory (Selling tab) with filters (`bhk`, `society`, `min_price`, `max_price`, `instant_visit`).
- `GET /api/v1/properties/{id}/`: Detail view of property, specs, media gallery.
- `POST /api/v1/properties/source/`: Sourcing submission by partner (3-step unit submission).
- `GET /api/v1/properties/sourced/`: List units submitted by the authenticated partner.
- `POST /api/v1/properties/{id}/media/`: Upload property photo/plan to S3.

### Admin Properties Management (`/api/v1/admin/properties/`)
- `GET /api/v1/admin/properties/sourced/`: Review sourced units for evaluation.
- `POST /api/v1/admin/properties/{id}/evaluate/`: Issue initial valuation / Proho offer.
- `PATCH /api/v1/admin/properties/{id}/publish/`: Publish unit to verified selling pool.

### Leads & Referrals (`/api/v1/leads/`)
- `GET /api/v1/leads/`: List partner's referred buyer leads.
- `POST /api/v1/leads/`: Register new buyer lead (checks 60-day attribution lock and duplicate phone).
- `GET /api/v1/leads/{id}/`: View lead progress, visits, and active offers.
- `PATCH /api/v1/leads/{id}/`: Update customer and interest details.
- `POST /api/v1/leads/referral-tokens/`: Generate secure referral token for approved property.
- `GET /api/v1/leads/referral-tokens/{token}/resolve/`: Public resolution of referral token returning sanitized property and partner metadata.

### Offers & Counteroffers (`/api/v1/offers/`)
- `GET /api/v1/offers/`: List partner or all (admin) offers.
- `POST /api/v1/offers/`: Create draft offer on eligible property.
- `GET /api/v1/offers/{id}/`: Retrieve offer details and counteroffer chain.
- `PATCH /api/v1/offers/{id}/`: Update draft offer.
- `POST /api/v1/offers/{id}/submit/`: Submit draft offer for review.
- `POST /api/v1/offers/{id}/review/`: Admin review (`ACCEPT`, `REJECT` with reason, or `UNDER_REVIEW`).
- `POST /api/v1/offers/{id}/counter/`: Submit counteroffer linked to parent offer.

### Bookings & Visits (`/api/v1/visits/`)
- `GET /api/v1/visits/bookings/`: List bookings.
- `POST /api/v1/visits/bookings/`: Create booking request.
- `GET /api/v1/visits/bookings/{id}/`: Booking details.
- `POST /api/v1/visits/bookings/{id}/cancel/`: Cancel booking.
- `POST /api/v1/visits/bookings/{id}/confirm/`: Admin confirm booking.
- `GET /api/v1/visits/`: List scheduled and past visits for the partner.
- `POST /api/v1/visits/`: Book a property visit slot (Requires Approved KYC, 1-hour slot between 09:00 and 19:00, no slot conflict).
- `GET /api/v1/visits/{id}/`: Retrieve visit details.
- `POST /api/v1/visits/{id}/cancel/`: Cancel scheduled visit (Requires >= 2 hours prior to slot).
- `POST /api/v1/visits/{id}/reschedule/`: Reschedule visit.
- `POST /api/v1/visits/{id}/otp/request/`: Generate cryptographically secure 6-digit OTP (dev preview in non-prod).
- `POST /api/v1/visits/{id}/otp/verify/`: Verify OTP at door (Partner / Site staff, max 3 attempts, 300s expiry, replay protection).

### Earnings & Finance (`/api/v1/finance/`)
- `GET /api/v1/finance/summary/`: Summary of total earned, available balance, locked balance.
- `GET /api/v1/finance/ledger/`: Paginated transaction ledger entries (`CREDIT`/`DEBIT`).
- `POST /api/v1/finance/payouts/`: Request payout withdrawal (Min ₹5,000, Approved KYC).
- `GET /api/v1/finance/payouts/`: List partner payout requests and statuses.
- `GET /api/v1/finance/invoices/{id}/download/`: Download commission invoice PDF.

### Admin Finance & Payouts (`/api/v1/admin/finance/`)
- `GET /api/v1/admin/finance/payouts/`: List pending payout requests.
- `POST /api/v1/admin/finance/payouts/{id}/mark-paid/`: Mark payout as PAID with UTR & bank reference.
- `POST /api/v1/admin/finance/payouts/{id}/reject/`: Reject payout with reason.
- `POST /api/v1/admin/finance/ledger/credit/`: Credit deal commission to partner.

### Audit & Reports (`/api/v1/admin/reports/`)
- `GET /api/v1/admin/audit-logs/`: Filterable system audit trail.
- `GET /api/v1/admin/reports/export-csv/`: Export financial & visit CSV summaries.
