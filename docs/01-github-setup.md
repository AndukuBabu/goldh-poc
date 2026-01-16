# 01 – GitHub Setup

## Purpose of This Document

This document explains **how and why** the GOLDH.ai GitHub repositories are structured.
It is intended to be the **single source of truth** for repository creation, access control, and basic governance.

By the end of this document, a contributor should understand:

* Why we separate **dev** and **prod**
* How repositories are named
* What branches exist and who can touch them
* What rules protect production code

---

## Repository Strategy Overview

GOLDH.ai follows a **two-repository model**:

| Repository             | Purpose                                       | Stability |
| ---------------------- | --------------------------------------------- | --------- |
| `goldh-app-dev`  | Active development, experiments, feature work | Medium    |
| `goldh-app-prod` | Production-ready, stable releases only        | High      |

### Why Two Repositories?

**Clear separation of concerns**

* Dev moves fast
* Prod remains stable and auditable

**Reduced blast radius**

* Mistakes in dev can never accidentally impact prod

**Simpler access control**

* Fewer people need write access to prod

**Enterprise-grade discipline**

* Mirrors real-world financial systems and regulated environments

---

## Repository Naming Convention

Use **clear, explicit names**:

```text
goldh-app-dev
goldh-app-prod
```

Optional future repos:

```text
goldh-data-ingestion-dev
goldh-data-ingestion-prod
goldh-docs
```

🔴 Avoid ambiguous names like:

* `goldh-app`
* `goldh-dashboard-v2`
* `goldh-final`

---

## Step-by-Step: Creating the Repositories

### Step 1: Create Dev Repository

1. Go to GitHub → **New Repository**
2. Repository name:

   ```text
   goldh-dashboard-dev
   ```
3. Visibility:

   * **Private** (recommended)
4. Initialize with:

   * ✅ `README.md`
   * ❌ `.gitignore` (we will add later)
   * ❌ License (optional at this stage)

---

### Step 2: Create Prod Repository

Repeat the same steps with:

```text
goldh-dashboard-prod
```

Important:

* **Do not** initialize with experimental code
* Prod repo should only receive **curated merges**

---

## Default Branch Strategy (High Level)

| Repo | Default Branch | Description              |
| ---- | -------------- | ------------------------ |
| Dev  | `develop`      | Main working branch      |
| Prod | `main`         | Production releases only |

> Branching mechanics are covered in detail in **02-branching-strategy.md**

---

## Access Control & Roles

### Recommended Roles

| Role            | Dev Repo                 | Prod Repo        |
| --------------- | ------------------------ | ---------------- |
| Founder / Admin | Admin                    | Admin            |
| Core Engineer   | Write                    | Read / PR only   |
| Contributor     | Write (feature branches) | No direct access |

### Key Rules

* ❌ No direct commits to `main` in prod
* ✅ All prod changes must come via PR
* ✅ At least one review required for prod PRs

---

## Branch Protection Rules (Critical)

Apply these **at minimum** on the prod repository:

### Protect `main` branch

Enable:

* Require pull request before merging
* Require at least 1 approval
* Require branches to be up to date
* Restrict who can push to matching branches

This ensures:

* No accidental production changes
* Full audit trail of decisions

---

## Repository Structure (Initial)

Both repos should start with the same structure:

```text
goldh-dashboard/
├── docs/
│   ├── 00-overview.md
│   ├── 01-github-setup.md
│   └── ...
├── src/
├── public/
├── .env.example
├── README.md
└── package.json
```

Consistency between dev and prod is **mandatory**.

---

## README.md Minimum Content

Each repository README must include:

* Project name
* Short description
* Environment (dev or prod)
* How to run locally
* Link to `/docs/00-overview.md`

Example snippet:

```md
## Environment
This repository is used for DEVELOPMENT purposes only.

Production code lives in:
goldh-dashboard-prod
```

---

## What NOT to Store in GitHub

❌ Never commit:

* `.env`
* API keys
* Firebase service account keys (`goldh-firebase-dev` / `goldh-firebase-prod`)
* Yahoo / CoinGecko secrets

Use:

* Environment variables or Secret Manager
