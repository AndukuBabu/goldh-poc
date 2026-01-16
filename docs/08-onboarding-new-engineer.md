# 08 – Onboarding New Engineer

## Purpose of This Document

This guide helps **new engineers quickly get up to speed** with the GOLDH.ai platform, its architecture, tooling, environment setup, and best practices. Following this document ensures consistent development, deployment, and collaboration practices.

---

## 1. Prerequisites

Before starting, ensure you have:

1. **Accounts & Access**
   - GitHub: Access to `goldh-app-dev` and `goldh-app-prod` repos  
   - Firebase: Access to `goldh-firebase-dev` and `goldh-firebase-prod` projects
   - CoinGecko / other external API keys for dev environment  
   - Slack / Email for team communication  

2. **Local Development Setup**
   - Node.js >= 18  
   - npm / yarn package manager  
   - Firebase CLI (`npm install -g firebase-tools`)  
   - Code editor (VSCode recommended)  
   - Optional: Postman or Insomnia for API testing  

3. **System Configuration**
   - Clone repository:  
     ```bash
     git clone git@github.com:goldh-ai/goldh-app-dev.git
     cd goldh-app-dev
     ```
   - Copy environment template:  
     ```bash
     cp .env.example .env
     ```
   - Fill `.env` with development keys (see [03 – Environment Variables])  

---

## 2. Project Structure Overview

```text
goldh-app-dev/
├── client/ # React frontend
├── server/ # Node.js backend & API
├── functions/ # Firebase Cloud Functions
├── shared/ # Shared utilities and constants
├── scripts/ # Build and deployment scripts
├── .env.example # Template environment variables
└── package.json
```

---

## 3. Branching Strategy

Follow the branching conventions outlined in [02 – Branching Strategy]:

- `main`: Production-ready code  
- `develop`: Active development and QA  
- `feature/*`: Individual feature development  
- `hotfix/*`: Critical fixes for production  

> Always rebase with `develop` before merging to avoid conflicts.

---

## 4. Environment Setup

1. Install dependencies:
```bash
npm ci
```

2. Start local development servers:
```bash
# Start frontend + backend + emulators
npm run dev
```

3. Access local dashboard: http://localhost:3000

Verify connections to Firestore, authentication, and APIs.

---

## 5. Data Flow & Ingestion

- **GOLDH Pulse (crypto + market assets)**: Snapshots stored in Firestore
- **Guru Talk (news)**: Aggregated and tagged by asset symbols
- **Market Events (economic calendar)**: Curated + AI summaries

Refer to [05 – Data Ingestion Pipeline] for detailed schemas, collection names, and ingestion logic.

---

## 6. Dashboard Architecture

- React + Tailwind CSS frontend
- TanStack Query for server state management
- `AssetCard`, `NewsScroller`, and `UmfSnapshot` components for modular design
- Fallback & caching strategy to maintain UI resilience

See [06 – Dashboard Architecture] for component library, hooks, and performance optimizations.

---

## 7. Deployment

- Dev deployments automatic via merge to `develop`
- Prod deployments restricted via merge to `main` and CI/CD pipeline
- Firebase CLI and secrets management mandatory

Refer to [07 – Deployment Guide] for step-by-step deployment instructions.

---

## 8. Best Practices

### Code Style
- ESLint / Prettier enforced
- TypeScript strict mode enabled
- Modular, reusable components

### Testing
- Unit tests for critical backend and frontend logic
- Integration tests for API endpoints

### Secrets Management
- Never commit `.env` files
- Access production secrets only via GCP Secret Manager

### Collaboration
- Pull latest `develop` before starting work
- PR reviews mandatory before merging
- Document all new environment variables in [03 – Environment Variables]

---

## 9. Useful References

- GitHub Repos: `goldh-app-dev` | `goldh-app-prod`
- Firebase Projects: `goldh-firebase-dev` | `goldh-firebase-prod`
- Environment Variables: [03 – Environment Variables]
- Firebase Project Setup: [04 – Firebase Projects & Environments]
- Data Ingestion Pipeline: [05 – Data Ingestion Pipeline]
- Dashboard Architecture: [06 – Dashboard Architecture]
- Deployment Guide: [07 – Deployment Guide]

---

## 10. First Task Suggestions

For onboarding, new engineers can:

1. Run the local environment and verify snapshot fetching
2. Explore `AssetCard` and `UmfSnapshot` components
3. Add a test coin or asset to Firestore and ensure it appears on the dashboard
4. Trigger a manual ingestion via **Admin > Health** page.