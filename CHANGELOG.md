# Changelog

All notable changes to the Proho Channel Partner Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
