# OpenFinance

Personal finance management app built with Next.js, Prisma, and deployed via SST to AWS.

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

- **Framework**: Next.js 16
- **Database**: PostgreSQL (RDS in production)
- **ORM**: Prisma
- **Auth**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS
- **Infrastructure**: SST (AWS)
