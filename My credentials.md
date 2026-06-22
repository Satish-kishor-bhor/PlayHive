# 🔐 PlayHive — Production Deployment & Credentials Guide

Deploying PlayHive to production requires separating the **Frontend (Vercel)** and the **Backend (Railway/Render)** since the backend uses continuous WebSockets (`Socket.io`) which are not supported on Vercel's serverless environment.

Here is the checklist of credentials and environment variables you need to replace with your personal/production values.

---

## 💻 1. Frontend Environment Variables (Deploying to Vercel)

These variables must be configured in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Description / Action Required | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The live URL of your deployed Express backend. | `https://api.playhive.com` or `https://playhive-backend.up.railway.app` |
| `NEXT_PUBLIC_SOCKET_URL` | The live WebSocket URL of your Express backend (same domain as API URL). | `https://api.playhive.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your production Razorpay Key ID from the Razorpay Dashboard. | `rzp_live_xxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_NAME` | The display name of your application. | `PlayHive` |

---

## ⚙️ 2. Backend Environment Variables (Deploying to Railway/Render/VPS)

These variables must be configured in your backend deployment platform settings (e.g., Railway, Render):

### 🔑 Authentication & Security
| Variable Name | Description / Action Required | Recommendation |
| :--- | :--- | :--- |
| `JWT_SECRET` | A secure, random string used to sign user auth tokens. | Generate using `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | A separate secure string used to sign refresh tokens. | Generate using `openssl rand -base64 32` |
| `FRONTEND_URL` | The live URL of your deployed Next.js frontend (Vercel URL). | `https://playhive.vercel.app` or `https://playhive.com` |

### 🗄️ Database & Cache Connections
| Variable Name | Description / Action Required | Recommendation / Host |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production PostgreSQL connection URL. Must support connection pooling. | **Supabase**, **Neon.tech**, or **Aiven** |
| `REDIS_URL` | Production Redis connection URL. Used for OTP limits, cache, and socket state. | **Upstash** (Serverless Redis) or **Aiven** |

### 💳 Razorpay Payment Gateway (Live Mode)
| Variable Name | Description / Action Required | Location in Dashboard |
| :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Your live Razorpay Key ID. | Settings > API Keys |
| `RAZORPAY_KEY_SECRET` | Your live Razorpay Key Secret. Keep this highly secure! | Settings > API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Secret key used to verify payment webhooks from Razorpay. | Settings > Webhooks (set payload URL to `https://<your-backend>/api/payments/webhook`) |

### ✉️ Email Service (SMTP / SendGrid)
| Variable Name | Description / Action Required | Recommendation |
| :--- | :--- | :--- |
| `SMTP_HOST` | Host address of your email service provider. | `smtp.gmail.com` (Gmail) or `smtp.sendgrid.net` |
| `SMTP_PORT` | Port used by your email provider. | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | Email username or API key user. | Your email address or `apikey` |
| `SMTP_PASSWORD` | App password (for Gmail) or SendGrid API Key. | Gmail App Password (do NOT use your account password) |
| `FROM_EMAIL` | The sender address that users will see on OTP & invoices. | `noreply@playhive.com` or your verified domain email |

### 🏢 GST & Invoicing Info
| Variable Name | Description / Action Required | Value |
| :--- | :--- | :--- |
| `COMPANY_NAME` | Registered business name for invoice headers. | e.g. `PlayHive Esports Private Limited` |
| `GSTIN` | Your Goods and Services Tax Identification Number (15-digit). | Required for legal compliance in India |
| `STATE_CODE` | The state code where your company is registered. | e.g., `27` for Maharashtra |

---

## 🛠️ Step-by-Step Production Setup

1. **Database Setup**:
   * Create a free/paid PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
   * Copy the connection string and paste it into the `DATABASE_URL` field in the backend settings.
   * Run Prisma migrations to initialize the tables:
     ```bash
     npx prisma migrate deploy
     ```

2. **Redis Setup**:
   * Create a Redis database on [Upstash](https://upstash.com) (free tier is perfect).
   * Copy the Redis URL (looks like `rediss://default:password@endpoint.upstash.io:port`).

3. **Backend Deployment**:
   * Connect your GitHub repo to Railway or Render.
   * Set the root directory/build command to target `apps/backend`.
   * Add all backend environment variables listed above.

4. **Frontend Deployment**:
   * Connect your GitHub repo to Vercel.
   * Configure the framework preset as **Next.js**.
   * Set the root directory of the Vercel project to `apps/frontend`.
   * Add all frontend environment variables.
