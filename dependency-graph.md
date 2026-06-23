# 📊 PlayHive — Monorepo Dependency Graph

This document profiles the import/export dependency layout and highlights files critical to the security and integrity of the application.

---

## 🛠️ Workspace Packages & Relationships

```
                  ┌──────────────────────┐
                  │  Root package.json   │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│    @playhive/backend │          │   @playhive/frontend │
│     (apps/backend)   │          │    (apps/frontend)   │
└───────────┬──────────┘          └───────────┬──────────┘
            │                                 │
            ├─► prisma/schema.prisma          ├─► stores/authStore.ts
            ├─► src/index.ts                  ├─► components/layout/Navbar.tsx
            └─► src/middleware/auth.ts        └─► src/app/globals.css
```

---

## ⚠️ High Impact & Core Files

The following files are **critical** to the security, auth validation, and billing functions of PlayHive. Modification of these paths must be done with extreme care.

| File Location | Purpose | Critical Reason |
| :--- | :--- | :--- |
| `apps/backend/prisma/schema.prisma` | DB schemas & relations | Direct layout of PostgreSQL; schema changes affect ORM type definitions and require database migrations. |
| `apps/backend/src/middleware/auth.ts` | JWT validation & role controls | Controls request authorization. Vulnerabilities here can bypass route guards and expose user data. |
| `apps/backend/src/routes/payments.ts` | Razorpay checkout & webhooks | Controls entry fee capture and payment verification. Bugs here can lead to financial losses or unpaid tournament entries. |
| `apps/backend/src/services/invoiceService.ts` | Invoice PDF Kit compilation | Generates tax-compliant invoices. Needs to correctly calculate GST amounts. |
| `apps/frontend/src/stores/authStore.ts` | Zustand persisted auth | Manages logged-in session credentials and sets default Authorization headers for API calls. |
