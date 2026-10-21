# Proho Platform — Architecture & System Design

## 1. System Overview & Monorepo Structure
The Proho platform is structured as a modular monorepo containing three core applications and shared contracts:

```
Proho-main/
├── backend/                  # Django & Django REST Framework application
│   ├── config/               # Project settings, URL routing, WSGI/ASGI
│   ├── apps/                 # Domain-driven Django applications
│   │   ├── accounts/         # User auth, JWT, profile management
│   │   ├── partners/         # Partner profile, KYC documents, approval workflows
│   │   ├── properties/       # Inventory, units, societies, media uploads
│   │   ├── leads/            # Referral management, attribution tracking
│   │   ├── offers/           # Sourcing & selling offers, counteroffers
│   │   ├── visits/           # Visit bookings, slot scheduling, OTP verification
│   │   ├── finance/          # Commissions, double-entry ledger, payouts, invoices
│   │   ├── notifications/    # Notifications dispatch (push, SMS, in-app)
│   │   ├── audit/            # Append-only audit logs
│   │   └── locks/            # Smart-lock vendor abstraction & mock adapter
│   ├── manage.py
│   ├── requirements.txt      # Pinned Python dependencies
│   ├── requirements-dev.txt  # Testing, linting tools
│   └── pytest.ini
│
├── admin/                    # React + TypeScript Web Dashboard (Vite)
│   ├── src/
│   │   ├── api/              # Typed REST client and service layer
│   │   ├── components/       # Design system & shared UI components
│   │   ├── layouts/          # Navigation, sidebar, header layout
│   │   ├── pages/            # KYC review, Inventory, Leads, Payouts, Audit
│   │   └── hooks/            # TanStack Query & auth hooks
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                   # React Native / Expo Mobile App (iOS & Android)
│   ├── app/                  # Expo Router file-based screens (tabs: home, sourcing, selling, earnings, more)
│   ├── components/           # Reusable UI components & theme tokens
│   ├── hooks/                # Query hooks, auth state, localization
│   ├── services/             # Axios / typed fetch client for /api/v1/
│   ├── constants/            # Colors, spacing, typography (Proho Purple theme)
│   ├── package.json
│   └── app.json
│
└── docs/                     # Authoritative system documentation
```

---

## 2. Backend Architecture & Service Layer
- **Django REST Framework (DRF)**: Serves `/api/v1/` endpoints.
- **Service Layer Pattern**: Business logic, financial arithmetic, and multi-step workflows reside in dedicated service modules (`services.py`) within each Django app rather than inside views or models.
  - *Example*: `KycService.review_submission(...)`, `LedgerService.credit_commission(...)`, `OtpService.verify_visit_otp(...)`.
- **Database Transactions (`@transaction.atomic`)**: Enforced for all state transitions affecting financial balances, payout lifecycle, and OTP consumption.
- **Identifier Strategy**: `UUIDv4` primary keys for all public-facing models to prevent enumeration attacks and preserve distributed scalability.
- **Timestamps**: All timestamps stored in UTC (`models.DateTimeField(auto_now_add=True)`).
- **Financial Precision**: All currency values stored using `models.DecimalField(max_digits=12, decimal_places=2)`. Floating point arithmetic is strictly forbidden.

---

## 3. Authentication & Authorization Flow
- **Authentication**: JWT (JSON Web Tokens) using `djangorestframework-simplejwt`.
  - Short-lived access token (60 minutes).
  - Refresh token (7 days).
- **User Roles & Claims**:
  - `CHANNEL_PARTNER`: Standard mobile app user. Restricted to their own profile, KYC, sourced units, leads, assigned visits, and earnings ledger.
  - `ADMIN`: Backoffice staff. Access to review KYC, manage inventory, schedule visits, and inspect logs.
  - `SUPERADMIN`: Full administrative control, including commission rule modifications, manual payout approvals, and system configuration.
- **Permission Classes**: Explicit DRF permission classes (`IsPartner`, `IsAdminUser`, `IsSuperAdminUser`, `IsOwnerOrAdmin`).

---

## 4. Mobile Client Architecture (React Native & Expo)
- **Framework**: Expo SDK with TypeScript and Expo Router.
- **Server State**: `@tanstack/react-query` for caching, background revalidation, optimistic updates, and offline fallback.
- **Forms & Validation**: `react-hook-form` paired with `zod` for type-safe client-side schema validation.
- **Visual Design System**:
  - Primary color: Deep Proho Purple (`#581c87` / `#5E17EB`), Accent Indigo (`#6366f1`).
  - Font: Clean sans-serif modern typography.
  - Consistent layout: 5 tabs (`Home`, `Sourcing`, `Selling`, `Earnings`, `More`).
  - Bilingual localization provider supporting English and Hindi.

---

## 5. Admin Web Dashboard Architecture
- **Framework**: React 19 + TypeScript powered by Vite.
- **State Management**: TanStack Query + Zustand for auth and modal state.
- **UI & Components**: Clean, high-density data tables, pagination, multi-filter headers, status badges, and actionable drawers for review workflows (KYC documents viewer, payout disbursement modal).

---

## 6. Smart-Lock Interface Abstraction
To future-proof physical lock integrations without vendor lock-in:
```python
# apps/locks/interfaces.py
from abc import ABC, abstractmethod

class SmartLockProviderInterface(ABC):
    @abstractmethod
    def generate_access_code(self, lock_id: str, start_time, end_time) -> str:
        """Generates time-bound PIN code for the door lock."""
        pass

    @abstractmethod
    def unlock_remotely(self, lock_id: str) -> bool:
        """Sends remote unlock command over bridge."""
        pass
```
- In Phase 1–8, `MockLockProvider` implements this interface, simulating PIN generation and unlock signals for automated testing.
- Vendor SDKs (TTLock / Tuya) will plug in during Phase 9 with zero core schema changes.
