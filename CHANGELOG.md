# Changelog

All notable changes to OpenFinance will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2024-12-14

### Added

- **Future Pay Period Allocations** - View bank account allocations for all future pay periods in the Annual Forecast
- Expandable forecast rows showing per-bank transfer amounts and individual bills
- Nested drill-down: click a pay period to see bank allocations, click a bank to see its bills

## [0.2.2] - 2024-12-14

### Fixed

- Bills page now works - fixed PUT vs PATCH HTTP method mismatch in bill-actions.tsx
- Added togglePaid support to bill-payments API endpoint for consistent payment toggling

### Added

- Mark bills as paid directly from the Bills page with clickable toggle buttons
- Mark BNPL payments as paid from expanded BNPL groups
- Loading states for payment toggle actions
- Payment ID tracking in bill DTOs for proper payment management

## [0.2.0] - 2024-12-14

### Summary

Checkpoint release for rollback purposes. This version represents a stable state of the application with core financial management features complete.

### Added

- **Dark Mode** - Fixed dark mode implementation using Tailwind v4 custom variant
- **Bank Accounts** - Bank account management with payday allocation breakdown
- **Pay Periods** - Pay period tracking with year-long forecast view
- **Debt Payoff Calculator** - Calculate optimal debt payoff strategies
- **Debt Snowball Motivation Card** - Visual motivation tracker for debt payoff progress
- **Edit Debt** - Full CRUD operations for debt management

## [0.1.0] - Initial Release

### Added

- Initial project setup with Astro + React
- User authentication with Google OAuth
- Basic dashboard layout
- Database schema with Prisma
