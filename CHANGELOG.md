# Changelog

All notable changes to the Proho Channel Partner Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
