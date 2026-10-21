# Changelog

All notable changes to the Proho Channel Partner Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
