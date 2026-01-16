04 – Firebase Projects & Environments
Purpose of This Document

This document defines the Firebase architecture for GOLDH.ai. It outlines how we use separate projects to ensure environment isolation, lists the specific Firebase services utilized by the platform, and provides guidance for deployment, security, and environment management.

Following these standards ensures data integrity, security, and maintainability across Dev and Prod environments.

1. Multiple Project Architecture

In alignment with our [GitHub Setup], GOLDH utilizes two distinct Firebase projects to prevent development testing from impacting production data or users.

Environment	Firebase Project ID	Hosting URL	Purpose
Development	goldh-firebase-dev	https://goldh-firebase-dev.web.app	Active development, CI builds, QA testing
Production	goldh-firebase-prod	https://goldh.ai	Live customer data and high-availability serving
Why separate projects?

Data Integrity: Developers can clear Firestore collections during testing without affecting live market data.

Cost Management: Billing and API tiered usage limits (e.g., CoinGecko Free Tier) are isolated.

Security: Minimal access is granted to production, while the dev project is more accessible to the team.

2. Firebase Services Utilized

GOLDH leverages a full suite of Firebase features to minimize infrastructure overhead.

2.1 Firestore (Database)

The primary storage for market snapshots, news entries, and application state.

Collection	Purpose	Notes
umf_snapshot_live	Real-time market data	Crypto, indices, ETFs, equities, commodities
guruDigest	Aggregated news articles	Multi-asset, AI-tagged
umf_snapshot_history	Historical price data	Enables charts and trend analysis
users	User accounts & preferences	Auth-integrated
events	Market / economic events	AI-curated summaries and impact

Recommendation: Use asset-class-based documents to normalize data for caching and quick retrieval.

2.2 Cloud Functions (Backend & Schedulers)

Used for compute tasks and automated ingestion that don’t belong on the frontend.

Default Codebase: Handles dynamic API endpoints (Node.js + Express).

Schedulers Codebase: Fetches CoinGecko data and RSS feeds every 60 minutes.

Triggering: Cloud Pub/Sub triggers for scheduled jobs.

2.3 Firebase Hosting

Serves the React frontend.

Rewrites: All /api/** traffic routed to backend services.

CDN: Global delivery for fast access.

2.4 Firebase Authentication

Handles user identity and session management.

Providers: Email/Password, Google Social Login (planned).

Security: Integrated with Firestore Security Rules.

2.5 Cloud Pub/Sub

Implements scheduled triggers for ingestion pipelines (e.g., hourly snapshots).

3. Environment Configuration
3.1 Switch Environments

Use the Firebase CLI to toggle between Dev and Prod:

# To switch to development
firebase use goldh-firebase-dev

# To switch to production
firebase use goldh-firebase-prod

3.2 Emulators for Local Development

Before deploying, always test locally using the Firebase Emulator Suite:

npm run emulators


Starts local Auth, Firestore, and Functions instances

Ensures safe testing without touching cloud resources

4. Deployment Workflow
Environment	Branch	Deployment Command	Notes
Dev	develop	firebase deploy --project goldh-firebase-dev	Automatic CI/CD triggers
Prod	main	firebase deploy --project goldh-firebase-prod	Manual or restricted CI/CD, only senior devs

Principles:

Dev deployments go to Dev hosting (goldh-firebase-dev.web.app).

Prod deployments go to live domain (goldh.ai).

Secrets injected via GCP Secret Manager, never stored in code.

5. Security & Governance
5.1 Service Accounts
Environment	Roles	Notes
Dev	Editor / Owner	Developers can freely test and debug
Prod	CI/CD pipeline, CTO	Minimal access; Principle of Least Privilege enforced
5.2 Firebase Secrets

As detailed in [03 – Environment Variables], all sensitive keys (CoinGecko, Database URLs, Zoho tokens) are stored in GCP Secret Manager and accessed via Firebase Functions’ secret mounting.

No secrets in code or Git history

Rotation schedule: Every 90 days or upon personnel changes

Centralized access: All secrets mapped via server/config.ts

6. Firestore Security Rules (Example)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId;
      allow create: if request.auth != null;
      allow delete: if false;
    }

    match /market_data/{assetId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    match /news/{newsId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}


Only admins can write to critical collections; all users can read dashboard data.

7. Key Takeaways

Strict Dev / Prod isolation ensures reliable testing without impacting live users.

Multi-project architecture separates cost, access, and API limits.

Firestore structure supports modular multi-asset class expansion.

CI/CD pipelines integrate Dev → QA → Prod deployments efficiently.

Secrets & keys managed via GCP Secret Manager and not exposed in code.

Emulators provide safe local testing.