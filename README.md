# GOLDH POC

**Status:** Active Development  
**Version:** 1.0.0

## Overview
GOLDH is a financial intelligence platform designed to provide institutional-grade market data and analysis. This repository contains the Proof of Concept (POC) implementation.

**Core Pillars:**
*   **Pillar A (Intelligence):** Market data, news digest, and educational content.
*   **Pillar B (Execution):** Future implementation of execution capabilities (Separated interaction).

## Technical Stack
*   **Frontend:** React (Vite), Tailwind CSS, Shadcn UI
*   **Backend:** Node.js (Express), Firebase Cloud Functions (Gen 2)
*   **Database:** Neon (Serverless PostgreSQL), Firebase Firestore (NoSQL)
*   **Infrastructure:** Google Cloud Platform (GCP)

## Getting Started

### Prerequisites
*   Node.js v22+
*   npm v10+

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables (see `.env.example`).

### Development
Start the development server:
```bash
npm run dev
```
This starts both the Vite frontend (port 5000) and the Express backend (port 3000/5000).

### Build & Deploy
To build for production:
```bash
npm run build
```

To deploy to Firebase:
```bash
npm run deploy
```

## Documentation
*   **[Infrastructure & Costs](./docs/INFRASTRUCTURE.md):** Detailed cloud setup and cost projections.
*   **[Features](./docs/features/README.md):** Feature-specific documentation.
*   **[Troubleshooting](./docs/TROUBLESHOOTING.md):** Known issues and fixes.
