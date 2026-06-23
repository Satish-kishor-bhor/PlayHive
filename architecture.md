# 🏗️ PlayHive — Architecture Topology

This document details the software architecture topology, communication ports, protocol mappings, and component relationships of the PlayHive platform.

---

## 🗺️ System Topology

```mermaid
graph TD
    %% Clients
    Browser[Player/Organizer Browser]

    %% Edge
    Vercel[Vercel CDN / Next.js hosting]
    Railway[Railway Express.js API Server]

    %% Database & Cache
    PostgreSQL[(PostgreSQL Database neon.tech)]
    Redis[(Redis Cache & Session Broker)]

    %% Services
    SendGrid[SendGrid SMTP Email API]
    Razorpay[Razorpay Payment API Gateway]

    %% Communications
    Browser -->|HTTPS / WSS| Vercel
    Vercel -->|Reverse Proxy / Direct API| Railway
    Railway -->|Prisma Client| PostgreSQL
    Railway -->|ioredis| Redis
    Railway -->|Nodemailer / HTTPS| SendGrid
    Railway -->|Signature / Order Requests| Razorpay
    Razorpay -->|Async Payment Webhooks| Railway
```

---

## 📈 Request Execution Life Cycle

The lifecycle of an API request to a protected endpoint (e.g., fetching user-specific payments):

```
[ Client Browser ]
  │
  ├─► 1. Send GET `/api/v1/payments/my` (with Header: "Authorization: Bearer <JWT>")
  │
  ▼
[ Express Router ]
  │
  ├─► 2. Execute rateLimiter.ts (Check request window bucket count)
  │
  ├─► 3. Execute auth.ts middleware
  │      ├─► Verify JWT signature with local secret
  │      ├─► Extract userId and attach to Request object (`req.user`)
  │      └─► Return 401 if token is expired
  │
  ├─► 4. Route handler (payments.ts) queries Database via Prisma Client
  │      └─► `prisma.payment.findMany({ where: { userId } })`
  │
  ▼
[ Database (PostgreSQL) ] Returns Payment rows
  │
  ▼
[ Express Response ] Send JSON status 200 payload back to client
```
