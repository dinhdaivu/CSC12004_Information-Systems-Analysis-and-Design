---
description: Apply a new Supabase database migration
---

## Apply a DB Migration

Migrations are plain SQL files, applied manually via the Supabase Dashboard SQL Editor.

### 1. Create the Migration File

Name it sequentially in `supabase/migrations/`:
```
supabase/migrations/
├── 001_initial_schema.sql  (existing)
└── 002_add_rooms_table.sql  ← new file
```

**File template:**
```sql
-- Migration: 002_add_rooms_table
-- Description: Creates the rooms table with RLS enabled
-- Date: 2024-MM-DD

-- Create table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rooms_branch_id ON rooms(branch_id);
CREATE INDEX idx_rooms_status ON rooms(status);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- CREATE POLICY "Anyone can view available rooms" ON rooms FOR SELECT USING (status = 'available');
```

**Domain tables to implement (from project spec):**

| Table | Key statuses |
| --- | --- |
| `users` | role: customer, sale, accountant, manager, admin |
| `branches` | — |
| `rooms` | available, holding, deposited, occupied, checkout_pending, maintenance |
| `beds` | available, holding, deposited, occupied, maintenance |
| `rental_requests` | requested, reviewing, viewing_scheduled, accepted, rejected, cancelled, deposit_pending, completed |
| `viewing_appointments` | scheduled, completed, cancelled, no_show |
| `deposit_requests` | pending, paid, cancelled, expired, refunded |
| `contracts` | active, terminated, completed |
| `checkout_requests` | requested, confirmed, completed, cancelled |
| `settlements` | draft, confirmed, paid, refunded, cancelled |
| `handovers` | pending, completed, cancelled |
| `payments` | type: rent, deposit, refund, fee |
| `invoices` | unpaid, paid, cancelled |

### 2. Apply in Supabase Dashboard

1. Open **Supabase Dashboard** → your project
2. Go to **SQL Editor** → New query
3. Paste the contents of the migration file
4. Click **Run**
5. Verify no errors

### 3. Verify

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'rooms';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'rooms';
```

### Conventions

- Always number files sequentially: `001_`, `002_`, ...
- Never modify an existing migration — create a new one instead
- Document the change in `supabase/README.md`
- Test SQL in dashboard before committing the file
- Always add RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
