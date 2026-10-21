# Proho Platform — Testing & Verification Strategy

## 1. Principles
- **No Unverified Features**: Every feature module must have accompanying automated tests.
- **Strict Separation**: Unit tests verify services and utilities in isolation; integration tests verify DRF endpoints, authorization rules, database transactions, and error status codes.
- **Real Database Testing**: Tests run against a local PostgreSQL test database to validate constraints, UUID generation, and transactions.

---

## 2. Test Structure & Tools

### Backend (Python / Django)
- **Framework**: `pytest`, `pytest-django`, `model_bakery` for fixtures, `pytest-cov` for coverage.
- **Coverage Goal**: Minimum 85% branch coverage on service classes and API permissions.
- **Directory Layout**:
  ```
  backend/apps/<app_name>/tests/
  ├── test_models.py
  ├── test_services.py
  ├── test_views.py
  └── test_permissions.py
  ```

### Admin Web & Mobile Frontend
- **Linting & Formatting**: `eslint`, `prettier`, and `typescript` (`tsc --noEmit`).
- **Component & Unit Testing**: Vitest and React Testing Library.

---

## 3. Mandatory Test Scenarios per Module

1. **Auth & RBAC**:
   - Partner cannot access admin endpoints (`403 Forbidden`).
   - Unauthenticated requests to protected endpoints return `401 Unauthorized`.
   - Partner A cannot read or edit Partner B's KYC, bank accounts, or leads (`403` or `404`).
2. **KYC Workflow**:
   - Partner submitting valid PAN/Aadhaar transitions state to `PENDING`.
   - Partner cannot approve their own KYC.
   - Admin approving KYC enables visit and payout eligibility.
3. **Visits & OTP**:
   - Partner without approved KYC gets `400 Bad Request` or `403 Forbidden` when attempting to book a visit.
   - OTP cannot be verified before or after its expiry window.
   - 3 consecutive failed OTP attempts locks the OTP.
   - Re-submitting an already consumed OTP fails.
4. **Referral Attribution**:
   - Registering a customer already registered within 60 days by another partner fails with conflict.
   - Registering after 60 days of inactivity succeeds.
5. **Ledger & Payouts**:
   - Attempting to request a payout below ₹5,000 fails.
   - Attempting to request a payout exceeding cleared balance fails with `INSUFFICIENT_FUNDS`.
   - Payout requests are idempotent; double-clicking does not create two debits.
   - Approving a payout transitions status to `PAID` and requires a valid UTR reference.

---

## 4. Test Commands

### Backend Tests
```bash
# In backend/
pytest -v
pytest --cov=apps --cov-report=term-missing
```

### Type Checking & Linting
```bash
# In backend/
flake8 apps/
black --check apps/

# In admin/
npm run lint
npm run typecheck
npm test

# In mobile/
npm run lint
npm run typecheck
```
