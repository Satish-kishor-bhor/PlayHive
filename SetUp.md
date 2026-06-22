# 🎮 PlayHive — Complete Setup Guide

> Step-by-step guide to get PlayHive running locally from scratch.

---

## 📋 Prerequisites

Make sure you have the following installed before starting:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v20+ | [nodejs.org](https://nodejs.org) |
| **npm** | v10+ | Comes with Node.js |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |
| **VS Code** (recommended) | Latest | [code.visualstudio.com](https://code.visualstudio.com) |

---

## 🔑 External API Keys Required

You'll need accounts and API keys from these services:

| Service | Purpose | Free Tier? | Link |
|---------|---------|-----------|------|
| **Razorpay** | Payments + Payouts | ✅ Test mode free | [razorpay.com](https://razorpay.com) |
| **SendGrid** | Email delivery | ✅ 100 emails/day free | [sendgrid.com](https://sendgrid.com) |
| **Cloudinary** | File/image storage | ✅ 25GB free | [cloudinary.com](https://cloudinary.com) |
| **MSG91** | OTP SMS | ✅ Trial credits | [msg91.com](https://msg91.com) |
| **Google Cloud** | OAuth login | ✅ Free | [console.cloud.google.com](https://console.cloud.google.com) |

---

## 🚀 Step-by-Step Local Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Satish-kishor-bhor/PlayHive.git
cd PlayHive
```

---

### Step 2 — Start the Database & Redis (Docker)

Make sure Docker Desktop is running, then:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on port `5432`
- **Redis 7** on port `6379`

Verify they're running:
```bash
docker ps
```

You should see `playhive_db` and `playhive_redis` containers.

---

### Step 3 — Install All Dependencies

From the root of the project:

```bash
npm install
```

This installs packages for all workspaces (frontend + backend) in one command.

---

### Step 4 — Configure Backend Environment

```bash
cd apps/backend
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
# ── Core ──────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ──────────────────────────────────
DATABASE_URL="postgresql://playhive:playhive_secret@localhost:5432/playhive_db"

# ── Redis ─────────────────────────────────────
REDIS_URL="redis://localhost:6379"

# ── JWT (change these in production!) ─────────
JWT_SECRET="your_strong_random_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_strong_refresh_secret_here"
JWT_REFRESH_EXPIRES_IN="7d"

# ── Razorpay (get from razorpay.com dashboard) ─
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXX"

# ── SendGrid (get from sendgrid.com) ──────────
SENDGRID_API_KEY="SG.XXXXXXXXXXXXXXXXXXXX"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="PlayHive"

# ── MSG91 (for OTP SMS) ───────────────────────
MSG91_AUTH_KEY="your_msg91_key"
MSG91_TEMPLATE_ID="your_template_id"

# ── Cloudinary ────────────────────────────────
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# ── Google OAuth ──────────────────────────────
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# ── Platform Config ───────────────────────────
PLATFORM_FEE_PERCENT=10
GST_PERCENT=18
TDS_THRESHOLD=10000
TDS_PERCENT=30

# ── Frontend URL ──────────────────────────────
FRONTEND_URL="http://localhost:3000"
```

---

### Step 5 — Configure Frontend Environment

```bash
cd apps/frontend
```

Create `.env.local` (already created, just verify):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_NAME=PlayHive
```

---

### Step 6 — Set Up the Database

Run Prisma migrations to create all tables:

```bash
# From project root
cd apps/backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init
```

To view your database visually:
```bash
npx prisma studio
```
This opens a browser GUI at `http://localhost:5555`

---

### Step 7 — Run the Project

#### Option A: Run both simultaneously (from root)
```bash
npm run dev
```

#### Option B: Run separately (in two terminals)

**Terminal 1 — Backend:**
```bash
npm run dev:backend
```
API will be live at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
```
App will be live at: `http://localhost:3000`

---

## ✅ Verify Everything is Working

| Check | URL | Expected |
|-------|-----|----------|
| Frontend | `http://localhost:3000` | PlayHive landing page |
| Backend health | `http://localhost:5000/health` | `{"status":"healthy"}` |
| Prisma Studio | `http://localhost:5555` | Database GUI |
| PostgreSQL | `localhost:5432` | Connected via Docker |
| Redis | `localhost:6379` | Connected via Docker |

---

## 🧰 How to Get API Keys

### Razorpay (Payments)
1. Go to [razorpay.com](https://razorpay.com) → Sign Up
2. Dashboard → Settings → API Keys
3. Click **Generate Test Key**
4. Copy `Key ID` and `Key Secret` into `.env`
5. For **Payouts API** (prize distribution): Settings → Payout → Enable

### SendGrid (Emails)
1. Go to [sendgrid.com](https://sendgrid.com) → Sign Up Free
2. Settings → API Keys → Create API Key
3. Give it "Full Access" or "Mail Send" permissions
4. Copy the key into `.env` as `SENDGRID_API_KEY`
5. Also verify your sender email in Settings → Sender Authentication

### Cloudinary (File Storage for KYC docs, banners)
1. Go to [cloudinary.com](https://cloudinary.com) → Sign Up Free
2. Dashboard shows your Cloud Name, API Key, API Secret
3. Copy all three into `.env`

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create New Project → "PlayHive"
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Add Authorized redirect URI: `http://localhost:5000/api/v1/auth/google/callback`
5. Copy Client ID and Secret into `.env`

### MSG91 (SMS OTP)
1. Go to [msg91.com](https://msg91.com) → Sign Up
2. Get Auth Key from Dashboard
3. Create a flow/template for OTP
4. Copy Auth Key and Template ID into `.env`

---

## 🐳 Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

---

## 🏗️ Project Structure Reference

```
PlayHive/
├── apps/
│   ├── backend/                    # Express.js API Server
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Database schema
│   │   ├── src/
│   │   │   ├── index.ts            # Server entry point
│   │   │   ├── routes/             # API route handlers
│   │   │   │   ├── auth.ts         # Auth endpoints
│   │   │   │   ├── tournaments.ts  # Tournament endpoints
│   │   │   │   ├── payments.ts     # Razorpay payment endpoints
│   │   │   │   ├── payouts.ts      # Prize payout endpoints
│   │   │   │   ├── results.ts      # Match results endpoints
│   │   │   │   ├── disputes.ts     # Dispute system endpoints
│   │   │   │   ├── teams.ts        # Team management endpoints
│   │   │   │   ├── users.ts        # User profile endpoints
│   │   │   │   ├── notifications.ts# Notification endpoints
│   │   │   │   └── admin.ts        # Admin panel endpoints
│   │   │   ├── services/
│   │   │   │   ├── emailService.ts # All email templates
│   │   │   │   └── invoiceService.ts# PDF invoice generator
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts         # JWT + role middleware
│   │   │   │   ├── rateLimiter.ts  # Rate limiting
│   │   │   │   └── errorHandler.ts # Global error handler
│   │   │   ├── socket/
│   │   │   │   └── handlers.ts     # Socket.io real-time events
│   │   │   ├── lib/
│   │   │   │   └── prisma.ts       # Prisma client singleton
│   │   │   └── utils/
│   │   │       ├── logger.ts       # Winston logger
│   │   │       └── helpers.ts      # Utility functions
│   │   ├── .env.example            # Environment template
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # Next.js 14 Web App
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx        # Landing page
│       │   │   ├── layout.tsx      # Root layout + metadata
│       │   │   ├── globals.css     # Global styles + design system
│       │   │   ├── providers.tsx   # React Query provider
│       │   │   ├── auth/
│       │   │   │   ├── login/      # Login page
│       │   │   │   └── register/   # Register + OTP verify
│       │   │   ├── tournaments/    # Tournament listing + filters
│       │   │   └── dashboard/      # Player dashboard
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Navbar.tsx  # Navigation bar
│       │   │   │   └── Footer.tsx  # Footer
│       │   │   ├── tournaments/
│       │   │   │   └── TournamentCard.tsx
│       │   │   └── ui/
│       │   │       ├── CountUp.tsx # Animated counter
│       │   │       └── toaster.tsx # Toast notifications
│       │   └── stores/
│       │       └── authStore.ts    # Zustand auth state
│       ├── .env.local              # Frontend env vars
│       ├── tailwind.config.js      # BGMI dark theme config
│       ├── next.config.js
│       ├── postcss.config.js
│       └── package.json
│
├── docker-compose.yml              # PostgreSQL + Redis
├── package.json                    # Monorepo root (npm workspaces)
└── .gitignore
```

---

## ❗ Common Issues & Fixes

### `Error: connect ECONNREFUSED 127.0.0.1:5432`
**Fix:** Docker isn't running or containers aren't started.
```bash
docker-compose up -d
```

### `PrismaClientInitializationError`
**Fix:** Run migrations first.
```bash
cd apps/backend && npx prisma migrate dev
```

### `Module not found: Can't resolve '@/...'`
**Fix:** TypeScript path alias issue. Make sure `tsconfig.json` has `"@/*": ["./src/*"]`

### `Razorpay: Invalid key`
**Fix:** Make sure you're using **Test** keys (start with `rzp_test_`) in development.

### `SendGrid: Forbidden`
**Fix:** Verify your sender email in SendGrid dashboard → Sender Authentication.

---

## 📞 Support

- **Discord:** [discord.gg/playhive](https://discord.gg/playhive)
- **Email:** support@playhive.gg
- **GitHub Issues:** [github.com/Satish-kishor-bhor/PlayHive/issues](https://github.com/Satish-kishor-bhor/PlayHive/issues)
