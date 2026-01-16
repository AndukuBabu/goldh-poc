# 03 – Environment Variables & Secrets Management

## Purpose of This Document

This document defines the **naming conventions, security protocols, and management strategy** for environment variables across the **GOLDH.ai platform**.

Proper management of secrets is critical for:

* **Security**: Preventing credential leaks and unauthorized access
* **Environment Parity**: Ensuring Dev and Prod remain strictly isolated
* **Maintainability**: Making it clear what each variable does and where it belongs
* **Operational Safety**: Allowing key rotation and incident response without code changes

---

## 1. Core Principles

1. **Never commit secrets to Git**
2. **Strict Dev / Prod isolation**
3. **Frontend and Backend secrets are never shared**
4. **All secrets must be rotatable**
5. **All access to environment variables must be centralized**
6. **Infrastructure should be reproducible from documentation**

---

## 2. Naming Conventions (Mandatory)

All environment variables follow a **service-prefixed, snake_case** format to avoid collisions and provide immediate context.

### 2.1 Platform Prefixes

| Prefix     | Service Layer                             | Example                    |
| ---------- | ----------------------------------------- | -------------------------- |
| `GH_CORE_` | Core infrastructure (DB, ports, sessions) | `GH_CORE_DATABASE_URL`     |
| `GH_FB_`   | Firebase / GCP configuration              | `GH_FB_PROJECT_ID`         |
| `GH_EXT_`  | External APIs & integrations              | `GH_EXT_COINGECKO_API_KEY` |
| `VITE_`    | Frontend-exposed build-time variables     | `VITE_FIREBASE_API_KEY`    |

> **IMPORTANT**
> Always use GOLDH-standard prefixes even if the underlying platform (Firebase, Cloud Run) uses a different variable name.
>
> A centralized `config.ts` acts as the **single mapping layer**.

---

## 3. Environment Scope & Storage Matrix

| Scope     | Environment | Where Stored         | Accessed By                 |
| --------- | ----------- | -------------------- | --------------------------- |
| Frontend  | Dev         | Firebase Hosting env | Browser                     |
| Frontend  | Prod        | Firebase Hosting env | Browser                     |
| Backend   | Dev         | GCP Secret Manager   | Cloud Functions / Cloud Run |
| Backend   | Prod        | GCP Secret Manager   | Cloud Functions / Cloud Run |
| Local Dev | Dev         | `.env` (gitignored)  | Local Node                  |
| CI/CD     | Dev / Prod  | GitHub Secrets       | GitHub Actions              |

---

## 4. Dev vs Prod Separation

GOLDH enforces a **hard wall** between Development and Production credentials.

* **Never** use Prod keys in Dev or vice versa
* Separate Firebase projects, CoinGecko keys, and HuggingFace/AI keys
* Session secrets **must be unique per environment**
* Dev data must never contaminate Prod analytics or billing

---

## 5. Secret Management Layers

### 5.1 Local Development (`.env`)

* **File**: `.env` (ignored by Git)
* **File**: `.env.example` (committed, no real secrets)
* **Usage**:
  Developers copy `.env.example` → `.env` and fill local values

```bash
cp .env.example .env
```

---

### 5.2 Cloud Deployment (GCP / Firebase)

For Dev and Prod cloud environments:

* Use **GCP Secret Manager** (preferred)
* Secrets are **injected at runtime**
* Never paste secrets directly into the GCP console as plaintext env vars

Example:

```bash
gcloud secrets create GH_EXT_COINGECKO_API_KEY_PROD
```

---

## 6. Required Environment Variables

### 6.1 Core Platform

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `NODE_ENV`             | `development` | `production`        |
| `GH_PORT`              | Backend server port (defaults to 5000) |
| `SESSION_SECRET`       | Cookie signing secret               |
| `GH_CORE_DATABASE_URL` | Neon / PostgreSQL connection string |

---

### 6.2 Firebase / GCP (Admin SDK)

| Variable             | Description                             |
| -------------------- | --------------------------------------- |
| `GH_FB_PROJECT_ID`   | Firebase project ID                     |
| `GH_FB_CLIENT_EMAIL` | Service account email                   |
| `GH_FB_PRIVATE_KEY`  | RSA private key (handle `\n` carefully) |

---

### 6.3 External Integrations & AI

| Variable                    | Service                 |
| --------------------------- | ----------------------- |
| `GH_EXT_COINGECKO_API_KEY`  | CoinGecko market data   |
| `GH_EXT_FINNHUB_API_KEY`    | Equities / ETFs         |
| `GH_EXT_ZOHO_CLIENT_ID`     | Zoho CRM                |
| `GH_EXT_ZOHO_CLIENT_SECRET` | Zoho CRM                |
| `GH_EXT_ZOHO_REFRESH_TOKEN` | Zoho API access         |
| `GH_EXT_HUGGINGFACE_API_KEY`| AI curation / tagging   |

---

### 6.4 Scheduler & Admin Control

| Variable         | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `UMF_SCHEDULER`  | Enable market data scheduler (`1` or `0`)   |
| `GURU_SCHEDULER` | Enable news digest scheduler (`1` or `0`)   |
| `ADMIN_EMAILS`   | Comma-separated list of admin email address |

---

## 7. Frontend (Vite) Variables

⚠️ **All `VITE_` variables are public** and embedded in the browser JS bundle.

### Firebase Configuration
These must match the Firebase project for the respective environment (Dev/Prod).

* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

---

## 8. Centralized Config Access (Mandatory)

All backend access must go through **`server/config.ts`**.

❌ Disallowed:

```ts
process.env.GH_EXT_COINGECKO_API_KEY
```

✅ Required:

```ts
import { config } from './config';
config.coingecko.apiKey;
```

* Config is validated using **Zod**
* App fails fast if required variables are missing

---

## 9. Security Protocols

1. **No secrets in Git**
   Any leaked secret is immediately considered compromised.
2. **Key Rotation**
   Prod secrets rotated every 90 days or upon team changes.
3. **Least Privilege**
   Service accounts use minimum required roles.
4. **Auditability**
   All secrets are traceable via GCP audit logs.

---

## 10. CI/CD Secrets (GitHub Actions)

| Secret                | Purpose             |
| --------------------- | ------------------- |
| `FIREBASE_TOKEN_DEV`  | Deploy Dev hosting  |
| `FIREBASE_TOKEN_PROD` | Deploy Prod hosting |
| `GCP_SA_KEY_DEV`      | Cloud Run Dev       |
| `GCP_SA_KEY_PROD`     | Cloud Run Prod      |

---

## 11. Adding a New Variable (Checklist)

1. Add to `.env.example`
2. Add to `server/config.ts` Zod schema
3. Document it in **Section 6**
4. Create Dev & Prod secrets
5. Validate via deployment

---

## 12. Common Mistakes (Avoid)

* Using `VITE_` for private keys (Frontend exposure)
* Reusing Prod keys in Dev
* Accessing `process.env` directly in business logic
* Forgetting to update the Zod schema in `config.ts`

---

## 13. Summary

* Environment variables are **strictly structured**
* Secrets live in **GCP Secret Manager**
* Frontend exposure is **explicit and minimal**
* Dev and Prod are **fully isolated**
* Configuration is **validated, auditable, and secure**

---


