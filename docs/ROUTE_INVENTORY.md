# Route Inventory for Astro Migration

This document catalogs all existing Next.js routes, their dependencies, and migration considerations for the Astro migration.

## Pages

### / (Home/Landing)
- **File:** src/app/page.tsx
- **Auth:** Not required (redirects to /dashboard if authenticated)
- **Data Needs:** auth() session check only
- **Interactive Parts:** None (static marketing page)
- **Components:** Link (Next.js), lucide-react icons (Calendar, CreditCard, Target, ArrowRight, Shield, Smartphone)
- **Migration Notes:** Pure SSR page, no hydration needed in Astro

---

### /login
- **File:** src/app/login/page.tsx
- **Auth:** Not required (redirects to /dashboard if authenticated)
- **Data Needs:** auth() session check
- **Interactive Parts:**
  - LoginForm (client:load) - Form with signIn/register functionality
- **Components:** LoginForm, CheckCircle2 icon
- **Client Components:**
  - `login-form.tsx` - useState for form, signIn from next-auth/react

---

### /dashboard
- **File:** src/app/dashboard/page.tsx
- **Auth:** Required
- **Data Needs:** 
  - `getDashboardData(userId)`:
    - `prisma.user.findUnique` (paycheckAmount)
    - `prisma.bill.count` (active bills)
    - `prisma.debt.findMany` (active debts)
    - `prisma.fOOProgress.findMany`
    - `prisma.billPayment.findMany` (upcoming payments with bill relations)
    - `prisma.quickPayment.findMany`
  - Pay period utilities: `getCurrentPayPeriod()`, `getNextPayPeriod()`, `formatPayPeriod()`
- **Interactive Parts:**
  - QuickActionsGrid (client:load) - Navigation grid with hover effects
  - Links to other pages (static)
- **Components:** 
  - AccountSummaryCard, SimpleBalanceCard
  - QuickActionsGrid
  - TransactionList, TransactionListHeader, TransactionItem, TransactionEmptyState, TransactionDivider
  - Badge
  - Link, lucide-react icons
- **Migration Notes:** Heavy SSR with complex Prisma queries. Most interactivity is navigation.

---

### /dashboard/bills
- **File:** src/app/dashboard/bills/page.tsx
- **Auth:** Required
- **Data Needs:**
  - `getBills(userId)`:
    - `prisma.bill.findMany` with debt and payments relations
    - Groups bills by category, separates BNPL
- **Interactive Parts:**
  - BillsList (client:load) - Expandable categories, action buttons
- **Components:**
  - Card, CardContent, StatCard
  - Button, Badge
  - BillsList (client component)
  - lucide-react icons (Plus, Receipt, CreditCard, TrendingDown)
- **Client Components:**
  - `bills-list.tsx` - State for expanded categories

---

### /dashboard/bills/new
- **File:** src/app/dashboard/bills/new/page.tsx
- **Auth:** Required
- **Data Needs:**
  - Fetches `/api/debts` and `/api/bank-accounts` on mount
- **Interactive Parts:**
  - Entire form (client:load) - Full client component
- **Components:**
  - Card, CardHeader, CardTitle, CardContent
  - Button
  - BankSelector
  - Form inputs
- **Migration Notes:** "use client" - entire page is client-rendered

---

### /dashboard/bills/[id]/edit
- **File:** src/app/dashboard/bills/[id]/edit/page.tsx
- **Auth:** Required
- **Data Needs:**
  - Fetches `/api/bills/:id`, `/api/debts`, `/api/bank-accounts` on mount
- **Interactive Parts:**
  - Entire form (client:load)
- **Components:** Same as /dashboard/bills/new
- **Migration Notes:** "use client" - entire page is client-rendered

---

### /dashboard/debts
- **File:** src/app/dashboard/debts/page.tsx
- **Auth:** Required (implicit via API calls)
- **Data Needs:**
  - Fetches `/api/debts` with additional calls to:
    - `/api/debts/:id/payments`
    - `/api/debts/:id/scheduled-payments`
- **Interactive Parts:**
  - Entire page (client:load) - Client component with:
    - Search/filter functionality
    - Sort controls with URL state
    - Delete confirmations
    - PaymentForm modal
- **Components:**
  - Card, CardHeader, CardTitle, CardContent, StatCard
  - Button, ToggleGroup
  - Badge, StatusBadge
  - PaymentForm (modal)
  - SearchInput
  - lucide-react icons (many)
- **Migration Notes:** "use client" - heavily interactive page

---

### /dashboard/debts/new
- **File:** src/app/dashboard/debts/new/page.tsx
- **Auth:** Required (implicit via API calls)
- **Data Needs:**
  - Fetches `/api/bank-accounts` on mount
- **Interactive Parts:**
  - Entire form (client:load) - BNPL payment preview, effective APR calculation
- **Components:**
  - Card, CardHeader, CardTitle, CardContent
  - Button
  - BankSelector
  - BNPL-specific computed previews
- **Client Utilities:** `formatPaymentPreview()`, `calculateEffectiveAPR()` from lib/bnpl-utils

---

### /dashboard/debts/[id]
- **File:** src/app/dashboard/debts/[id]/page.tsx
- **Auth:** Required
- **Data Needs:**
  - `prisma.debt.findFirst` with payments relation
  - Calculates payoff projections
- **Interactive Parts:**
  - DebtDetailClient (client:load) - Payment history, add payment form
- **Components:**
  - Card, CardHeader, CardTitle, CardContent
  - Button, Badge
  - DebtDetailClient (client component)

---

### /dashboard/debts/[id]/edit
- **File:** src/app/dashboard/debts/[id]/edit/page.tsx
- **Auth:** Required (implicit via API calls)
- **Data Needs:**
  - Fetches `/api/debts/:id`, `/api/debts/:id/scheduled-payments`, `/api/bank-accounts`
- **Interactive Parts:**
  - Entire form (client:load) - BNPL schedule management
- **Components:** Same as /dashboard/debts/new plus schedule management
- **Migration Notes:** "use client" - full client component with complex state

---

### /dashboard/foo
- **File:** src/app/dashboard/foo/page.tsx
- **Auth:** Required
- **Data Needs:**
  - `prisma.fOOProgress.findMany` for userId
- **Interactive Parts:**
  - FOOStepCard (client:load) - Expandable cards with status updates
- **Components:**
  - Card, CardContent, Badge
  - FOOStepCard (client component for each step)
  - lucide-react icons (CheckCircle2, Circle, Target)
- **Migration Notes:** SSR with client islands for step interactions

---

### /dashboard/goals
- **File:** src/app/dashboard/goals/page.tsx
- **Auth:** Required
- **Data Needs:**
  - `prisma.savingsGoal.findMany`
- **Interactive Parts:**
  - GoalCard (client:load or client:visible) - Progress updates, editing
- **Components:**
  - Card, CardContent, StatCard
  - Button
  - GoalCard
  - lucide-react icons (Plus, PiggyBank, Target, TrendingUp)

---

### /dashboard/goals/new
- **File:** src/app/dashboard/goals/new/page.tsx
- **Auth:** Required (implicit via API calls)
- **Data Needs:** None (creates new goal via API)
- **Interactive Parts:**
  - Entire form (client:load)
- **Components:**
  - Card, CardHeader, CardTitle, CardContent
  - Button
- **Migration Notes:** "use client" - client-rendered form

---

### /dashboard/pay-periods
- **File:** src/app/dashboard/pay-periods/page.tsx
- **Auth:** Required
- **Data Needs:**
  - `ensureBillPaymentsForPayPeriod()` - generates bill payments
  - `prisma.billPayment.findMany` with bill and bankAccount relations
  - `prisma.quickPayment.findMany` with debt relation
  - Pay period utilities with offset navigation
  - Bank allocation calculations
  - Forecast for next 3 periods
- **Interactive Parts:**
  - PaymentToggle (client:load) - Mark bills paid/unpaid
  - QuickPaymentsSection (client:load) - Add quick payments
  - BankAllocationSection (client:visible) - Expandable allocations
  - AllocationForecast (client:visible) - Future period preview
- **Components:**
  - Card, CardContent, CardHeader, CardTitle, StatCard
  - Button, Badge, StatusBadge
  - PaymentToggle, QuickPaymentsSection, BankAllocationSection, AllocationForecast
  - lucide-react icons (Calendar, ChevronLeft, ChevronRight, DollarSign, Wallet, TrendingUp)
- **Migration Notes:** Complex SSR with multiple client islands. URL-based pagination.

---

### /dashboard/settings
- **File:** src/app/dashboard/settings/page.tsx
- **Auth:** Required
- **Data Needs:**
  - `prisma.user.findUnique` (profile, paycheck settings)
  - Server Action: `updatePaycheck()`
- **Interactive Parts:**
  - AppearanceSettings (client:load) - Theme toggle
  - BankAccountsSection (client:load) - CRUD bank accounts
  - Form with server action (works without JS but enhanced with)
- **Components:**
  - Card, CardContent, CardHeader, CardTitle, CardDescription
  - Button
  - AppearanceSettings, BankAccountsSection
  - lucide-react icons (User, Palette, CreditCard, Calendar, Info, ExternalLink)
- **Migration Notes:** Uses Server Actions for form - need Astro equivalent

---

## API Routes

### /api/auth/[...nextauth]
- **Methods:** GET, POST (NextAuth handlers)
- **Auth:** N/A (handles auth)
- **Service:** NextAuth configuration
- **Migration:** Replace with Astro Auth or lucia-auth

### /api/auth/register
- **Methods:** POST
- **Auth:** Not required
- **Service:** `prisma.user.create` with bcrypt password hashing
- **Validation:** Email/password required, 8 char minimum

---

### /api/bills
- **Methods:** GET, POST
- **Auth:** Required
- **Service:** 
  - GET: `prisma.bill.findMany` with debt relation
  - POST: `prisma.bill.create` with validation (zod)
- **Validation:** name, amount (positive), dueDay (1-31), category, frequency

### /api/bills/[id]
- **Methods:** GET, PUT, DELETE
- **Auth:** Required (ownership check)
- **Service:**
  - GET: `prisma.bill.findFirst` with debt and bankAccount
  - PUT: `prisma.bill.update`
  - DELETE: `prisma.bill.delete`

---

### /api/debts
- **Methods:** GET, POST
- **Auth:** Required
- **Service:**
  - GET: `prisma.debt.findMany` with sorting options
  - POST: `prisma.debt.create` with:
    - Auto-generated Bill for non-BNPL
    - ScheduledPayment + BillPayment records for BNPL
    - Effective APR calculation
- **Validation:** zod schema for all debt fields

### /api/debts/[id]
- **Methods:** GET, PUT, DELETE
- **Auth:** Required (ownership check)
- **Service:**
  - GET: `prisma.debt.findFirst`
  - PUT: `prisma.debt.update` with optional schedule regeneration for BNPL
  - DELETE: `prisma.debt.delete` (cascades)

### /api/debts/[id]/payments
- **Methods:** GET, POST
- **Auth:** Required (ownership check)
- **Service:**
  - GET: `prisma.debtPayment.findMany`
  - POST: Creates payment with interest/principal split calculation, updates debt balance

### /api/debts/[id]/scheduled-payments
- **Methods:** GET, POST
- **Auth:** Required (ownership check)
- **Service:**
  - GET: `prisma.scheduledPayment.findMany`
  - POST: `prisma.scheduledPayment.create`

---

### /api/foo
- **Methods:** GET, PUT
- **Auth:** Required
- **Service:**
  - GET: `prisma.fOOProgress.findMany`
  - PUT: `prisma.fOOProgress.upsert` with status validation

---

### /api/goals
- **Methods:** GET, POST
- **Auth:** Required
- **Service:**
  - GET: `prisma.savingsGoal.findMany`
  - POST: `prisma.savingsGoal.create`

### /api/goals/[id]
- **Methods:** GET, PUT, DELETE
- **Auth:** Required (ownership check)
- **Service:** CRUD operations on savingsGoal

---

### /api/bank-accounts
- **Methods:** GET, POST
- **Auth:** Required
- **Service:**
  - GET: `prisma.bankAccount.findMany`
  - POST: `prisma.bankAccount.create` with default handling
- **Validation:** zod schema (name, bank type, lastFour)

### /api/bank-accounts/[id]
- **Methods:** PUT, DELETE
- **Auth:** Required (ownership check)
- **Service:** Update/delete with default account handling

---

### /api/bill-payments/[id]
- **Methods:** PATCH
- **Auth:** Required (ownership via bill)
- **Service:** 
  - Updates payment status
  - If linked to debt and marked PAID:
    - Creates DebtPayment record
    - Updates debt balance
    - For BNPL: marks ScheduledPayment as paid
  - Calls `revalidatePath()` for cache invalidation

### /api/bill-payments/generate
- **Methods:** POST
- **Auth:** Required
- **Service:** `generateUpcomingBillPayments()` - creates future bill payment records

---

### /api/quick-payments
- **Methods:** GET, POST
- **Auth:** Required
- **Service:**
  - GET: `prisma.quickPayment.findMany` with date filtering
  - POST: `prisma.quickPayment.create` with optional debt link
- **Validation:** zod schema

---

### /api/cleanup/unknown-bnpl
- **Methods:** Unknown (likely maintenance endpoint)
- **Note:** Review before migration

---

## Components Requiring Hydration

| Component | Hydration Strategy | Reason |
|-----------|-------------------|--------|
| **LoginForm** | client:load | Auth form, needs immediate interactivity |
| **QuickActionsGrid** | client:load | Navigation buttons with hover states |
| **BillsList** | client:load | Expandable categories, action menus |
| **BillForm (new/edit)** | client:load | Complex form with validation |
| **PaymentForm** | client:load | Modal form for payments |
| **DebtsList (page)** | client:load | Search, sort, filter, modals |
| **DebtForm (new/edit)** | client:load | BNPL calculations, complex state |
| **DebtDetailClient** | client:load | Payment history, add payment |
| **FOOStepCard** | client:load | Expandable with form inputs |
| **GoalCard** | client:visible | Can defer - progress updates |
| **PaymentToggle** | client:load | Quick toggle for payment status |
| **QuickPaymentsSection** | client:load | Add quick payments form |
| **BankAllocationSection** | client:visible | Expandable, non-critical |
| **AllocationForecast** | client:visible | Read-only, can defer |
| **AppearanceSettings** | client:load | Theme toggle needs JS |
| **BankAccountsSection** | client:load | CRUD operations |
| **SearchInput** | client:load | Real-time filtering |

---

## Shared Dependencies

### Database (prisma)
- **Location:** src/lib/db.ts
- **Models Used:** User, Bill, BillPayment, Debt, DebtPayment, ScheduledPayment, FOOProgress, SavingsGoal, BankAccount, QuickPayment

### Authentication
- **Location:** src/lib/auth.ts
- **Provider:** NextAuth with credentials
- **Usage:** `auth()` function in all protected routes

### Pay Periods Utilities
- **Location:** src/lib/pay-periods.ts
- **Exports:** 
  - `getCurrentPayPeriod()`
  - `getNextPayPeriod()`
  - `getPayPeriods()`
  - `formatPayPeriod()`
  - `PayPeriod` type

### Bill Payments Utilities
- **Location:** src/lib/bill-payments.ts
- **Exports:**
  - `ensureBillPaymentsForPayPeriod()`
  - `generateUpcomingBillPayments()`

### BNPL Utilities
- **Location:** src/lib/bnpl-utils.ts
- **Exports:**
  - `generatePaymentSchedule()`
  - `formatPaymentPreview()`
  - `calculateEffectiveAPR()`

### UI Components Library
- **Location:** src/components/ui/
- **Shared:** Card, Button, Badge, StatCard, etc.

### Bank Components
- **Location:** src/components/banks/
- **Components:** BankSelector, BankBadge

---

## Migration Priority Order

### Phase 1: Foundation
1. Landing page (/)
2. Login page (/login)
3. API auth routes

### Phase 2: Core Dashboard
4. Dashboard main page (/dashboard)
5. Pay periods page (/dashboard/pay-periods)

### Phase 3: Bills Module
6. Bills list (/dashboard/bills)
7. Bills create (/dashboard/bills/new)
8. Bills edit (/dashboard/bills/[id]/edit)

### Phase 4: Debts Module
9. Debts list (/dashboard/debts)
10. Debts create (/dashboard/debts/new)
11. Debts detail (/dashboard/debts/[id])
12. Debts edit (/dashboard/debts/[id]/edit)

### Phase 5: Additional Features
13. FOO progress (/dashboard/foo)
14. Goals (/dashboard/goals)
15. Goals create (/dashboard/goals/new)
16. Settings (/dashboard/settings)

---

## API Migration Notes

All API routes follow a similar pattern:
1. Auth check with `auth()`
2. Ownership verification for resource access
3. Prisma operations
4. JSON responses

For Astro SSR, these can be:
- Converted to Astro API routes (src/pages/api/...)
- Or moved to backend services called from Astro pages/endpoints
- Consider tRPC or Hono for type-safe API layer

---

## State Management Considerations

### URL State
- `/dashboard/pay-periods?offset=N` - Period navigation
- `/dashboard/debts?sort=X&dir=Y` - Sort preferences

### Client State (React)
- Form state in all form components
- Search/filter state in lists
- Modal open/close state
- Optimistic updates on toggles

### Server State
- All data from Prisma
- Session/auth state

For Astro migration, consider:
- Nanostores for client state
- View Transitions for navigation state
- Astro's built-in form handling where possible
