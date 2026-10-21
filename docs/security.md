# Proho Platform — Security & Authorization Architecture

## 1. Threat Model & Security Posture
The Proho platform handles financial transactions, commission balances, identity documents (PAN, Aadhaar), and real-time physical access (OTPs). The security architecture enforces multi-layered defense-in-depth across the application, database, and infrastructure layers.

---

## 2. Authentication & Session Security
- **JWT Cryptography**: Signed with `HMAC-SHA256` using Django secret key.
- **Short-Lived Access Tokens**: Lifetime restricted to 60 minutes. Refresh tokens restricted to 7 days with rotation enabled.
- **Revocation / Blacklisting**: Blacklist enabled via `rest_framework_simplejwt.token_blacklist` to support instant logout and session invalidation.

---

## 3. Strict Role-Based Access Control (RBAC)
Every viewset and endpoint implements explicit permissions:
- `IsPartner`: Authenticated user with role `PARTNER`. Restricts object-level querysets via `get_queryset(self)` so partners cannot see any other partner's data.
- `IsAdmin`: Authenticated staff user with permission to review KYC, manage property statuses, and inspect visits.
- `IsSuperAdmin`: Dedicated high-risk permission required to disburse payouts, reverse ledger transactions, or modify commission rules.
- **Zero Frontend-Only Security**: Hiding buttons in the React dashboard or mobile app is treated solely as a UI affordance. Direct API calls are validated at the DRF layer.

---

## 4. Sensitive Data Handling & Privacy
- **Aadhaar Protection**: The full 12-digit Aadhaar number is **never stored** in plaintext. Only the last 4 digits are retained for verification.
- **Document Storage**: KYC documents (PAN card photos, cancelled cheques, address proofs) are stored in an Amazon S3 private bucket with public access strictly blocked.
- **Presigned URLs**: Access to KYC files is granted exclusively through short-lived (15 minutes) AWS S3 Presigned URLs generated only for authorized admins or the document owner.
- **Zero Logging Policy**: Application logs, Sentry traces, and audit logs filter out:
  - Phone OTPs
  - Passwords
  - Full Bank Account Numbers
  - Document binaries

---

## 5. OTP Integrity & Anti-Brute-Force Safeguards
- **Hashing**: OTPs are hashed using PBKDF2/SHA-256 before storage; raw OTP is never stored in the database.
- **Rate Limiting**: Rate limits enforced per phone number (max 3 OTP requests per 15 minutes) and per IP address.
- **Attempt Locking**: A maximum of 3 failed verification attempts is allowed per visit slot. On the 3rd failed attempt, the OTP is destroyed, and the visit status transitions to `FAILED_VERIFICATION`.
- **Replay Protection**: OTP records include an `is_consumed` boolean and a `consumed_at` timestamp. After a single successful verification, subsequent verification attempts fail.

---

## 6. Financial Integrity & Concurrency Safeguards
- **Database Transactions (`select_for_update`)**: When executing payout requests, ledger crediting, or reversals, rows for the partner's wallet/ledger are locked with `select_for_update()` to prevent race conditions.
- **Idempotency Keys**: Payout submission and manual payout approval endpoints accept an `Idempotency-Key` HTTP header to prevent double payments from duplicate client clicks or network retries.
- **Double-Entry Ledger Invariant**: Every debit is linked to a payout or reversal record; running balances are recalculated and checked against the sum of ledger entries.
- **Manual Human-in-the-Loop**: Direct automated payment gateway payouts are disabled. Payouts require an authorized administrator to manually review, disburse, and provide a verified bank UTR code.

---

## 7. Media & File Upload Protections
- **MIME Type Whitelist**: Only `image/jpeg`, `image/png`, `image/webp`, and `application/pdf` are accepted.
- **File Magic Byte Inspection**: File headers are validated using `python-magic` to prevent extension spoofing.
- **Size Limits**:
  - Property images: Maximum 10MB per file.
  - KYC documents: Maximum 5MB per file.
- **Filename Sanitization**: Uploaded files are renamed using cryptographic UUIDs before being saved to S3.
