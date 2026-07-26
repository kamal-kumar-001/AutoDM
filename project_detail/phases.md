# Phased Roadmap Document — Transition to Instagram Business OS

AutoDM's MVP establishes a robust automated messaging foundation. The roadmap details the steps to transition the platform into a comprehensive **Instagram Business OS** for social commerce, lead nurturing, and creators.

---

## Phase 1: Automation Core & Webhook Engine (Completed)

- Multi-campaign automation engine (`COMMENT_TO_DM`, `KEYWORD_TO_DM`, `WELCOME_DM`, `STORY_REPLY_TO_DM`, `COMMENT_REPLY`).
- Direct Message queues powered by BullMQ 5 and Redis 7.
- Webhook ingestion with Pause and Purge controls.
- Live follower verification check with Quick Reply confirm prompts.
- Database-synced feature locks and `/pricing` comparison page.
- Production hosting topology: Ubuntu 25.10 Lab PC backend + Cloudflare Tunnel (`api.dmpilot.org`) + Vercel frontend (`www.dmpilot.org`).

---

## Phase 2: CRM Lead Pipelines & Creator Pipelines (Target: Q3 2026)

- **Lead Board (Kanban style)**: Automatically create a CRM contact when a user triggers a DM. Categorize them: "New Lead", "Interested", "Responded", "Converted".
- **Interaction History**: Detailed profile dashboards showing user comments, direct message threads, and clicked resource links.
- **Auto-Tagging**: Assign tags to commenters dynamically based on which campaign triggered their interaction (e.g. `ebook-downloader`, `vip-promo`).

---

## Phase 3: Conversational AI & Agent Integrations (Target: Q4 2026)

- **Gemini Flash Agents**: Integrate lightweight AI models to respond to complex user questions inside DMs when they ask things outside campaign keywords.
- **Sentiment Analysis**: Analyze comment sentiment (positive, neutral, negative) and auto-reply publicly to positive interactions while alerting the team on negative ones.
- **Smart FAQ Autopilot**: Crawl landing pages and help documents to auto-answer creator customer queries regarding prices, bookings, and support tickets in-chat.

---

## Phase 4: Social Commerce & Razorpay Checkout Integration (Target: Q1 2027)

- **Product Catalogs inside DMs**: Let creators import Shopify or custom catalogs and show cards/links natively in Instagram chats.
- **In-Chat Checkout**: Send direct Razorpay payment buttons. Once paid, webhook events automatically trigger digital delivery (links, files) inside DMs.
- **Discount Banner Synchronization**: Run automated promotional sales that update landing headers, pricing calculators, and DM discount codes in sync.

---

## Phase 5: Multi-Channel Broadcasts & Broadcasts (Target: Q2 2027)

- Support for Facebook Messenger, WhatsApp Business, and direct SMS automations under a unified creator inbox dashboard.
