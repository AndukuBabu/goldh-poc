---
title: Authentication & Security Module
last_updated: 2026-01-10
version: 1.3.0
---

# Authentication & Security Module

## 1. Executive Summary
**Objective:** Securely manage user identity and access control across the platform.

### Strategic Health (CEO)
*   **Status:** 🟢 **Stable**
*   **Role:** Foundation for user trust and regulatory compliance (Pillar B separation).
*   **Integrity:** Hard-boundary enforcement prevents unauthorized access to execution layers.

### Cost/Burn Analysis (CFO)
*   **Current:** $0.00 (Firebase Auth Free Tier).
*   **Projection:** $0.00 at 10k MAU.
*   **Efficiency:** Externalizing identity management reduces maintenance costs.

### Value Positioning (Marketing)
*   **Trust:** Enterprise-grade security ensures user data privacy.
*   **Speed:** Frictionless onboarding (< 30s) increases conversion rates.

---

## 2. Functional Overview (Text-Visual)

The sign-up process is designed to be secure yet seamless, integrating marketing automation (Zoho) without blocking the user experience.

### Secure Signup Flow (ASCII)

```
[User Form] --> [Validation] --> [API: /signup] --> [DB Check]
                                                       |
                                                       v
                                                 [Create User]
                                                       |
                                         (Async)       v
[Zoho CRM Lead] <---- [ Cloud Task ] <---------- [Success 201]
```

### Workflow Logic Table (Step-by-Step)

| Step | Trigger | Action | Result |
| :--- | :--- | :--- | :--- |
| **1. Submission** | User clicks "Join" | Frontend validates inputs (Zod schema) | Valid payload or inline error |
| **2. API Request** | Valid Form Data | POST `/api/auth/signup` sent to Cloud Function | Server receives request |
| **3. Identity Check** | Server Processing | Checks Neon DB for existing email | 400 Error if duplicate found |
| **4. Hashing** | New User | Hashes password (scrypt/argon2) | Secure credential generated |
| **5. Creation** | Hash Complete | Writes new record to `users` table | User ID (Primary Key) generated |
| **6. Async Ops** | User Created | Triggers `createZohoLead` (Fire-and-forget) | Lead added to CRM (Pillar A) |
| **7. Session** | Success | Generates Session ID & sets Cookie | User redirected to Dashboard |

---

## 3. Technical Implementation

### API Contract

| Method | Endpoint | Payload | Returns |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | `SignUpData` (JSON) | `{ user: {}, sessionId: "..." }` |
| **POST** | `/api/auth/signin` | `{ email, password }` | `{ user: {}, sessionId: "..." }` |
| **POST** | `/api/auth/signout` | `{}` | `{ message: "Success" }` |

### Security Protocols
*   **Password Storage:** Never stored in plain text.
*   **Session Mgmt:** Server-side sessions mapped to User IDs.
*   **Admin Access:** Auto-granted based on `schedulerConfig.adminEmails` whitelist.
