# 🗺️ PlayHive — Frontend & Backend Routing Maps

This document catalogs all registered routes on the Next.js frontend application and Express backend REST API.

---

## 💻 Frontend Routes (Next.js 14 App Router)

All paths reside under `apps/frontend/src/app/`.

| Path | Component Location | Auth Required? | Middleware/Access Controls |
| :--- | :--- | :--- | :--- |
| `/` | `page.tsx` | No | Public landing, features overview |
| `/auth/login` | `auth/login/page.tsx` | No | Redirects to dashboard if already authenticated |
| `/auth/register`| `auth/register/page.tsx`| No | Multi-step user entry & verification |
| `/tournaments` | `tournaments/page.tsx` | No | Search, filter, and view match layouts |
| `/dashboard` | `dashboard/page.tsx` | **Yes** | Client check on persisted Zustand `accessToken` state |

---

## ⚙️ Backend Routes (Express v1 API Router)

All endpoints are prefixed with `/api/v1/` and registered in `apps/backend/src/index.ts`.

### 1. Authentication Router (`/auth`)
Registered in `apps/backend/src/routes/auth.ts`:

- **POST** `/register`
  - *Purpose*: Create user profile and generate validation email OTP.
  - *Auth*: None.
  - *Validation*: Sanitized email, username length (3-20 characters), password checks.
- **POST** `/login`
  - *Purpose*: Verify credentials and issue active authentication tokens.
  - *Auth*: None.
  - *Validation*: Required email and password strings.
- **POST** `/verify-email`
  - *Purpose*: Confirm matching email verification code.
  - *Auth*: None.
- **POST** `/refresh`
  - *Purpose*: Exchange Refresh Token for a new pair of Access & Refresh tokens.
  - *Auth*: None.
- **POST** `/logout`
  - *Purpose*: Blacklist/Delete the active Refresh Token.
  - *Auth*: None.

### 2. Tournaments Router (`/tournaments`)
Registered in `apps/backend/src/routes/tournaments.ts`:

- **GET** `/`
  - *Purpose*: Fetch list of public tournaments.
  - *Auth*: None.
  - *Query filters*: `status`, `format`, `search`, pagination details.
- **GET** `/:slug`
  - *Purpose*: Retrieve detailed profile of a tournament by slug.
  - *Auth*: None.
- **POST** `/`
  - *Purpose*: Insert a new tournament record.
  - *Auth*: Requires `ORGANIZER` or `ADMIN` role.
- **POST** `/:id/register`
  - *Purpose*: Register a team slot for a tournament.
  - *Auth*: User session.
- **PATCH** `/:id/lobby`
  - *Purpose*: Publish custom BGMI custom room lobby details.
  - *Auth*: Requires `ORGANIZER` or `ADMIN` role.
- **PATCH** `/:id/status`
  - *Purpose*: Advance tournament status state machine.
  - *Auth*: Requires `ORGANIZER` or `ADMIN` role.

### 3. Payments Router (`/payments`)
Registered in `apps/backend/src/routes/payments.ts`:

- **POST** `/create-order`
  - *Purpose*: Set up Razorpay payment transaction orders.
  - *Auth*: User session.
- **POST** `/verify`
  - *Purpose*: Cryptographically verify payment confirmation signature and create invoice.
  - *Auth*: User session.
- **POST** `/webhook`
  - *Purpose*: Receive updates from Razorpay servers regarding async payments.
  - *Auth*: Razorpay signature check.
- **GET** `/my`
  - *Purpose*: Fetch invoice transaction history for current user.
  - *Auth*: User session.
