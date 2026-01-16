# 07 – Deployment Guide

## Purpose of This Document

This document defines the **deployment lifecycle** for GOLDH.ai. It is the operational implementation of our [Architecture Overview], [Two-Repository Model], and [Branching Strategy].

---

## 1. Deployment Environments & Repository Mapping

In alignment with **01 – GitHub Setup**, we maintain a hard wall between environments.

| Environment | Repository | Firebase Project | Serving URL |
| :--- | :--- | :--- | :--- |
| **Development** | `goldh-app-dev` | `goldh-firebase-dev` | `goldh-firebase-dev.web.app` |
| **Production** | `goldh-app-prod` | `goldh-firebase-prod` | `goldh.ai` |

---

## 2. CI/CD & Branching Workflow

As defined in **02 – Branching Strategy**, code flows through specific branches before reaching deployment.

### 2.1 Development Repo (`goldh-app-dev`)
1.  **Work**: Developers create `feature/*` or `fix/*` branches.
2.  **Merge**: Pull Requests are merged into **`develop`**.
3.  **Deploy**: Continuous Integration (CI) automatically triggers a deployment to the **`goldh-firebase-dev`** Firebase project.

### 2.2 Production Repo (`goldh-app-prod`)
1.  **Promotion**: Stable code is promoted from the dev repo's `develop` branch to the prod repo's **`main`** branch via an intentional Pull Request or semantic tag.
2.  **Review**: Deployment to production requires approval from the Lead Engineer/CTO.
3.  **Deploy**: Once merged into `main`, CI/CD triggers a deployment to the **`goldh-firebase-prod`** project.

---

## 3. The Deployment Process (Manual/Local)

While CI/CD handles most deployments, engineers may need to deploy manually for emergency patches or testing.

### 3.1 Pre-Flight Checklist
- [ ] Run `npm run check` (TypeScript validation).
- [ ] Run `npm test` (Unit/Integration tests).
- [ ] Ensure `firebase use` matches the intended target repository.

### 3.2 Deployment Lifecycle
GOLDH uses a multi-codebase setup. The `npm run build` command is the mandatory first step.

```bash
# 1. Switch to the correct environment
firebase use goldh-firebase-dev # or goldh-firebase-prod

# 2. Build all targets (Frontend, API Server, Schedulers)
npm run build

# 3. Deploy all services
firebase deploy
```

---

## 4. Service-Specific Deployment Notes

### 4.1 Firebase Hosting (Frontend)
- **Rewrites**: All `/api/**` traffic is automatically routed to the backend.
- **Cache**: Hosting deployments are atomic; users see new versions instantly on refresh.

### 4.2 Firebase Functions (Schedulers)
- **Atomic Deploys**: We use `--only functions:schedulers` for rapid updates to ingestion logic.
- **Secrets**: Production secrets (CoinGecko API, Database URLs) are mounted via GCP Secret Manager and are never available in the build environment.

### 4.3 Cloud Run (API Server)
- **Deployment**: The Node/Express server is built and deployed as the `default` codebase, providing the main serving layer for the dashboard.

---

## 5. Post-Deployment Verification

Following the principles in **00 – Overview**, stability is paramount.

1.  **Health Check**: Visit the `/api/health` endpoint to verify DB and external service connectivity.
2.  **Admin Dashboard**: Log in as an Admin and visit the **Health & Schedulers** page to confirm the Pulse ingestion is running.
3.  **Version Tagging**: For production releases, a Git tag (e.g., `v1.2.0`) must be created in the `goldh-app-prod` repo for auditability.

---

## 6. Security Governance

- **No Secrets in Git**: All environment variables are managed per-environment as defined in **03 – Environment Variables**.
- **Access Control**: Production deployment keys are strictly restricted to CI/CD service accounts and the CTO.

---

> [!TIP]
> Always verify your current repository context by running `git remote -v`. You should never attempt to deploy to `goldh-app-prod` from the `goldh-app-dev` repository.