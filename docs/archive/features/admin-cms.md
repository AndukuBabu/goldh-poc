---
title: Admin CMS Module
last_updated: 2026-01-10
version: 1.1.0
---

# Admin CMS Module

## 1. Executive Summary
**Objective:** Allow non-technical admins to publish and manage content for Guru Talk and Learn modules.

### Stakeholder Snapshot

| Stakeholder | Focus Area | Status/Details |
| :--- | :--- | :--- |
| **CEO (Strategy)** | **Strategic Health** | 📅 **Planned**<br>Operational efficiency. Removes engineering bottleneck for content. |
| **CFO (Finance)** | **Cost/Burn** | **Build:** One-time engineering cost.<br>**Ops:** Reduces specialized labor needs. |
| **CMO (Marketing)** | **Value Prop** | **Agility:** Marketing team can publish updates instantly. |

---

## 2. Functional Overview (Text-Visual)

A secure portal for creating, editing, and deleting dynamic content without modifying code.

### Publishing Workflow (ASCII)

```
[Admin User] --> [Editor UI] --> [Validation] --> [Publish]
(Rich Text)      (Preview)       (Schema Check)       |
                                                      v
                                               [Live Content]
                                               (DB Update)
```

### Publishing Steps

| Step | Actor | Action | State |
| :--- | :--- | :--- | :--- |
| **1. Create** | Editor | Opens "New Article" | `Draft` |
| **2. Write** | Editor | Inputs Text/Images | `Draft` |
| **3. Review** | Admin | Approves content | `Reviewed` |
| **4. Publish** | Admin | Clicks "Go Live" | `Published` |

---

## 3. Technical Implementation

### Permissions Model

| Role | Create Draft | Edit Own | Publish | Delete |
| :--- | :--- | :--- | :--- | :--- |
| **Editor** | ✅ | ✅ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

### Security
*   **Route:** Protected `/admin/cms/*`.
*   **Validation:** Server-side check of `isAdmin` claim on every write operation.
