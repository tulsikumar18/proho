# Proho Platform — Deployment & Infrastructure Guide

## 1. Production Architecture Overview
- **Compute**: AWS Lightsail Linux instance (Ubuntu 22.04 LTS, Gunicorn + Nginx reverse proxy).
- **Database**: Managed PostgreSQL (AWS Lightsail Managed Database or AWS RDS PostgreSQL 15+).
- **Local vs Production**: Development utilizes local SQLite 3 (`backend/db.sqlite3`). Production switches to PostgreSQL via `DB_ENGINE=django.db.backends.postgresql`.

---

## 2. SQLite to PostgreSQL Production Migration Procedure
Before deploying to production:
1. **Driver Verification**: Verify `psycopg2-binary` (pinned to 2.9.13) installs cleanly in the target Linux production environment.
2. **Environment Variables**: Configure:
   ```env
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=proho_prod
   DB_USER=proho_user
   DB_PASSWORD=<secure-rds-password>
   DB_HOST=proho-rds.xxxxxx.ap-south-1.rds.amazonaws.com
   DB_PORT=5432
   ```
3. **Dry-Run Migration**: Run `python manage.py makemigrations --check --dry-run` to ensure migration files are in sync.
4. **Target DB Migration**: Run `python manage.py migrate` against the clean PostgreSQL instance. Verify that UUID fields, JSONB indexes, and foreign key constraints are created properly.
5. **Data Transfer (if needed)**: If initial seed data or user accounts need transferring, use Django's `dumpdata` and `loaddata`:
   ```bash
   python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > seed_data.json
   python manage.py loaddata seed_data.json
   ```
6. **Integrity Validation**: Run the test suite against a staging PostgreSQL database to verify transactions, `select_for_update` row-locking, and constraints before opening to production traffic.
  - `proho-public-media`: Public read access for property photos, floor plans, and marketing assets (fronted by Amazon CloudFront CDN).
  - `proho-private-documents`: Block all public access for partner KYC PAN, Aadhaar, and bank documents. Accessed via presigned URLs only.
- **Mobile Distribution**: Expo EAS Build (Android AAB/APK for Google Play, iOS IPA for Apple App Store / TestFlight).

---

## 2. Environment Variables & Secrets
Secrets must **never** be checked into version control. Production secrets are injected via systemd environment files or AWS SSM Parameter Store.

Key variables:
- `DJANGO_SECRET_KEY`: High-entropy 50+ character string.
- `DEBUG`: Must be `False` in production.
- `ALLOWED_HOSTS`: `api.proho.in`, `proho.in`.
- `DATABASE_URL`: `postgres://user:pass@host:5432/dbname`.
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: IAM user with least-privilege scoped to S3 buckets.
- `AWS_STORAGE_BUCKET_NAME`: S3 bucket name.

---

## 3. Web Server & Process Management (Backend)
- **Application Server**: Gunicorn with Uvicorn/sync workers:
  ```bash
  gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 3 --timeout 60
  ```
- **Process Supervisor**: `systemd` service (`/etc/systemd/system/proho-backend.service`).
- **Reverse Proxy**: Nginx handling SSL termination with Let's Encrypt Certbot.
- **Static Assets**: Django `collectstatic` served directly by Nginx or S3 static bucket.

---

## 4. Mobile Build & Release (Expo EAS)
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure EAS: `eas build:configure`
3. Build Android Preview / Production:
   ```bash
   cd mobile
   eas build --platform android --profile preview
   ```
4. Build iOS:
   ```bash
   cd mobile
   eas build --platform ios --profile production
   ```

---

## 5. Backup & Disaster Recovery
- **Database Snapshots**: Automated daily snapshots retained for 30 days.
- **Point-in-Time Recovery (PITR)**: Enabled for transaction log replays up to 7 days.
- **S3 Versioning**: Enabled on the private document bucket to prevent accidental deletion or tampering with KYC history.
