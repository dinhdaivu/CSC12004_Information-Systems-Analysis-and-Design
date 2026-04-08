# Database Design

> Status: Implemented in `supabase/migrations/001_initial_schema.sql`.

## Overview

The schema uses Supabase PostgreSQL with UUID primary keys, `created_at` / `updated_at` timestamps, row-level security, and role-aware access policies. Supabase Auth owns login credentials through `auth.users`; the application profile is stored in `public.users`.

## Core Tables

| Table | Purpose |
| --- | --- |
| `users` | Application profile, role, and account status for Supabase-authenticated users. |
| `branches` | HomeStay Dorm locations, seeded with the three Figma branches. |
| `rooms` | Room inventory by branch, capacity, monthly price, amenities, images, and room state. |
| `beds` | Bed inventory inside rooms with bed-level availability. |
| `rental_requests` | Customer rental intent and selected branch/room/bed preferences. |
| `viewing_appointments` | Sales-managed room viewing schedule and outcomes. |
| `deposit_requests` | Deposit request, amount, due time, proof, payment time, and status. |
| `contracts` | Active or finished rental contracts linked to deposits and room/bed assignments. |
| `handovers` / `handover_items` | Check-in handover records and item condition snapshots. |
| `checkout_requests` | Customer checkout requests and approval state. |
| `settlements` | Refund/deduction calculation for checkout and deposit return. |
| `payments` | Rent, deposit, refund, and fee payment records. |
| `services` | Chargeable services for invoices. |
| `invoices` / `invoice_items` | Billing snapshots for contract charges and services. |

## Status Enums

The migration follows the state-machine concepts from `docs/architecture/state-machine.md`, using lowercase database enum values:

| Concept | Enum Values |
| --- | --- |
| `room_status` | `available`, `holding`, `deposited`, `occupied`, `checkout_pending`, `maintenance` |
| `deposit_status` | `pending`, `paid`, `cancelled`, `expired`, `refunded` |
| `contract_status` | `active`, `terminated`, `completed` |
| `checkout_status` | `requested`, `confirmed`, `completed`, `cancelled` |

Additional workflow enums cover rental requests, viewing appointments, handovers, settlements, payments, invoices, user status, and app roles.

## Access Control

RLS is enabled on every table. Public users can read branch, room, bed, and active service catalog data. Authenticated customers can read their own requests, appointments, deposits, contracts, handovers, checkout records, settlements, invoices, and payments. Staff roles (`sale`, `accountant`, `manager`, `admin`) can manage operational records through the `public.is_staff()` helper.

## Seed Data

The initial migration seeds these branches:

| Branch |
| --- |
| `Tô Hiến Thành` |
| `Trần Não` |
| `Nguyễn Cửu Vân` |

## Deferred Work

No core task-00-02 table is intentionally deferred. Route-specific seed rooms, richer service catalog entries, and deeper policy tests can be added in later feature tasks.
