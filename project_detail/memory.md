# Context Memory & System Constraints — AutoDM (Instagram Business OS)

## 1. Environment & Infrastructure Topology

- **Production API Base URL**: `https://api.dmpilot.org`
  - Hosted on a physical Ubuntu 25.10 Lab PC listening on port `4000`.
  - Publicly exposed via Cloudflare Tunnel (`cloudflared`) forwarding traffic directly to `localhost:4000`.
  - PostgreSQL (Database) and Redis 7 (Queue broker) run locally on the Ubuntu host.
- **Production Frontend URL**: `https://www.dmpilot.org` (and `https://dmpilot.org`)
  - Deployed on Vercel Edge Cloud.
- **Development Workstation**: macOS workstation used for active code editing, testing, and git pushes.
- **Local Fallback Base URL**: `http://localhost:4000` (API) & `http://localhost:3000` (Web).

---

## 2. Critical Meta API & Button Interaction Rules

- **No External Links inside Instagram Direct Messages**: Direct message buttons **must not open external websites or browser webviews**.
- **Native Quick Replies**: All interactive confirmations use native Meta Direct Message **Quick Reply** buttons with custom payload routing:
  ```json
  {
    "recipient": { "id": "<recipient_id>" },
    "message": {
      "text": "Hey! Tap below once you are following to unlock your download link:",
      "quick_replies": [
        {
          "content_type": "text",
          "title": "I am following! 📖",
          "payload": "CONFIRM_FOLLOW_CAMPAIGN_<campaignId>"
        }
      ]
    }
  }
  ```
- **Sandbox Odd/Even ID Fallback**: To facilitate testing without live Graph API tokens:
  - Recipient ID ending in an **odd number** (e.g. `...12345`) = Simulated as "Following" (prompt bypassed).
  - Recipient ID ending in an **even number** (e.g. `...12342`) = Simulated as "Not Following" (Follow Prompt sent).
- **Meta Dev Mode Restriction**: In Meta Development Mode, **only registered Testers** in the Meta Developer Console can receive webhooks and automated direct messages.

---

## 3. Account Linking & OAuth Handshake Steps

1. User logs in to Facebook via NextAuth / OAuth dialog (`/instagram/connect`).
2. Requests Meta permission scopes:
   - `instagram_basic`: Access account profile & media.
   - `instagram_manage_messages`: Send and receive direct messages.
   - `instagram_manage_comments`: Read comments and post public replies.
   - `pages_show_list` & `pages_read_engagement`: Access linked Facebook Pages.
3. System exchanges short-lived user token for a 60-day long-lived access token.
4. Auto-subscribes the connected Facebook Page to application webhooks (`POST /v20.0/{page_id}/subscribed_apps`).
5. Stores page access token transparently encrypted with AES-256-GCM in PostgreSQL.

---

## 4. Context Memory Document — AutoDM (Instagram Business OS)

## Session Updates (August 2026)

### 1. User-Scoped Webhooks per Creator Account

- **Creator Scoping**: Updated `MonitoringController` and `MonitoringService.getWebhookLogs` using `@GetUser()` decorator to resolve `user.id`. Creator users only view webhooks associated with their own connected Instagram accounts (`userId` scope).
- **Dedicated Admin Webhooks Tab**: Added dedicated `webhooks` ("Webhooks Audit") tab to `apps/web/app/admin/page.tsx` rendering `<WebhookLogs />` with global system-wide view (`isStaff = true`).

### 2. Section Refresh Controls (`RefreshCw` Icon & Active Spin)

- Updated section headers across `<WebhookLogs>`, `<FailedJobs>`, `<CampaignsList>`, `<StatsGrid>`, and Admin Monitoring to use `RefreshCw` with active `animate-spin` loading feedback.
- Creators and Admins can refresh data in any section independently without reloading full pages.

### 3. Failed Jobs Sync & Timeframe Delete Functionality

- Enhanced `MonitoringService.getFailedJobs` to aggregate failed jobs from both BullMQ queues (`send_dm`, `instagram_media_fetch`) and `QueueJob` database records where `status = 'FAILED'`.
- Implemented `DELETE /monitoring/failed-jobs` supporting timeframe purging (`All Failed`, `Older than 24h`, `Older than 7d`, `Older than 30d`) with UI controls in `<FailedJobs>`.
- **SEO & Google Search Console Verification**: Configured `verification: { google: 'HFp8bpyG41psm7hb5aYEgShOZ50wfwEnVCsbBKZEfp8' }` in `apps/web/app/layout.tsx` metadata. Renders `<meta name="google-site-verification" content="HFp8bpyG41psm7hb5aYEgShOZ50wfwEnVCsbBKZEfp8" />` across all pages.
- **Pricing Data Centralization & Instant Loading**: Created `apps/web/lib/pricing-data.ts` as the single canonical file containing fallback pricing plans (`DEFAULT_PLANS`), launch promotions (`DEFAULT_PROMO`), plan feature flags (`DEFAULT_FEATURE_FLAGS`), and comparison matrix specifications (`COMPARISON_SPECIFICATIONS`). Pricing page (`/pricing`) initializes state immediately with this data, eliminating full-screen loading spinners and guaranteeing **0ms instant rendering** even if backend APIs are offline or unreachable.
- **API Client Centralization**: Converted all raw `fetch` calls across 18 components to use `@/lib/api-client` utilities (`apiRequest` & `fetchWithAuth`).
- **Session Type Augmentation**: Extended `next-auth` module definitions (`types/next-auth.d.ts`) to natively include `role`, `isVerified`, and `plan` on `session.user`. Replaced 14 unsafe `(session?.user as any)?.role` casts with standard typed access.
- **Dead Code Cleanup**: Removed unused `lib/env.ts` utility.
- **TypeScript & Linter Enforcement**: 0 TypeScript compilation errors, 0 `console.log` statements, 0 `as any` casts.
