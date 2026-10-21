# Agent Guidelines — Proho Platform

## 1. Role & Engineering Standards
Act as a senior full-stack engineer and architect. Follow clean architecture, strict authorization, and systematic automated verification. Work incrementally, one phase at a time. Never implement unrequested features ahead of time.

## 2. Database Policy: SQLite-First Development
- **Local Development**: Built-in SQLite 3 (`backend/db.sqlite3`).
  - Do NOT require a running PostgreSQL server for local development.
  - When `DB_ENGINE` is unset or empty, Django defaults to SQLite.
- **Production Deployment**: PostgreSQL on AWS (Lightsail/RDS).
  - Selected explicitly via `DB_ENGINE=django.db.backends.postgresql`.
  - Never silently fall back to SQLite when PostgreSQL is configured.
  - Avoid raw SQL or SQLite-specific features to guarantee seamless migration to PostgreSQL.

## 3. Technology Stack
- **Backend**: Python 3.10+, Django 5.0, DRF 3.15, SimpleJWT, `drf-spectacular`, SQLite (local), PostgreSQL (prod).
- **Mobile**: React Native, Expo SDK, TypeScript, Expo Router, TanStack Query.
- **Admin**: React 19, TypeScript, Vite.

## 4. Verification Workflow
Before submitting any task:
1. `python manage.py check`
2. `python manage.py makemigrations --check --dry-run`
3. `pytest` (all tests must pass with >= 85% coverage)
4. `flake8 apps config` and `black --check apps config`
5. Report actual commands and outputs truthfully.
