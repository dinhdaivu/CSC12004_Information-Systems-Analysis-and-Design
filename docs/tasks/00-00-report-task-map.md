# Report to Task Map

This map ties the report requirements to implementation tasks in this folder.

## Sources

| Source | Purpose |
|--------|---------|
| `docs/Requirements.pdf` | Assignment context and business process requirements |
| `report/content/1_Business Analyze.tex` | Business use cases UC1-UC4 |
| `report/content/2_System Analyze.tex` | System use cases SUC1-SUC21 |
| `report/diagrams/system_usecase_diagram.mmd` | Actor/use-case relationship graph |
| `docs/architecture/api-endpoints.md` | Planned REST API surface |
| `docs/architecture/layers.md` | Boundary/control/entity mapping |
| `docs/architecture/state-machine.md` | Room, deposit, contract, checkout states |
| `docs/frontend-status.md` | Current Figma-to-frontend status |

## System Use Case Coverage

| SUC | Report Use Case | Primary Task |
|-----|-----------------|--------------|
| SUC1 | Login | [00-01 Auth and Session Management](./00-01-auth-and-session-management.md) |
| SUC2 | Customer rental request | [01-03 Customer Rental Request](./01-03-customer-rental-request.md) |
| SUC3 | Manage rental registrations | [01-04 Staff Rental Registration Management](./01-04-staff-rental-registration-management.md) |
| SUC4 | Manage deposits | [02-02 Deposit Management](./02-02-deposit-management.md) |
| SUC5 | Payment | [02-01 Checkout Payment Flow](./02-01-checkout-payment-flow.md) |
| SUC6 | Payment management | [03-03 Deposit Tracking Dashboard](./03-03-deposit-tracking-dashboard.md) |
| SUC7 | Contract management | [04-01 Contract Management and Eligibility](./04-01-contract-management-and-eligibility.md) |
| SUC8 | Cost reconciliation | [05-02 Checkout Settlement and Refund](./05-02-checkout-settlement-and-refund.md) |
| SUC9 | Cost calculation | [05-02 Checkout Settlement and Refund](./05-02-checkout-settlement-and-refund.md) |
| SUC10 | Customer checkout request | [05-01 Customer Checkout Request](./05-01-customer-checkout-request.md) |
| SUC11 | Manage checkout requests | [05-02 Checkout Settlement and Refund](./05-02-checkout-settlement-and-refund.md) |
| SUC12 | Room/bed management | [03-02 Admin Room Management](./03-02-admin-room-management.md) |
| SUC13 | Room/bed lookup | [01-01 Customer Homepage / Branch Discovery](./01-01-customer-homepage-branch-discovery.md), [01-02 Branch Room Detail Pages](./01-02-branch-room-detail-pages.md) |
| SUC14 | Arrange viewing schedule | [03-01 Viewing Schedule Management](./03-01-viewing-schedule-management.md) |
| SUC15 | Record viewing result | [03-01 Viewing Schedule Management](./03-01-viewing-schedule-management.md) |
| SUC16 | Check lodging eligibility | [04-01 Contract Management and Eligibility](./04-01-contract-management-and-eligibility.md) |
| SUC17 | Check-in and handover | [04-02 Check-in Handover](./04-02-check-in-handover.md) |

## Extended Use Case Coverage

These use cases were added to `report/content/2_System Analyze.tex` as implementation-derived extensions to the original SUC1-SUC17 set.

| SUC | Use Case | Primary Task | Reason |
|-----|----------|--------------|--------|
| SUC18 | Customer registration | [00-04 Customer Registration](./00-04-customer-registration.md) | The app has `/auth/register`, and customers need accounts before rental/deposit/checkout flows |
| SUC19 | Admin user management | [03-04 Admin User Management](./03-04-admin-user-management.md) | The app has `/admin/users`, and API docs define `/users` admin endpoints |
| SUC20 | Customer booking/request status list | [01-06 Customer Bookings and Rental Request List](./01-06-customer-bookings-list.md) | The app has `/bookings`, and customers need to view request/deposit/booking status |
| SUC21 | Admin dashboard overview | [03-05 Admin Dashboard Overview](./03-05-admin-dashboard-overview.md) | The app has `/admin`, and tests expect admin stats/navigation/recent activity |

## Foundation Task Coverage

| Area | Task |
|------|------|
| Database schema, status fields, RLS policies | [00-02 Database Schema and RLS Foundation](./00-02-database-schema-and-rls.md) |
| Shared public/admin layout, navigation, role-aware route shell | [00-03 App Shell Layout and Navigation](./00-03-app-shell-layout-and-navigation.md) |

## Business Flow Coverage

| Business Flow | Tasks |
|---------------|-------|
| UC1 - Rental inquiry and room viewing | 01-01, 01-02, 01-03, 01-04, 01-05, 03-01 |
| UC2 - Deposit and rental confirmation | 02-01, 02-02, 03-03 |
| UC3 - Check-in, contract, handover | 04-01, 04-02 |
| UC4 - Checkout and deposit refund | 05-01, 05-02 |
