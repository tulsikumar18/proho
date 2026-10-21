# Proho Channel Partner Platform

A modern real estate channel partner platform connecting cross-platform mobile apps for property brokers, an operations admin dashboard, and a secure Django REST API.

---

## 1. Monorepo Structure

```
Proho-main/
├── backend/            # Python 3.10+, Django, Django REST Framework, PostgreSQL
├── admin/              # React 19, TypeScript, Vite, TanStack Query
├── mobile/             # React Native, Expo SDK, TypeScript, Expo Router
├── docs/               # System architecture, schemas, business rules, & API specs
├── CHANGELOG.md        # Release and phase history
├── .env.example        # Master environment configuration template
└── README.md           # Getting started guide (this file)
```

---

## 2. Documentation Index

The following authoritative specifications guide the project:

- [Product Requirements](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/requirements.md): User stories, visual reference screens, and 15 feature modules.
- [Business Rules](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/business-rules.md): KYC policies, referral locks, OTP validation rules, commission formulas, and payout controls.
- [Open Decisions](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/open-decisions.md): Active assumptions and unresolved questions.
- [Architecture & System Design](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/architecture.md): Service layer, boundary separation, JWT auth, and smart lock abstraction.
- [Database Schema](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/database-schema.md): Complete PostgreSQL tables, fields, constraints, and ER diagram.
- [API Contract](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/api-contract.md): REST conventions, error codes, and endpoint signatures.
- [Security Architecture](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/security.md): Sensitive data protection, Aadhaar masking, S3 presigned URLs, and financial idempotency.
- [Testing Strategy](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/testing.md): Automated pytest suite, RBAC verification, and coverage requirements.
- [Deployment Guide](file:///Users/tulsikumaryadav/Downloads/Proho-main/docs/deployment.md): AWS Lightsail, S3, RDS PostgreSQL, and Expo EAS builds.

---

## 3. Local Prerequisites

Ensure the following tools are installed on your machine:
- **Python**: 3.10+ (`python3 --version`)
- **SQLite 3**: Built into Python standard library (`sqlite3`)
- **Node.js**: 20+ (`node --version`)
- **npm**: 10+ (`npm --version`)
- **Git**: (`git --version`)
*(Note: PostgreSQL is required for production AWS deployment, but local development uses SQLite 3 without requiring a PostgreSQL server).*

---

## 4. Getting Started

### Master Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```

### Backend (Django REST Framework)
Local development runs on SQLite by default:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
python manage.py migrate
python manage.py runserver
```

Run automated backend tests:
```bash
pytest -v
pytest --cov=apps --cov-report=term-missing
```

### Admin Web (React + TypeScript)
```bash
cd admin
npm install
npm run dev
```

### Mobile Application (Expo)
```bash
cd mobile
npm install
npx expo start
```

---

## 5. Development Phases Roadmap
- **Phase 0**: Requirements, architecture, repository and local development setup. *(COMPLETED)*
- **Phase 1**: Django project, SQLite-first setup, custom user model, migrations, permissions, and test foundation. *(COMPLETED)*
- **Phase 2**: Authentication (Phone OTP & JWT), partner profiles, KYC submission, and manual admin review. *(COMPLETED)*
- **Phase 3**: Property inventory, media upload, listing approval, and search. *(COMPLETED)*
- **Phase 4**: Leads, referral attribution, offers, bookings, visits, and OTP verification. *(COMPLETED)*
- **Phase 5**: Commission rules, earnings ledger, statements, payout requests, and manual payout decisions. *(NEXT)*
- **Phase 6**: Admin web dashboard for all required operational workflows.
- **Phase 7**: Mobile application integration, notifications, referral sharing, and full user flows.
- **Phase 8**: Security review, integration tests, end-to-end testing, deployment, and release preparation.
- **Phase 9**: Smart-lock integration after vendor selection.
