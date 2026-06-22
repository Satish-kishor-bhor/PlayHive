# 🎮 PlayHive — BGMI Esports Tournament Platform

PlayHive is a high-performance, secure, and modern esports tournament management platform designed specifically for BGMI (Battlegrounds Mobile India) players and organizers. It automates tournament creation, participant KYC verification, match updates, payment collections (with automated invoices), and secure prize distributions.

---

## 🛠️ Tech Stack & Rationale

We selected a modern, robust, and industry-standard tech stack optimized for performance, scalability, real-time updates, and secure financial transactions. Below is the breakdown of what we used and **why**:

### 1. Monorepo Architecture (NPM Workspaces)
*   **Why:** Allows hosting both the frontend (Next.js) and backend (Express) in a single repository. It simplifies dependency management, makes it easy to share types or config files, and streamlines the local development workflow.

### 2. Frontend: Next.js 14 (App Router) & TypeScript
*   **Why Next.js:** We needed a framework that supports Server-Side Rendering (SSR) and Static Site Generation (SSG) for public tournament pages (SEO optimization is crucial to attract players) while maintaining a fast, dynamic Single Page Application (SPA) experience inside the player dashboard. Next.js 14's App Router provides nested routing and optimized asset delivery out-of-the-box.
*   **Why TypeScript:** Restricts runtime exceptions by enforcing static types. Vital for payment payloads, tournament stats, and user credentials.

### 3. Styling & Animations: Tailwind CSS + Framer Motion
*   **Why Tailwind CSS:** Standard utility-first CSS framework that allows rapid UI construction, consistent layouts, and responsive designs.
*   **Why Framer Motion:** Modern gaming platforms need to look alive and premium. Framer Motion is used for smooth page transitions, interactive hover states on tournament cards, and sleek micro-animations (e.g., custom OTP boxes, wallet transitions).

### 4. Client State: React Query (TanStack) & Zustand
*   **Why React Query:** Dedicated to asynchronous server state (fetching, caching, synchronizing, and updating server state). It reduces boilerplate, automatically refetches stale data (e.g., live slot fill rates), and manages loading/error states gracefully.
*   **Why Zustand:** Used for lightweight, persistent client-side state (such as the logged-in user profile, JWT token, and local configuration). It is far less complex and has less boilerplate than Redux.

### 5. Backend: Express.js (TypeScript) & Socket.io
*   **Why Express.js:** A minimalist, lightweight backend framework. It provides complete control over routing and middleware, which is perfect for building RESTful APIs rapidly.
*   **Why Socket.io:** Real-time updates are critical for esports (live bracket updates, seat reservations, and notifications). Socket.io provides reliable, bi-directional, real-time communication with automatic fallback options.

### 6. Database & ORM: PostgreSQL & Prisma
*   **Why PostgreSQL:** A robust, relational, ACID-compliant database. It is essential for managing financial transactions (entry fees, prize distributions), KYC records, and user relation maps (teams and tournament registrations) where data consistency is non-negotiable.
*   **Why Prisma:** A modern, type-safe ORM. It provides auto-generated database clients, simplifies migration management, and integrates natively with TypeScript.

### 7. Caching & Message Broker: Redis
*   **Why Redis:** Used for high-speed caching, storing active Socket.io connection maps, handling matchmaking/slot-booking queues, and managing OTP expiration.

### 8. Payments & Payouts: Razorpay
*   **Why Razorpay:** India's leading payment gateway with first-class support for UPI, Net Banking, and Cards. It provides robust webhooks for transaction verification and features a payouts API to automate winning distributions directly to players' bank accounts or UPI IDs.

---

## 🏗️ Project Architecture

```
PlayHive/
├── apps/
│   ├── backend/                     # Express.js REST API & WebSocket Server
│   │   ├── prisma/                  # Prisma schema & migrations
│   │   │   └── schema.prisma        # Database models (User, KYC, Tournament, Team, etc.)
│   │   ├── src/
│   │   │   └── index.ts             # Server entrypoint with Express + Socket.io
│   │   └── package.json
│   │
│   └── frontend/                    # Next.js 14 React Web App
│       ├── src/
│       │   ├── app/                 # Page routes (Dashboard, Auth, Tournaments)
│       │   ├── components/          # Reusable UI components (Navbar, Footer, Cards)
│       │   ├── stores/              # Zustand global state (Auth, UI)
│       │   └── providers.tsx        # React Query provider wrapper
│       └── package.json
│
├── docker-compose.yml               # PostgreSQL & Redis container orchestrator
├── SetUp.md                         # Detailed step-by-step setup guide
├── Readme.md                        # Project technology stack and architecture (This file)
└── package.json                     # Monorepo workspaces configuration
```

---

## 🔒 Security Measures

*   **KYC Verification:** Built-in checks for BGMI character ID and in-game name matching to prevent smurfing or hacking.
*   **Secure Transactions:** All entry fee transactions are signed and verified server-side using Razorpay Webhooks.
*   **JWT Authentication:** HttpOnly cookies / Secure headers for storing session tokens to prevent Cross-Site Scripting (XSS) attacks.
