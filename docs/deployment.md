# Proho Platform — Deployment & Infrastructure Guide

## 1. Production Architecture Overview
- **Compute**: AWS Lightsail Linux instance (Ubuntu 22.04 LTS, Gunicorn + Nginx reverse proxy).
- **Database**: Managed PostgreSQL (AWS Lightsail Managed Database or AWS RDS PostgreSQL 15+).
- **Object Storage**: Amazon S3:
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
