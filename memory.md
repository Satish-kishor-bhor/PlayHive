# 🎮 PlayHive — System Memory & Codebase Intelligence

PlayHive is a high-performance, secure, and modern esports tournament management platform designed specifically for BGMI (Battlegrounds Mobile India) players and organizers. It automates the entire tournament lifecycle, from creation and KYC verification to real-time match lobbies, automated point calculations, secure payments, and compliant winning distributions.

This document serves as the permanent brain of the project, providing a comprehensive codebase map and operational overview for any developer joining the team.

---

## 1. Project Overview & Business Purpose

### What business problem is solved?
Organizing esports tournaments in India—specifically for mobile games like BGMI—has historically been manual and fragmented. Organizers manually collect entry fees via UPI screenshot verification, distribute room credentials via WhatsApp/Discord groups, calculate rank points using spreadsheets, and manually transfer prize money. This manual model is prone to:
- Payment fraud (fake UPI screenshots)
- Smurfing and hacking (unregistered/unverified players entering custom lobbies)
- Delayed payouts and lack of Tax Deductions at Source (TDS) compliance
- Lack of tax invoicing (GST compliance) on service/entry fees

### Who uses the platform?
- **Players**: Competitive BGMI gamers looking for structured, secure, and fast-paying tournaments.
- **Organizers**: Esports companies, colleges, or community owners who host tournaments and earn a platform fee.
- **Admins**: PlayHive staff managing global configurations, verifying KYC documents, and resolving player disputes.

---

## 2. Tech Stack & Rationale

We utilize a robust and modern stack, structured as a monorepo using npm workspaces:

| Technology | Layer | Rationale |
| :--- | :--- | :--- |
| **Next.js 14 (App Router)** | Frontend Framework | Supports Server-Side Rendering (SSR) for search-engine indexing of public tournament pages, combined with standard React SPA state management for the player dashboard. |
| **Express.js (TypeScript)** | Backend API | Minimalist, highly customizable runtime that provides absolute control over routes, middleware, and low-latency WebSockets. |
| **PostgreSQL (Prisma ORM)** | Primary Database | ACID-compliant relational engine required for secure transaction ledgers (payments, refunds, payouts). Prisma ensures type safety across queries. |
| **Redis** | Cache & Job Queue | In-memory cache used for fast Socket.io session maps, OTP verification expiry, and rate-limiting counters. |
| **Socket.io** | Real-Time Sync | Continuous bi-directional sockets to feed lobby check-ins, register counts, and real-time point adjustments. |
| **Tailwind CSS + Framer Motion** | UI & Animations | Responsive utility styling combined with micro-animations to deliver a premium, BGMI-themed dark gaming aesthetic. |
| **Zustand** | Client State | Lightweight state persistence for authentication states and tokens without Redux boilerplate. |
| **Razorpay** | Payments & Payouts | India's leading payment service. Automates deposits (UPI/Card) and processes winnings directly to bank accounts or UPI IDs via the Razorpay Payouts API. |
| **Nodemailer (SendGrid)** | Email Automations | Deliver transactional emails (OTPs, registration receipts, invoice PDFs, room keys). |

---

## 3. Directory Structure

```
PlayHive/
├── apps/
│   ├── backend/                     # Express.js API & Socket.io WebSocket server
│   │   ├── prisma/                  # Prisma configuration & schema definition
│   │   │   └── schema.prisma        # 10+ models containing strict relational maps
│   │   ├── src/
│   │   │   ├── index.ts             # Application entrypoint & Express/Socket.io setup
│   │   │   ├── lib/
│   │   │   │   └── prisma.ts        # Prisma client initialization & query logger
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts          # JWT parsing and role-based permissions (requireRole)
│   │   │   │   ├── errorHandler.ts  # Global Express error logger and formatter
│   │   │   │   └── rateLimiter.ts   # Rate limits for login, payments, and OTP requests
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts          # Authentication: Register, Login, Verify Email, Token Refresh
│   │   │   │   ├── payments.ts      # Orders, signature verification, webhook processing
│   │   │   │   └── tournaments.ts   # Tournament listing, creation, registration, and lobby management
│   │   │   ├── services/
│   │   │   │   ├── emailService.ts  # Nodemailer integrations for OTPs, invoices, and room credentials
│   │   │   │   └── invoiceService.ts# PDFKit-based generator for GST-compliant invoices
│   │   │   ├── socket/
│   │   │   │   └── handlers.ts      # Sockets handler for tournament rooms and real-time check-ins
│   │   │   └── utils/
│   │   │       ├── helpers.ts       # Slug generation, currency formatting, and TDS calculators
│   │   │       └── logger.ts        # Winston file & console logging pipeline
│   │   └── package.json
│   │
│   └── frontend/                    # Next.js 14 Web Application
│       ├── next.config.js           # Next configuration with environment variables
│       ├── postcss.config.js        # PostCSS configuration
│       ├── tailwind.config.js       # Custom theme settings with brand-orange & glow aesthetics
│       ├── tsconfig.json            # Path alias configurations (@/* mapped to src/*)
│       ├── src/
│       │   ├── app/                 # Next.js App Router folders
│       │   │   ├── auth/            # Auth routes
│       │   │   │   ├── login/       # Login interface
│       │   │   │   └── register/    # 2-step registration & OTP screen
│       │   │   ├── dashboard/       # Player dashboard with side navigation
│       │   │   ├── tournaments/     # Tournament browse grid with filters
│       │   │   ├── globals.css      # Design tokens, custom scrolls, glows, and variables
│       │   │   ├── layout.tsx       # Root layout definingfonts (Rajdhani, Inter)
│       │   │   ├── page.tsx         # Landing page (Marketing, Stats, Features, Call-To-Actions)
│       │   │   └── providers.tsx    # React Query (TanStack) client wrapper
│       │   ├── components/          # Shared components
│       │   │   ├── layout/          # Layout components: Navbar & Footer
│       │   │   ├── tournaments/     # TournamentCard component
│       │   │   └── ui/              # UI helpers: CountUp, Toaster
│       │   └── stores/
│       │       └── authStore.ts     # Zustand global store for persists auth tokens & profiles
│       └── package.json
│
├── docker-compose.yml               # Local stack database orchestration (Postgres + Redis)
├── package.json                     # Monorepo workspace configuration
├── SetUp.md                         # Detailed project setup guide
├── Readme.md                        # Stack overview and rationale
└── My credentials.md                # Deployment checklist for Vercel & Railway
```

---

## 4. System Architecture

Below is a textual flow of the PlayHive architecture:

```
[ Player/Organizer Browser ]
          │ (HTTPS Requests & Next.js SSR)
          ▼
   [ Vercel CDN / Next.js ]
          │ (Proxied Backend Routes to Node Server)
          ▼
[ Express API Server (Railway) ] ◄──────────► [ Socket.io (WebSocket connections) ]
    │            │             │                           ▲
    │ (Prisma)   │             │ (HTTPS Calls)             │ (State Changes)
    ▼            ▼             ▼                           │
[PostgreSQL]  [Redis]    [ Razorpay Gateway ] ─────────────┘
  ( neon.tech ) ( Upstash )    │ (Webhooks)
                               ▼
                        [ SendGrid API ] (SMTP Emails)
```

---

## 5. Routing Map (Next.js Frontend)

| Route Path | File Location | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/` | `apps/frontend/src/app/page.tsx` | Main marketing page with features, upcoming matches | No |
| `/auth/login` | `apps/frontend/src/app/auth/login/page.tsx` | Standard email/password + Google OAuth entry | No |
| `/auth/register`| `apps/frontend/src/app/auth/register/page.tsx`| 2-Step sign up flow (details registration -> OTP validation) | No |
| `/tournaments` | `apps/frontend/src/app/tournaments/page.tsx` | Browse grid with filters (format, map, registration state) | No |
| `/dashboard` | `apps/frontend/src/app/dashboard/page.tsx` | Main profile center, balance, total earnings, active registrations | **Yes** (Client check) |

---

## 6. Authentication Flow

Authentication is built using standard email/password credentials or Google OAuth, secured with **Access Token rotation** (JWT) and **Refresh Tokens**:

```
[ User Register ] ────► Hash Password ────► Create OTP Code ──► Send Email
                                                                   │
                                                                   ▼
[ User Login ] ◄───── Generate Access & Refresh Tokens ◄──── [ OTP Verified ]
      │
      ├─► Access Token: Express Header "Authorization: Bearer <token>" (Expires in 15m)
      │
      └─► Refresh Token: Sent in JSON body for route POST `/auth/refresh` (Rotates client tokens)
```

- **JWT Middleware**: Defined in `apps/backend/src/middleware/auth.ts` -> checks requests for `Bearer <token>`, decodes claims to get the `userId`, and appends it to `req.user`.
- **Role Permissions**: Handled by the helper `requireRole(['ORGANIZER', 'ADMIN'])` to prevent ordinary players from mutating tournaments or verifying KYC records.

---

## 7. Database Map (PostgreSQL Schema)

The database schema is defined in `apps/backend/prisma/schema.prisma`. Below are the primary entities and relationships:

```
                  ┌──────────────┐
                  │     User     │
                  └──────┬───────┘
                         │ 1
                         │
        ┌────────────────┼────────────────┐
        │ 1              │ 1              │ 1
        ▼                ▼                ▼
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │   Team   │     │ Tournament│     │ Payment  │
  └────┬─────┘     └─────┬────┘     └────┬─────┘
       │ 1               │ 1             │ 1
       │                 │               │
       ▼                 ▼               ▼
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │TeamMember│◄────┤Registration├────►│  Invoice │
  └──────────┘  N  └──────────┘  N  └──────────┘
```

### Table Matrix:
1. **User**: Credentials, active BGMI character ID/username mapping, verification status, Aadhaar/PAN details, wallet balance.
2. **Team**: Teams registered by a leader. Contains tag prefix and links to `TeamMember` associations.
3. **Tournament**: Format (Solo/Duo/Squad), Map (Erangel, Miramar, Sanhok, Vikendi), Entry Fee, Prize Pool distribution metrics, current statuses, and private custom Match room credentials (Lobby ID and Password).
4. **TournamentRegistration**: Junction table mapping `Team` entries to `Tournament` records once entry fee payments are finalized.
5. **Match / MatchResult**: Points table configurations and match stats (kills, rank, survive seconds, point score per round).
6. **Payment**: Ledger entry tracing payments. Securely linked with Razorpay Order IDs, Payment IDs, and invoice records.
7. **Payout**: Target UPI or bank transfer records for prize distributions with built-in Indian TDS deductions.
8. **Dispute**: Form filled by players containing screenshots as proof of wins or cheating reports.

---

## 8. API Inventory (Backend Services)

All APIs are prefixed with `/api/v1/`:

| Method | Endpoint | Purpose | Authentication | Used By |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Create credentials and queue OTP code | None | Register view |
| **POST** | `/auth/login` | Authenticate details and generate tokens | None | Login view |
| **POST** | `/auth/verify-email` | Validate registration OTP | None | OTP verification view |
| **POST** | `/auth/refresh` | Rotate expired Access Token | None | API interceptors |
| **POST** | `/auth/logout` | Revoke active Refresh Token | None | User profile dropdown |
| **GET** | `/tournaments` | Query all active/public tournaments | None | Browse page grid |
| **GET** | `/tournaments/:slug` | Query full tournament details, brackets, matches | None | Tournament detail pages |
| **POST** | `/tournaments` | Create a new tournament template | Organizer / Admin | Organizer workspace |
| **POST** | `/tournaments/:id/register` | Register team slot for a match | Player | Tournament dashboard |
| **PATCH**| `/tournaments/:id/lobby` | Set custom room Lobby ID & password, alerts players | Organizer / Admin | Organizer workspace |
| **POST** | `/payments/create-order` | Instantiate Razorpay Order ID for registration fee | Player | Payment popup |
| **POST** | `/payments/verify` | Verify Razorpay signatures, log payment & generate invoice PDF | Player | Payment popup |
| **POST** | `/payments/webhook` | Handle async payment failures from Razorpay servers | None (verified signature) | Razorpay Webhook Events |
| **GET** | `/payments/my` | Retrieve invoice history of the current user | Player | Payments tab |

---

## 9. Data Flows

### A. Tournament Registration & Payment Process
```
1. User clicks "Register" on Next.js frontend.
2. Frontend requests POST `/payments/create-order` with `tournamentId` & `teamId`.
3. Backend checks entry fee, calculates platform fee (10% standard) + GST (18%), and generates a Razorpay Order ID.
4. Backend creates a database `Payment` entry (status: `PENDING`).
5. Frontend launches Razorpay Checkout popup. User pays using UPI/Card.
6. Razorpay returns signature parameters. Frontend posts them to POST `/payments/verify`.
7. Backend checks the signature, marks the `Payment` as `COMPLETED`.
8. Backend generates a PDF invoice, writes the link (`invoiceUrl`), and adds the team to `TournamentRegistration`.
9. Socket.io pushes a `registration:new` event to all clients to update slot fill bars.
10. SendGrid transporter emails a copy of the PDF invoice.
```

### B. Live Match Lobby ID Distribution
```
1. Organizer enters Custom Match Room ID & Password in dashboard, clicking "Publish".
2. Backend updates `Tournament` row, logging `lobbyId` and `lobbyPassword`.
3. Backend fetches all verified registered team players.
4. Backend triggers concurrent SendGrid emails to all participants containing the lobby credentials.
5. Socket.io emits a `lobby:set` payload to players currently viewing the tournament.
```

---

## 10. Environment Variables

### Frontend Variables
- `NEXT_PUBLIC_API_URL`: Live URL of the Node Express backend (e.g. `https://api.playhive.gg`).
- `NEXT_PUBLIC_SOCKET_URL`: Live WebSocket URL of the backend (e.g. `https://api.playhive.gg`).
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public dashboard API key.

### Backend Variables
- `DATABASE_URL`: PostgreSQL connection string (Supabase/Neon).
- `JWT_SECRET` / `JWT_REFRESH_SECRET`: Secure cryptographic strings.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Private keys for gateway interactions.
- `SENDGRID_API_KEY`: API authorization key for transactional mail routing.
- `EMAIL_FROM` / `EMAIL_FROM_NAME`: Authorized SendGrid verification sender configuration.

---

## 11. Known Technical Debt & Risks

1. **Client Mock Fallbacks**:
   - The tournament browse page (`/tournaments`) and player dashboard statistics use mock lists. These must be replaced with server fetches via React Query.
2. **Local Upload Storage**:
   - Invoice PDF generation saves files directly to local directories (`/uploads/invoices`). If the server restarts (especially on ephemeral platforms like Railway/Heroku), these invoices will be lost.
   - *Fix needed*: Stream invoice files directly to Cloudinary or AWS S3.
3. **Synchronous Email Loops**:
   - The `PATCH /tournaments/:id/lobby` route executes emails synchronously using a `for...of` loop. For squad formats with 100+ players, this will block the main thread and request execution.
   - *Fix needed*: Move email jobs to a background queue using **BullMQ**.
4. **Vercel Sockets incompatibility**:
   - Next.js serverless runtimes do not support continuous WebSocket streams. The backend Express API must remain on a dedicated VPS/PaaS (Railway/Render) to ensure Socket.io stays active.
