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

## 4. Refactoring Audit Log (Phase 21, Phase 22 & Phase 23)

## Session Updates (July 2026)

### 1. Webhook Failure Correlation & Audit Log Table

- Created a clean Webhook Audit & Failure Logs table rendering:
  `Time | Comment ID | User | Send Status | Error Diagnostic | fbtrace_id`
- Updated `WebhookEvent` model with `commentId`, `username`, `senderId`, and `fbtraceId`.
- Updated `Message` model with `fbtraceId`.
- Updated `SendDmProcessor` to capture Meta Graph API trace header (`x-fb-trace-id`) and JSON `fbtrace_id`.
- Added global **Pause / Resume Webhooks** switch.
- Added **Select Timeframe Purge** dropdown (`All Logs`, `Older than 24h`, `Older than 7d`, `Older than 30d`) with Purge execution button.
- Built **Audit Inspector Modal** displaying full error trace, Meta Dev Mode explanation, `fbtrace_id` copy button, and raw JSON webhook payload viewer.

### 2. Meta Development Mode Root Cause Explanation

- **Why DMs work for some accounts and fail for others**:
  When an app is in **Meta Development Mode** (prior to official App Review approval), Meta Graph API **ONLY** permits webhooks and DM delivery for Instagram accounts registered as **Developers, Admins, or Testers** in the Meta App Dashboard under _App Roles_.
- When a non-tester user comments, Meta either suppresses the webhook or rejects the `/me/messages` request with error `(#200) Requires instagram_manage_messages permission`.
- Formatted explicit diagnostic error messages in the backend and audit log UI guiding developers to add non-tester accounts to Meta App Roles.

### 3. Log Noise Cleanup

- Removed verbose console logs (`Received incoming message`, `No active messaging campaigns for account`) from `MessageAutomationService` and `CommentAutomationService`.

* **SEO & Google Search Console Verification**: Configured `verification: { google: 'HFp8bpyG41psm7hb5aYEgShOZ50wfwEnVCsbBKZEfp8' }` in `apps/web/app/layout.tsx` metadata. Renders `<meta name="google-site-verification" content="HFp8bpyG41psm7hb5aYEgShOZ50wfwEnVCsbBKZEfp8" />` across all pages.
* **Pricing Data Centralization & Instant Loading**: Created `apps/web/lib/pricing-data.ts` as the single canonical file containing fallback pricing plans (`DEFAULT_PLANS`), launch promotions (`DEFAULT_PROMO`), plan feature flags (`DEFAULT_FEATURE_FLAGS`), and comparison matrix specifications (`COMPARISON_SPECIFICATIONS`). Pricing page (`/pricing`) initializes state immediately with this data, eliminating full-screen loading spinners and guaranteeing **0ms instant rendering** even if backend APIs are offline or unreachable.
* **API Client Centralization**: Converted all raw `fetch` calls across 18 components to use `@/lib/api-client` utilities (`apiRequest` & `fetchWithAuth`).
* **Session Type Augmentation**: Extended `next-auth` module definitions (`types/next-auth.d.ts`) to natively include `role`, `isVerified`, and `plan` on `session.user`. Replaced 14 unsafe `(session?.user as any)?.role` casts with standard typed access.
* **Dead Code Cleanup**: Removed unused `lib/env.ts` utility.
* **TypeScript & Linter Enforcement**: 0 TypeScript compilation errors, 0 `console.log` statements, 0 `as any` casts.
