# UI/UX Design System Document — AutoDM (Instagram Business OS)

## 1. Aesthetic Identity & Design System Philosophy

AutoDM implements a dark-mode-first aesthetic built for high-trust creator tools (inspired by linear.app, vercel.com, and stripe.com):

- **Dark Background Canvas**: `#030712` (Tailwind `slate-950` dark foundation).
- **Primary Brand Colors**:
  - Mint Emerald: `#00BB88` (Primary CTAs, active status, success toasts, and glowing text).
  - Cyan Accent: `#06b6d4` (Data visualizations, loading indicators, and secondary highlights).
  - Amber Gold: `#f59e0b` (Viral surge warnings, spike alerts, and founding member badges).
- **Glassmorphism Layering**: Subtly transparent card backgrounds (`rgba(255, 255, 255, 0.02)`) with `backdrop-filter: blur(16px)` and glowing pseudo-element border outlines (`.border-gradient`).
- **Typography**: Clean, readable sans-serif system stack using Google Font `Inter` (`font-sans`).

---

## 2. Mandatory UI/UX Directives & Layout Rules

### Rule 1: High-Contrast Innovation Cards (`#innovations`)

- **Numbered Badges**: Each innovation card displays prominent mono-font numbers (`01` through `06`).
- **Interactive Demo Containers**: Cards feature live micro-demos:
  - **01 Reply Desk**: Dual-tone filter box highlighting spam comments crossed out vs. genuine buyer questions highlighted in emerald neon.
  - **02 Multilingual**: Interactive pill badges showcasing regional script support (Hindi हिन्दी, Tamil தமிழ், Hinglish, etc.).
  - **03 DM Variants**: Stacked code blocks displaying rotated DM copy variants (`V1`, `V2`, `V3`).
  - **04 Viral Queue**: Animated flame icon with amber surge pacing indicator ("Spike Detected • Auto Paced").
  - **05 Spike Alerts**: Pulse-glowing alert banner preview ("🔥 Reel Heating Up: 2,400 DMs/hr").
  - **06 Voice Create**: Cyan voice waveform audio preview ("🎙️ Listening… -> Automation Created").

### Rule 2: Interactive Seat Selector & Ticker Banners (`/pricing`)

- **Founding Member Ticker**: High-visibility top banner displaying spot counter (`950 / 1,000 claimed`) with an animated progress bar and `50 spots left` urgency pill.
- **Interactive Team Seat Slider**: Agency Plan card features a 4-button seat selector (`5 Seats`, `10 Seats`, `15 Seats`, `20 Seats`) updating client account capacity dynamically.
- **Refund Guarantee Badge**: Prominent green border container (`100% Refund if Your Account Gets Restricted Guarantee`).

### Rule 3: Mobile PWA Responsive Experience (`#mobile`)

- **PWA Layout**: Optimized for mobile viewports with sticky bottom-action drawers, lock-screen push notification previews, and touch-friendly card paddings.
- **Horizontal Touch Swiping**: Pricing plan cards and persona cards enforce `overflow-x-auto snap-x snap-mandatory scrollbar-none` on mobile devices.

---

## 3. Monorepo Shared UI Package (`packages/ui`)

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
