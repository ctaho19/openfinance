# OpenFinance

Personal finance management app for tracking bills, debts, pay periods, and savings goals. Built with Next.js, Prisma, and deployed via SST to AWS.

## Features

### 📊 Dashboard
- Overview of financial health with key metrics
- Quick access to all modules

### 💳 Debts Management
- Track credit cards, auto loans, student loans, mortgages, and BNPL
- Support for BNPL payment schedules (Affirm, Klarna, Afterpay, etc.)
- Automatic effective APR calculation for BNPL with hidden interest
- Payment history tracking
- Payoff date projections

### 📅 Bills & Pay Periods
- Bill tracking with recurring and one-time payments
- Pay period view aligned to your paycheck schedule
- Bank allocation breakdown showing how much to transfer per account
- Allocation forecast for upcoming pay periods
- Quick payments for ad-hoc expenses

### 🏦 Bank Accounts
- Link bills and debts to specific bank accounts
- Visual allocation of bills by bank for payday transfers

### 🎯 Savings Goals
- Track progress toward financial goals
- FOO (Financial Order of Operations) progress tracking

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)

### Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start local Postgres:
   ```bash
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=openfinance postgres:16
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

### Utility Scripts

Fix BNPL bills missing bank account assignments:
```bash
node scripts/fix-bnpl-bank-accounts.mjs
```

## Deployment

This app deploys to AWS via SST using GitHub Actions.

### Initial AWS Setup

1. Create an IAM OIDC identity provider for GitHub Actions
2. Create an IAM role with the necessary permissions
3. Add the role ARN as `AWS_ROLE_ARN` secret in GitHub

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for GitHub Actions OIDC |
| `AUTH_SECRET` | NextAuth.js secret (generate with `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Deploy

Push to `main` branch or manually trigger the workflow from GitHub Actions.

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL (RDS in production)
- **ORM**: Prisma
- **Auth**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS
- **Infrastructure**: SST (AWS Lambda, RDS, CloudFront)
- **Validation**: Zod
