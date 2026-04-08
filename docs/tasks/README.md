# Implementation Task Index

This folder breaks down the CSC12004 HomeStay Dorm requirements, report use cases, and Figma screens into implementation-ready tasks.

| Task | File | Requirement Coverage |
|------|------|----------------------|
| 00-00 | [Report to Task Map](./00-00-report-task-map.md) | Maps report UC/SUC items to task docs |
| 00-01 | [Auth and Session Management](./00-01-auth-and-session-management.md) | SUC1 |
| 00-02 | [Database Schema and RLS Foundation](./00-02-database-schema-and-rls.md) | Core entities, status enums, Supabase policies |
| 00-03 | [App Shell Layout and Navigation](./00-03-app-shell-layout-and-navigation.md) | Shared navigation, layouts, role-aware shell |
| 00-04 | [Customer Registration](./00-04-customer-registration.md) | Derived SUC18; customer account creation |
| 01-01 | [Customer Homepage / Branch Discovery](./01-01-customer-homepage-branch-discovery.md) | SUC13; Figma homepage branch variants |
| 01-02 | [Branch Room Detail Pages](./01-02-branch-room-detail-pages.md) | SUC13; Figma detail screens |
| 01-03 | [Customer Rental Request](./01-03-customer-rental-request.md) | SUC2 |
| 01-04 | [Staff Rental Registration Management](./01-04-staff-rental-registration-management.md) | SUC3, SUC14, SUC15 |
| 01-05 | [Room and Bed Search List](./01-05-room-bed-search-list.md) | SUC13; `/rooms` route |
| 01-06 | [Customer Bookings and Rental Request List](./01-06-customer-bookings-list.md) | Derived SUC20; `/bookings` route |
| 02-01 | [Checkout Payment Flow](./02-01-checkout-payment-flow.md) | SUC5; Figma payment states |
| 02-02 | [Deposit Management](./02-02-deposit-management.md) | SUC4 |
| 03-01 | [Viewing Schedule Management](./03-01-viewing-schedule-management.md) | SUC14, SUC15; Figma schedule screens |
| 03-02 | [Admin Room Management](./03-02-admin-room-management.md) | SUC12; Figma room management |
| 03-03 | [Deposit Tracking Dashboard](./03-03-deposit-tracking-dashboard.md) | SUC6; Figma deposit tracking |
| 03-04 | [Admin User Management](./03-04-admin-user-management.md) | Derived SUC19; `/admin/users` route |
| 03-05 | [Admin Dashboard Overview](./03-05-admin-dashboard-overview.md) | Derived SUC21; `/admin` route |
| 04-01 | [Contract Management and Eligibility](./04-01-contract-management-and-eligibility.md) | SUC7, SUC16 |
| 04-02 | [Check-in Handover](./04-02-check-in-handover.md) | SUC17 |
| 05-01 | [Customer Checkout Request](./05-01-customer-checkout-request.md) | SUC10 |
| 05-02 | [Checkout Settlement and Refund](./05-02-checkout-settlement-and-refund.md) | SUC8, SUC9, SUC11 |

## Source Documents

- `docs/Requirements.pdf`
- `report/content/1_Business Analyze.tex`
- `report/content/2_System Analyze.tex`
- `report/diagrams/system_usecase_diagram.mmd`
- [Frontend status](../frontend-status.md)
- [API endpoints](../architecture/api-endpoints.md)
- [Architecture layers](../architecture/layers.md)
- [Database design](../architecture/database.md)
- [State machine](../architecture/state-machine.md)
