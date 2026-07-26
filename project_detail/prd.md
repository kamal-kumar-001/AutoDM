# Product Requirements Document (PRD) — AutoDM (Instagram Business OS)

## 1. Vision & Purpose

AutoDM is a Meta-compliant direct messaging and comment automation platform built for creators, social commerce brands, and agencies. It automates lead capture by turning public comments, story interactions, and direct messages into personalized automated DMs and replies. The platform is designed to scale into a complete **Instagram Business OS** containing native CRM tracking, AI-powered conversational agents, and social commerce payments.

---

## 2. Core Automation Campaign Types

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
