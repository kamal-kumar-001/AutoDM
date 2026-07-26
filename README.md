# AutoDM — Instagram Business OS (Direct Message & Comment Automation)

AutoDM is a Meta-compliant, high-performance direct messaging and comment automation platform built for creators, social commerce brands, and agencies. It automates lead capture by converting post comments, story replies, and direct messages into personalized automated DMs, public comment replies, and follow-gated resources.

---

## 1. Hybrid Production Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION SYSTEM TOPOLOGY                        │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  Frontend Web Application (Vercel)   │  Backend REST API (Ubuntu Lab PC)    │
│  • Public URL: https://www.dmpilot.org│  • API Domain: https://api.dmpilot.org│
│  • Next.js 14 (App Router)           │  • Cloudflare Tunnel -> localhost:4000│
│  • NextAuth.js Credentials + JWT     │  • NestJS REST API Server            │
│  • Framer Motion & TailwindCSS       │  • PostgreSQL 15 & Redis 7 (BullMQ)  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

- **Frontend**: Hosted on Vercel at `https://www.dmpilot.org`.
- **Backend**: Self-hosted on an Ubuntu 25.10 Lab PC listening on port `4000`.
- **Cloud Tunnels**: Cloudflare Tunnel (`cloudflared`) exposes `https://api.dmpilot.org` directly to `localhost:4000` on the lab PC.

---

## 2. Technical Stack & Monorepo Structure

```text
AutoDM/
├── apps/
│   ├── api/            # NestJS 10 REST API (Prisma ORM, BullMQ Queues, Passport JWT)
│   └── web/            # Next.js 14 Web App (App Router, NextAuth, Tailwind, Framer Motion)
├── packages/
│   ├── config/         # Shared ESLint presets & tsconfig bases
│   ├── types/          # Shared TypeScript type definitions (@autodm/types)
│   └── ui/             # Shared Monorepo UI library (@autodm/ui)
└── pnpm-workspace.yaml # Monorepo Workspace Configuration
```

---

## 3. Core Automation Features

1. **`COMMENT_TO_DM`**: Automatically sends a direct message containing digital links when a user comments on a post matching keywords.
2. **`KEYWORD_TO_DM`**: Instant inbox responder matching keyword triggers in direct messages.
3. **`WELCOME_DM`**: Greets new followers automatically in their DMs upon hitting "Follow".
4. **`STORY_REPLY_TO_DM`**: Automatically responds when users reply to active Instagram Stories.
5. **`COMMENT_REPLY`**: Posts an automated public comment reply directly under post comment threads.
6. **Follow Gate Protection**: Verifies follower relationship. Non-followers receive a native Meta **Quick Reply** button ("I am following! 📖") before unlocking resources.

---

## 4. Developer Quick-Start Guide

### Prerequisites:

- Node.js (`>=18.0.0`) & PNPM (`>=8.0.0`)
- Docker & Docker Compose
- Redis (`redis-server`)

### Setup Commands:

```bash
# 1. Install Workspace Dependencies
pnpm install

# 2. Start PostgreSQL & Redis Services
docker-compose up -d

# 3. Apply Prisma Database Schema
cd apps/api
npx prisma db push

# 4. Boot Development Servers
cd ../..
pnpm dev
```

- **Frontend Web App**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:4000`

---

## 5. Local Verification Sandbox

To verify the follow-check gate without live Meta tokens:

- Use a test recipient ID ending in an **odd number** (e.g. `12345`) to simulate an active follower. The resource DM delivers immediately.
- Use a test recipient ID ending in an **even number** (e.g. `12342`) to simulate a non-follower. The platform challenges them with the Follow Prompt first.
- Tap **"I am following! 📖"** inside direct messages to bypass the gate and confirm delivery.
