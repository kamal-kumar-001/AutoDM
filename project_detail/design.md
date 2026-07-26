# UI/UX Design System Document — AutoDM (Instagram Business OS)

## 1. Aesthetic Identity & Design System Philosophy

AutoDM implements a dark-mode-first aesthetic built for high-trust creator tools (inspired by linear.app, vercel.com, and stripe.com):

- **Dark Background Canvas**: `#030712` (Tailwind `slate-950` dark foundation).
- **Primary Brand Colors**:
  - Mint Emerald: `#00BB88` (Primary CTAs, active status, success toasts, and glowing text).
  - Cyan Accent: `#06b6d4` (Data visualizations, loading indicators, and secondary highlights).
- **Glassmorphism Layering**: Subtly transparent card backgrounds (`rgba(255, 255, 255, 0.02)`) with `backdrop-filter: blur(16px)` and glowing pseudo-element border outlines (`.border-gradient`).
- **Typography**: Clean, readable sans-serif system stack using Google Font `Inter` (`font-sans`).

---

## 2. Monorepo Shared UI Package (`packages/ui`)

Shared components are packaged in `@autodm/ui` for cross-app reuse:

| Component              | Technology / Primitive          | Design Tokens & Props                                                                                                                          |
| ---------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **`<Button>`**         | Custom + Radix Slot             | Variants: `primary`, `secondary`, `outline`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`. Includes hover glow & smooth scale effect. |
| **`<Input>`**          | Native HTML Input               | Glassmorphic input field (`bg-white/5 border-white/10 text-white focus-visible:ring-primary`).                                                 |
| **`<Textarea>`**       | Native Textarea                 | Multi-line text field with custom dark scrollbar and focus ring.                                                                               |
| **`<Label>`**          | Native HTML Label               | Uppercase gray tracking label (`text-xs font-semibold uppercase tracking-wider text-gray-400`).                                                |
| **`<Dialog>`**         | Radix UI Dialog + Framer Motion | Backdrop blur overlay (`bg-black/80 backdrop-blur-sm`) with spring animation pop-in (`motion.div`).                                            |
| **`<Breadcrumbs>`**    | Custom React Component          | ChevronRight separators, home icon, and active text green glow.                                                                                |
| **`<CommandPalette>`** | Custom Keyboard Primitive       | Quick-search dialog triggered via `⌘K` or `Ctrl+K`. Features live search filtering and keyboard arrow selection.                               |
| **`<Toaster>`**        | Sonner Toast                    | Dark-mode toast notification stack with custom neon status glows (`#00FFBB` success, `#FF6666` error).                                         |

---

## 3. Web Application Component Architecture (`apps/web/components/`)

Components are organized into functional domain folders:

```text
apps/web/components/
├── admin/          # Admin Portal management modules (creators, campaigns, flags, queues, support)
├── analytics/      # Metric cards and daily usage charts (rates, top keywords, top posts)
├── dashboard/      # Creator workspace (header, sidebar, wizard, campaigns list, stats grid)
├── landing/        # Marketing landing sections (Hero, Features, DashboardMockup, Testimonials, FAQ)
├── monitoring/     # System health panels, webhook logs, failed queue job inspector
└── ui/             # Custom dropdowns and layout utilities
```

---

## 4. Responsive Layout Rules & Micro-Animations

1. **Pricing Card Mobile Snap Carousel**:
   - Flex container: `flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 p-4`
   - Card dimensions: `snap-align-center min-w-[85vw] flex-shrink-0 sm:min-w-0 sm:w-auto`
   - Enables touch-swipe navigation on smartphones while keeping a 3-column grid on desktop.

2. **Horizontal Scroll Table Container**:
   - Table wrapper: `overflow-x-auto scrollbar-none border border-white/10 rounded-xl`
   - Enforces `min-w-[600px]` on the HTML `<table>` element to prevent column squishing on mobile screens.

3. **Viewport-Level Overlay Modals**:
   - Modal backdrops (`<CampaignDetailsModal>`, `<CampaignWizard>`) render with `fixed inset-0 bg-[#030712]/80 backdrop-blur-md z-50`.
   - Prevents modals from being clipped by nested component scroll heights.

4. **Mobile Navigation Drawer**:
   - Built with Framer Motion `AnimatePresence` for smooth height expansion and fade-in animations on mobile screens.
