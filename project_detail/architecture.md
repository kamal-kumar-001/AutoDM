# Technical Architecture Document — AutoDM (Instagram Business OS)

## 1. System Deployment Topology & Infrastructure

AutoDM operates on a high-availability hybrid deployment model combining self-hosted edge infrastructure, cloud tunnels, serverless web hosting, and developer workstations:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION DEPLOYMENT                             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  Frontend Layer (Vercel Cloud)       │  Backend Layer (Lab PC - Ubuntu 25)  │
│  • Domain: https://www.dmpilot.org   │  • Domain: https://api.dmpilot.org   │
│  • Framework: Next.js 14 (App Router)│  • Tunnel: Cloudflare Tunnel         │
│  • Edge CDN & Global Distribution     │  • App Engine: NestJS REST API (:4000)│
│  • Environment: Node.js 18+ runtime  │  • Database: PostgreSQL (Local/Neon) │
│                                      │  • Queue Broker: Redis 7 (BullMQ)    │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                  ▲
                                  │ Direct API Requests & Meta Webhook Events
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPER WORKSTATION (macOS)                       │
│  • Workspace: PNPM Monorepo (`/apps/api`, `/apps/web`, `/packages/*`)        │
│  • CLI Tools: Prisma CLI, Nest CLI, Next.js Dev Server                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Infrastructure Components:

- **Frontend Hosting (Vercel)**: Serves `https://www.dmpilot.org` directly from Vercel's global edge network. Manages static generation, server-side rendering, NextAuth authentication callbacks, and client-side state.
- **Backend Host (Ubuntu 25.10 Lab PC)**: Runs the NestJS API server on port `4000`, along with PostgreSQL (database) and Redis (queue broker).
- **Cloudflare Tunnel (`cloudflared`)**: Routes inbound HTTPS traffic from `https://api.dmpilot.org` to `localhost:4000` on the Ubuntu lab PC without exposing public ports or requiring a static IP.
- **Meta Graph API & Webhooks**: Inbound webhooks from Instagram/Facebook hit `https://api.dmpilot.org/instagram/webhook` via Cloudflare, reaching the NestJS engine in under 150ms.

---

## 2. Technology Stack & Monorepo Structure

AutoDM is structured as a PNPM Monorepo managed via workspace dependencies:

```text
AutoDM/
├── apps/
│   ├── api/             # NestJS 10 REST API, Prisma ORM, BullMQ Processors
│   └── web/             # Next.js 14 App Router, NextAuth.js, TailwindCSS, Framer Motion
└── packages/
    ├── config/          # Shared ESLint, Prettier, and tsconfig presets
    ├── types/           # Shared TypeScript interfaces (ApiResponse, ApiErrorResponse, UserDto)
    └── ui/              # Monorepo UI library (Button, Dialog, Toaster, Tailwind Preset)
```

### Technology Matrix:

- **Frontend Layer**: Next.js 14 (App Router), React 18, TailwindCSS (vanilla custom design system), Framer Motion, TanStack React Query, NextAuth.js (JWT strategy), Lucide React.
- **Backend Layer**: NestJS 10, TypeScript 5, Passport.js (JWT Strategy), Zod (config validation), Class Validator, Nodemailer / Resend.
- **Database & Persistence**: PostgreSQL 15, Prisma ORM 5 (`prisma-client-js`), Redis 7 (`ioredis`).
- **Queue & Background Processing**: BullMQ 5 (`@nestjs/bullmq`) backed by Redis.
- **Payment Gateway**: Razorpay Node.js SDK (`razorpay.paymentLink.create`).

---

## 3. Dynamic Webhook Event Pipeline

When an Instagram commenter interacts with a post or sends a message, the payload flows asynchronously through the following pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Commenter as Instagram User
    participant Meta as Meta Graph API
    participant Ingest as WebhookController (NestJS)
    participant DB as PostgreSQL (Prisma)
    participant Router as WebhookRouterService
    participant Queue as BullMQ (Redis)
    participant Worker as SendDmProcessor

    Commenter->>Meta: Comments "ebook please" on Post
    Meta->>Ingest: POST /instagram/webhook (raw HMAC body)
    Ingest->>Ingest: Verify x-hub-signature-256
    Ingest->>DB: Log WebhookEvent (status: PENDING)
    alt Webhook Processing Paused in Admin
        Ingest->>DB: Update status to PAUSED
        Ingest-->>Meta: 200 OK (Stop pipeline)
    else Normal Processing
        Ingest-->>Meta: 200 OK (Immediate ACK < 200ms)
        Ingest->>Router: Route Event Async
        Router->>DB: Deduplicate comment & Save Comment record
        Router->>Queue: Enqueue send_dm job to SendDmProducer
        Queue->>Worker: Consume job payload
        alt Follow Gate Enabled
            Worker->>Meta: GET /followers (or Sandbox ID check)
            alt User is Following
                Worker->>Meta: POST /me/messages (Send DM with resource link)
            else User Not Following
                Worker->>Meta: POST /me/messages (Send Follow Prompt + Quick Reply Button)
            end
        else Follow Gate Disabled
            Worker->>Meta: POST /me/messages (Send DM with resource link)
        end
        Worker->>DB: Update Comment & Message records to PROCESSED
    end
```

---

## 4. Complete Database Schema (23 Models)

The system uses PostgreSQL managed via Prisma ORM (`prisma/schema.prisma`):

| Model Name             | Purpose & Description                        | Primary Key / Indexes                                | Key Relations                                                |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| **`User`**             | Platform creators and system admins          | `id` (UUID), `@unique(email)`                        | `settings`, `instagramAccounts`, `campaigns`, `subscription` |
| **`Settings`**         | User dashboard preferences (theme, timezone) | `id` (UUID), `@unique(userId)`                       | `user`                                                       |
| **`InstagramAccount`** | Linked Instagram Business channels           | `id` (UUID), `@unique(instagramId)`                  | `user`, `campaigns`, `comments`, `messages`                  |
| **`Campaign`**         | DM & comment automation funnels              | `id` (UUID), `@@index([userId, status])`             | `user`, `instagramAccount`, `keywords`, `posts`              |
| **`Post`**             | Instagram posts attached to a campaign       | `id` (UUID), `@@index([campaignId])`                 | `campaign`                                                   |
| **`Keyword`**          | Trigger phrases for campaign matching        | `id` (UUID), `@@index([campaignId, keyword])`        | `campaign`                                                   |
| **`WebhookEvent`**     | Inbound Meta webhook logs                    | `id` (UUID), `@unique(eventId)`, `@@index([status])` | None                                                         |
| **`Comment`**          | Tracked public post comments                 | `id` (UUID), `@unique(commentId)`                    | `instagramAccount`, `campaign`                               |
| **`Message`**          | Tracked incoming & outgoing DMs              | `id` (UUID), `@unique(messageId)`                    | `instagramAccount`, `campaign`                               |
| **`QueueJob`**         | Internal BullMQ job audit log                | `id` (UUID), `@@index([status, runAt])`              | None                                                         |
| **`ApiLog`**           | HTTP API request/response audit trail        | `id` (UUID), `@@index([userId, statusCode])`         | `user`                                                       |
| **`Notification`**     | User dashboard alerts & system events        | `id` (UUID), `@@index([userId, isRead])`             | `user`                                                       |
| **`AuditLog`**         | Admin & security activity audit trail        | `id` (UUID), `@@index([userId, createdAt])`          | `user`                                                       |
| **`RefreshToken`**     | JWT Refresh Token session persistence        | `id` (UUID), `@unique(token)`                        | `user`                                                       |
| **`Subscription`**     | Billing tier & subscription state            | `id` (UUID), `@unique(userId)`                       | `user`                                                       |
| **`Invoice`**          | Payment transaction receipts                 | `id` (UUID), `@@index([userId])`                     | `user`                                                       |
| **`BillingPlan`**      | Pricing tier limits & metadata               | `id` (UUID), `@unique(key)`                          | None                                                         |
| **`FeatureFlag`**      | System feature toggles per plan              | `id` (UUID), `@unique(key)`                          | None                                                         |
| **`UsageRecord`**      | Monthly usage metrics tracking               | `id` (UUID), `@@unique([userId, metric, period])`    | `user`                                                       |
| **`DeleteRequest`**    | User account deletion requests               | `id` (UUID), `@unique(userId)`                       | `user`                                                       |
| **`SystemSetting`**    | System key-value configurations              | `id` (UUID), `@unique(key)`                          | None                                                         |
| **`SupportTicket`**    | User customer support tickets                | `id` (UUID), `@@index([userId])`                     | `user`                                                       |
| **`FollowerHistory`**  | 30-day daily follower counts for charts      | `id` (UUID), `@@unique([instagramAccountId, date])`  | `instagramAccount`                                           |

---

## 5. Centralized API Client Architecture (`apps/web/lib/api-client.ts`)

All frontend API calls pass through a centralized communication wrapper:

```typescript
// Single Source of Truth for Endpoint Domain
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.dmpilot.org';

// Typed High-Level Client with Envelope Unwrapping & Session Token Injection
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T>;

// Lightweight Authenticated Fetch Helper for Dashboards
export async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T>;
```

### Key Technical Guarantees:

1. **Automatic Bearer Injection**: Fetches NextAuth session client-side and sets `Authorization: Bearer <accessToken>`.
2. **CORS & Tunnel Headers**: Appends `ngrok-skip-browser-warning` and `Content-Type: application/json` to every request.
3. **Envelope Normalization**: Automatically strips NestJS `{ success: true, data: T }` wrappers to return unwrapped data directly to React components.
4. **Friendly Error Translation**: Intercepts backend database codes and throws human-readable `ApiError` instances.

---

## 6. Token Security & Encryption Architecture

- **Access Token**: Short-lived JWT (15-minute expiration) signed with `JWT_SECRET`. Contains payload `{ sub: userId, email, role }`.
- **Refresh Token**: 64-byte secure random hex string saved in `RefreshToken` table with 30-day expiration. Automatic rotation on `/auth/refresh`.
- **Instagram Access Token Encryption**: AES-256-GCM symmetric encryption for connected Instagram page access tokens using `ENCRYPTION_KEY`. Tokens are stored as `iv:ciphertext:tag` and decrypted only in memory during graph API requests.
- **Password Hashing**: Salted with `bcrypt` (10 rounds).
- **Webhook Signature Verification**: Verifies `x-hub-signature-256` header on incoming Meta raw request bodies using `META_APP_SECRET`.
