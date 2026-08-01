# Product Requirements Document (PRD) — AutoDM (Instagram Business OS)

## 1. Product Vision & Executive Summary

AutoDM is India's premier Meta-compliant Instagram DM automation engine and social business operating system. It converts high-volume comment engagement into direct buyer conversations, qualified leads, and digital commerce revenue on autopilot.

---

## 2. Meta Development Mode & Permission Diagnostic Models

### A. Meta Error (#200): Dev Mode Tester Restrictions

- **Behavior**: In Dev Mode (before App Review), Meta Graph API **ONLY** allows sending DMs and receiving webhooks for Instagram accounts registered as **Developers, Admins, or Testers** in the Meta App Dashboard under _App Roles_.
- **Resolution**: Register commenter handles as **Testers** in Meta Developer Console under App Roles, or submit for App Review to enable Live Mode.

### B. Meta Error (#230): Permission Scope & Access Token Refresh

- **Behavior**: Meta error `(#230) Requires pages_messaging permission to manage the object` indicates that the Facebook Page / Instagram Page Access Token lacks `pages_messaging` or `instagram_manage_messages` scope permissions.
- **Resolution**: Disconnect and re-connect the Instagram Account in Settings -> Accounts, ensuring all Facebook Page permission checkboxes are checked during Meta OAuth authorization.

---

## 3. Webhook Audit Logs & Scoping Specs

### Log Table Specifications

The Webhook Audit Logs interface (`/admin` -> Webhooks tab or `<WebhookLogs>`) renders a real-time correlation table:

| Column Header        | Field Source                | Description & Format                                                 |
| -------------------- | --------------------------- | -------------------------------------------------------------------- |
| **Time**             | `WebhookEvent.createdAt`    | Time & date timestamp (`HH:mm:ss YYYY-MM-DD`).                       |
| **Comment ID**       | `WebhookEvent.commentId`    | Native Instagram Comment ID (`1784...`).                             |
| **User**             | `WebhookEvent.username`     | Instagram commenter handle (`@username`).                            |
| **Send Status**      | `WebhookEvent.status`       | Status badge (`PROCESSED`, `FAILED`, `PENDING`, `PAUSED`).           |
| **Error Diagnostic** | `WebhookEvent.errorMessage` | Formatted Meta API error message with Dev Mode & Scope guidance.     |
| **fbtrace_id**       | `WebhookEvent.fbtraceId`    | Unique Meta trace ID returned by Graph API for Meta support tickets. |

### Access Scoping & Control Features

- **User-Scoped Creator Access**: Creator users only view webhooks matching their connected Instagram accounts (`userId` scope).
- **Dedicated Admin Audit Tab**: Dedicated "Webhooks Audit" tab in the Admin Panel (`/admin` -> Webhooks tab) for global system inspection.
- **Global Webhook Pause Switch**: Enables 1-click system-wide webhook processing pause/resume.
- **Timeframe Purge Selector**: Allows deleting logs by timeframe (`All Logs`, `Older than 24h`, `Older than 7d`, `Older than 30d`).
- **Failed Jobs Purge & Refresh**: Supports timeframe purging for failed jobs in BullMQ queues and `QueueJob` database records.
- **Section Refresh Buttons**: Header refresh buttons added to Active Automations (`<CampaignsList>`), Analytics (`<StatsGrid>`), Webhooks (`<WebhookLogs>`), and Failed Jobs (`<FailedJobs>`).

---

## 4. Clean Logging Directives

- Muted verbose background logs (`Received incoming message`, `No active messaging campaigns for account`) to ensure clean server logs.

---

## 5. Core Automation Campaign Types

| Campaign Type           | Trigger Event                             | Action / Response                              | Use Case                                      |
| ----------------------- | ----------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| **`COMMENT_TO_DM`**     | Public post comment matching keywords     | Sends private DM with digital resource or link | Lead magnets ("Comment 'EBOOK' for guide")    |
| **`KEYWORD_TO_DM`**     | Direct message text matching keywords     | Sends automated direct message reply           | FAQ answering & instant resource delivery     |
| **`WELCOME_DM`**        | New user follows the Instagram account    | Sends automated welcome direct message         | Onboarding new followers & introducing offers |
| **`STORY_REPLY_TO_DM`** | User replies to an active Instagram Story | Sends automated message response flow          | Story flash sales & interactive polls         |
| **`COMMENT_REPLY`**     | Public post comment on Instagram media    | Posts automated public comment reply on post   | Boosting post engagement & algorithm reach    |

---

## 3. Follow Gate Mechanism & Native Instagram Rules

- **Follow Gate Protection**: If enabled on a campaign, the system verifies whether the user is following the Instagram account before delivering campaign materials.
- **Native Quick Reply Constraints**: In compliance with Meta guidelines, direct message buttons **must not open external browser pages**. The system dispatches native Instagram Quick Reply buttons containing payload string `CONFIRM_FOLLOW_CAMPAIGN_<campaignId>`.
- **Confirmation Verification Loop**: When the user taps **"I am following! 📖"**, Meta posts a webhook payload to `/instagram/webhook`. The worker verifies their follow status:
  - **Verified Following**: Delivers the resource link DM.
  - **Not Following**: Prompts them again cleanly inside the direct message thread.
- **Sandbox Verification Mode**: Test accounts ending in odd IDs simulate "Following", while even IDs simulate "Not Following".

---

## 4. Administrative Controls & Portal Capabilities

The system includes an Admin Portal (`/admin`) guarded by `ADMIN` user role privileges:

1. **Creator User Management**: Inspect creators, manage subscription plans (`FREE`, `PRO`, `ENTERPRISE`), and suspend/unsuspend accounts.
2. **Campaign Supervision**: System-wide campaign status table with pause/archive controls.
3. **Queue Health & Inspector**: Real-time BullMQ job monitoring with raw error stack traces for failed jobs.
4. **Webhook Logging & Controls**: Live Meta webhook event logger. Features a global **Pause Webhook** switch to freeze event ingestion during database maintenance.
5. **Feature Flag Manager**: Dynamic feature flag toggles per subscription plan (`COMMENT_TO_DM`, `WELCOME_DM`, `WEBHOOK_LOGS`).
6. **Promotions Engine**: Configures site-wide marketing banners, promotional discount percentages, and countdown notices.
7. **Support Ticket Resolution**: In-app customer support ticketing module allowing admins to resolve user tickets.
8. **Account Deletion Approval**: Handles GDPR user account deletion requests safely.

---

## 5. Pricing Matrix & Feature Flags

| Plan Tier        | Price (Monthly / Yearly) | Campaign Limit | Keyword Limit | DM Limit (Monthly) | Enabled Capabilities                              |
| ---------------- | ------------------------ | -------------- | ------------- | ------------------ | ------------------------------------------------- |
| **`FREE`**       | ₹0 / ₹0                  | 1 Campaign     | 3 Keywords    | 100 DMs            | Standard Comment-to-DM                            |
| **`PRO`**        | ₹999 / ₹799/mo           | 10 Campaigns   | 25 Keywords   | 5,000 DMs          | All Campaign Types + Follow Gate + Analytics      |
| **`ENTERPRISE`** | Custom / Contact         | Unlimited      | Unlimited     | 50,000 DMs         | Priority Queue + Webhook Logs + Dedicated Support |
