# OpenFinance Migration Plan: Next.js → Astro + Chase UI

## Overview

Migrate from Next.js 16 to Astro while implementing Chase-inspired UI improvements. The strategy uses Astro as the routing/SSR shell with React islands for interactive dashboard components.

**Total estimated effort:** 2-3 weeks

## Migration Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Preparation | ✅ Complete | Auth config extracted, service layer created, UI components updated |
| Phase 1: Astro Setup | ✅ Complete | Astro configured with SST adapter, dual build scripts working |
| Phase 2: Auth Migration | ✅ Complete | @auth/core integrated, session sharing via cookies |
| Phase 3: API Routes | ✅ Complete | All API endpoints migrated to Astro |
| Phase 4: Dashboard & Chase UI | ✅ Complete | Chase header, SectionCard, AlertBanner, ExploreSidebar created |
| Phase 5: Remaining Pages | ✅ Complete | All pages migrated to Astro |
| Phase 6: SST Switch & Cleanup | 🔄 Ready | Ready to switch when tested |

### Key Files Created
- `astro.config.mjs` - Astro configuration
- `src/lib/auth-config.ts` - Framework-agnostic auth config
- `src/lib/get-session-astro.ts` - Astro session helper
- `src/lib/services/` - Service layer (bills, debts, dashboard, etc.)
- `src/astro-pages/` - All Astro pages
- `src/components/ui/chase-header.tsx` - Chase-style header
- `src/components/ui/section-card.tsx` - Collapsible section card
- `src/components/ui/alert-banner.tsx` - Alert component
- `src/components/ui/explore-sidebar.tsx` - Desktop sidebar

### Running Both Frameworks
```bash
npm run dev:next   # Next.js on port 3000
npm run dev:astro  # Astro on port 4321
npm run build:next # Build Next.js
npm run build:astro # Build Astro
```

---

---

## Architecture Decision

```
┌─────────────────────────────────────────────────────────────┐
│                         Astro Shell                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Routing   │  │   Layouts   │  │   Server Data       │ │
│  │   *.astro   │  │   *.astro   │  │   Fetching          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     React Islands                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Dashboard  │  │   Forms     │  │   Charts/           │ │
│  │  Components │  │   client:   │  │   Interactive UI    │ │
│  │  client:vis │  │   load      │  │   client:visible    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Shared Services                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Prisma    │  │  @auth/core │  │   Business Logic    │ │
│  │   (no chg)  │  │  (from      │  │   src/lib/services  │ │
│  │             │  │   NextAuth) │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                         SST                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AstroSite + API Functions + PostgreSQL (existing)  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Preparation & Shared Core
**Effort:** 0.5-1 day

### Tasks

- [ ] **0.1** Extract auth config to framework-agnostic module
  ```
  src/lib/auth-config.ts  ← providers, adapter, callbacks (no Next imports)
  src/lib/auth.ts         ← imports auth-config, wraps with NextAuth()
  ```

- [ ] **0.2** Create service layer for business logic
  ```
  src/lib/services/
  ├── bills.ts        ← listBills(), createBill(), updateBill(), deleteBill()
  ├── debts.ts        ← listDebts(), createDebt(), recordPayment()
  ├── dashboard.ts    ← getDashboardData() (extract from page.tsx)
  ├── pay-periods.ts  ← getCurrentPayPeriod(), getPaymentsForPeriod()
  ├── foo.ts          ← getFOOProgress(), updateFOOStep()
  └── goals.ts        ← listGoals(), createGoal(), updateGoal()
  ```

- [ ] **0.3** Update UI components to be framework-agnostic
  - Remove `next/link` from primitive components
  - Accept `href` prop, use `<a>` or wrapper component
  - Affected: `sidebar.tsx`, `bottom-nav.tsx`, `quick-actions-grid.tsx`

- [ ] **0.4** Document current routes and dependencies
  | Route | Data Needs | Interactive Parts |
  |-------|-----------|-------------------|
  | `/dashboard` | getDashboardData | Charts, QuickActions, Alerts |
  | `/dashboard/bills` | listBills | BillForm, Filters, Delete |
  | `/dashboard/debts` | listDebts | DebtForm, PaymentForm |
  | `/dashboard/foo` | getFOOProgress | StepCards, ProgressUpdate |
  | `/dashboard/pay-periods` | getPaymentsForPeriod | PaymentToggle, Allocations |

---

## Phase 1: Astro Setup & Parallel Deployment
**Effort:** 1-2 days

### Tasks

- [ ] **1.1** Initialize Astro in project
  ```bash
  npm create astro@latest -- --template minimal
  npx astro add react
  npx astro add tailwind
  ```

- [ ] **1.2** Configure Astro for SST
  ```ts
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  import react from '@astrojs/react';
  import tailwind from '@astrojs/tailwind';
  import aws from 'astro-sst';

  export default defineConfig({
    output: 'server',
    adapter: aws(),
    integrations: [
      react(),
      tailwind({ applyBaseStyles: false })
    ]
  });
  ```

- [ ] **1.3** Set up Tailwind to share existing config
  ```ts
  // tailwind.config.mjs - reuse Chase colors from globals.css
  ```

- [ ] **1.4** Create initial Astro structure
  ```
  src/
  ├── pages/           ← Astro pages (new)
  │   ├── index.astro
  │   └── api/
  ├── layouts/         ← Astro layouts (new)
  │   └── BaseLayout.astro
  ├── components/      ← React components (existing)
  ├── lib/             ← Shared logic (existing)
  └── styles/          ← Global CSS (move globals.css)
  ```

- [ ] **1.5** Update SST config for dual deployment
  ```ts
  // sst.config.ts
  const next = new sst.aws.Nextjs("NextApp", { ... });
  const astro = new sst.aws.Astro("AstroApp", {
    path: "./",
    domain: "v2.openfinance.dev", // staging domain
    environment: {
      DATABASE_URL: db.url,
      AUTH_SECRET: secret.value,
    }
  });
  ```

- [ ] **1.6** Add package.json scripts
  ```json
  {
    "dev:next": "next dev",
    "dev:astro": "astro dev",
    "build:next": "next build",
    "build:astro": "astro build"
  }
  ```

- [ ] **1.7** Smoke test: Create simple Astro page with React island
  ```astro
  ---
  // src/pages/test.astro
  import { Button } from '../components/ui/button';
  ---
  <html>
    <body class="bg-theme-primary">
      <Button client:load>Test Button</Button>
    </body>
  </html>
  ```

---

## Phase 2: Auth Migration to @auth/core
**Effort:** 1-2 days

### Tasks

- [ ] **2.1** Install @auth/core
  ```bash
  npm install @auth/core
  ```

- [ ] **2.2** Create Astro auth endpoint
  ```ts
  // src/pages/api/auth/[...auth].ts
  import { Auth } from "@auth/core";
  import { authConfig } from "../../../lib/auth-config";
  import type { APIRoute } from "astro";

  export const ALL: APIRoute = async ({ request }) => {
    return Auth(request, authConfig);
  };
  ```

- [ ] **2.3** Create Astro session helper
  ```ts
  // src/lib/get-session-astro.ts
  export async function getSession(request: Request) {
    // Read authjs.session-token cookie
    // Verify JWT and return session
  }
  ```

- [ ] **2.4** Update auth-config.ts for @auth/core compatibility
  - Change imports from `next-auth/providers/*` to `@auth/core/providers/*`
  - Ensure cookie names match between Next and Astro

- [ ] **2.5** Test session sharing between Next and Astro
  - Login via Next → verify session in Astro
  - Login via Astro → verify session in Next

---

## Phase 3: API Routes Migration
**Effort:** 2-3 days

### Tasks

- [ ] **3.1** Refactor Next API routes to use service layer
  - `src/app/api/bills/route.ts` → calls `services/bills.ts`
  - `src/app/api/debts/route.ts` → calls `services/debts.ts`
  - etc.

- [ ] **3.2** Create Astro API endpoints (priority order)
  ```
  src/pages/api/
  ├── auth/[...auth].ts     ← Phase 2
  ├── bills/
  │   ├── index.ts          ← GET (list), POST (create)
  │   └── [id].ts           ← GET, PATCH, DELETE
  ├── debts/
  │   ├── index.ts
  │   ├── [id].ts
  │   └── [id]/payments.ts
  ├── bill-payments/
  │   └── [id].ts           ← PATCH (mark paid)
  ├── quick-payments/
  │   └── index.ts
  ├── foo/
  │   └── index.ts
  └── goals/
      ├── index.ts
      └── [id].ts
  ```

- [ ] **3.3** Implement consistent error handling
  ```ts
  // src/lib/api-utils.ts
  export function apiResponse(data: unknown, status = 200) { ... }
  export function apiError(message: string, status = 400) { ... }
  ```

---

## Phase 4: Dashboard Migration + Chase UI Foundation
**Effort:** 3-4 days

### 4.1 Chase-Style Design System

- [ ] **4.1.1** Create Chase UI tokens in Tailwind
  ```css
  /* Already have Chase colors in globals.css */
  /* Add typography scale and spacing tokens */
  ```

- [ ] **4.1.2** Create core Chase-style components
  ```
  src/components/ui/
  ├── chase-header.tsx      ← Blue top bar with nav
  ├── section-card.tsx      ← Collapsible card sections
  ├── alert-banner.tsx      ← Inline alerts (Chase-style)
  └── explore-sidebar.tsx   ← "Explore products" panel
  ```

### 4.2 Dashboard Layout Migration

- [ ] **4.2.1** Create Astro dashboard layout
  ```astro
  ---
  // src/layouts/DashboardLayout.astro
  import { getSession } from '../lib/get-session-astro';
  import ChaseHeader from '../components/ui/chase-header';
  import Sidebar from '../components/ui/sidebar';
  import BottomNav from '../components/ui/bottom-nav';

  const session = await getSession(Astro.request);
  if (!session) return Astro.redirect('/login');
  ---
  <html>
    <body class="bg-theme-secondary">
      <!-- Chase-style blue header -->
      <ChaseHeader client:load user={session.user} />
      
      <div class="flex">
        <Sidebar client:visible />
        
        <main class="flex-1 lg:grid lg:grid-cols-[1fr_280px] gap-6">
          <div><slot /></div>
          <aside class="hidden lg:block">
            <slot name="sidebar" />
          </aside>
        </main>
      </div>
      
      <BottomNav client:visible />
    </body>
  </html>
  ```

- [ ] **4.2.2** Create Chase-style header component
  ```tsx
  // src/components/ui/chase-header.tsx
  export function ChaseHeader({ user }) {
    return (
      <header className="bg-[var(--chase-blue-700)] text-white h-14 lg:h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold">openfinance</span>
            <nav className="hidden md:flex gap-4 text-[13px]">
              <a href="/dashboard" className="border-b-2 border-white/80">Overview</a>
              <a href="/dashboard/bills">Bills</a>
              <a href="/dashboard/debts">Debt</a>
              <a href="/dashboard/foo">Goals</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--chase-blue-500)] flex items-center justify-center">
              {user?.name?.[0] ?? 'U'}
            </div>
          </div>
        </div>
      </header>
    );
  }
  ```

- [ ] **4.2.3** Create collapsible SectionCard component
  ```tsx
  // src/components/ui/section-card.tsx
  "use client";
  import { useState } from "react";
  import { ChevronDown } from "lucide-react";

  export function SectionCard({ 
    title, 
    subtitle, 
    summary, 
    defaultOpen = true, 
    children 
  }) {
    const [open, setOpen] = useState(defaultOpen);
    
    return (
      <section className="bg-theme-elevated border border-theme rounded-2xl shadow-theme">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div>
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-theme-secondary">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {summary}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {open && (
          <div className="border-t border-theme px-4 py-3">
            {children}
          </div>
        )}
      </section>
    );
  }
  ```

### 4.3 Dashboard Page Migration

- [ ] **4.3.1** Extract dashboard data fetching
  ```ts
  // src/lib/services/dashboard.ts
  export async function getDashboardData(userId: string) {
    // Move logic from src/app/dashboard/page.tsx
  }
  ```

- [ ] **4.3.2** Create Astro dashboard page
  ```astro
  ---
  // src/pages/dashboard/index.astro
  import DashboardLayout from '../../layouts/DashboardLayout.astro';
  import DashboardMain from '../../components/dashboard-main';
  import ExploreSidebar from '../../components/ui/explore-sidebar';
  import { getSession } from '../../lib/get-session-astro';
  import { getDashboardData } from '../../lib/services/dashboard';

  const session = await getSession(Astro.request);
  if (!session) return Astro.redirect('/login');
  
  const data = await getDashboardData(session.user.id);
  ---
  <DashboardLayout>
    <DashboardMain client:visible data={data} session={session} />
    
    <ExploreSidebar slot="sidebar" client:visible />
  </DashboardLayout>
  ```

- [ ] **4.3.3** Reorganize dashboard into Chase-style sections
  - "Checking & Safe to Spend" section
  - "Bills & Payments" section (collapsible)
  - "Goals" section (FOO progress)
  - "Credit & Debt" section

- [ ] **4.3.4** Create Explore Sidebar
  ```tsx
  // src/components/ui/explore-sidebar.tsx
  const tools = [
    { icon: Wallet, title: "Connect accounts", href: "/dashboard/accounts" },
    { icon: CreditCard, title: "Track credit cards", href: "/dashboard/debts/new" },
    { icon: Target, title: "Set savings goals", href: "/dashboard/goals" },
  ];
  
  export function ExploreSidebar() { ... }
  ```

---

## Phase 5: Remaining Pages Migration
**Effort:** 3-5 days

### Tasks

- [ ] **5.1** `/dashboard/bills` page
  - Astro page with data fetching
  - React BillsList island
  - React BillForm island (client:load for create/edit)

- [ ] **5.2** `/dashboard/debts` page
  - Astro page
  - React DebtsList island
  - React DebtDetailModal island

- [ ] **5.3** `/dashboard/pay-periods` page
  - Astro page
  - React PayPeriodView island (most interactive)

- [ ] **5.4** `/dashboard/foo` page
  - Astro page
  - React FOOStepCards island

- [ ] **5.5** `/dashboard/goals` page
  - Astro page
  - React GoalCards island

- [ ] **5.6** `/login` page
  - Astro page
  - React LoginForm island

- [ ] **5.7** Landing page `/`
  - Pure Astro (minimal interactivity)

---

## Phase 6: SST Switch & Cleanup
**Effort:** 1-2 days

### Tasks

- [ ] **6.1** Point main domain to AstroSite
  ```ts
  // sst.config.ts
  const astro = new sst.aws.Astro("App", {
    domain: "openfinance.app", // main domain
    // ...
  });
  // Remove or comment out NextjsSite
  ```

- [ ] **6.2** Update package.json scripts
  ```json
  {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "sst deploy"
  }
  ```

- [ ] **6.3** Remove Next.js dependencies
  ```bash
  npm uninstall next next-auth eslint-config-next
  ```

- [ ] **6.4** Clean up file structure
  - Remove `src/app/` (Next pages)
  - Keep `src/pages/` (Astro)
  - Update imports throughout

- [ ] **6.5** Update CI/CD pipeline
  - Change build command to `astro build`
  - Update any Next-specific caching

---

## Chase UI Improvements Checklist

### Header & Navigation
- [ ] Solid blue header bar (`--chase-blue-700`)
- [ ] Horizontal nav tabs on desktop
- [ ] User avatar circle with initial
- [ ] Mobile: slim header + bottom nav

### Cards & Sections
- [ ] Collapsible `SectionCard` component
- [ ] Chase-style shadows and borders
- [ ] 16px border radius on cards
- [ ] Subtle hover lift effects

### Alerts & Notifications
- [ ] `AlertBanner` with left border accent
- [ ] Compact inline format
- [ ] Severity levels (info, warning, danger)

### Typography & Spacing
- [ ] 13px base font size for dense content
- [ ] Tighter line heights in cards
- [ ] Consistent 4px spacing scale

### Explore Sidebar
- [ ] Desktop right-column layout
- [ ] Feature promotion cards
- [ ] Icons + title + description format

### Light Mode Focus
- [ ] Default to light theme
- [ ] Keep dark mode as option
- [ ] Optimize for light-mode-first

---

## Rollback Plan

1. **During transition:** Keep Next.js at `legacy.openfinance.dev`
2. **If critical issues:** DNS switch back to NextjsSite in SST
3. **Per-route fallback:** Route specific broken paths to legacy

---

## Success Criteria

- [ ] All existing functionality works in Astro
- [ ] Auth sessions shared correctly
- [ ] Lighthouse performance score ≥ 90
- [ ] No regressions in existing features
- [ ] Chase UI improvements visible
- [ ] Mobile experience matches or exceeds current
