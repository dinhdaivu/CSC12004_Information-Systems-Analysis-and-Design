# Supabase Setup

Database configuration and migration files for HomeStay Dorm.

## Quick Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up or log in
   - Create new project
   - Wait for provisioning (2-3 minutes)

2. **Get Credentials**
   - Go to Project Settings > API
   - Copy the following credentials:
     * **Project URL** (e.g., `https://abcdefgh.supabase.co`)
     * **anon public** key (for client-side operations)
     * **service_role** key (for server-side admin operations)
   
   - Add to backend environment file `backend/.env`:
     ```env
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your_anon_public_key_here
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```
   
   - Add to frontend environment files:
     * `frontend/src/environments/environment.ts` (development)
     * `frontend/src/environments/environment.prod.ts` (production)
     ```typescript
     export const environment = {
       production: false,
       apiUrl: 'http://localhost:3000/api/v1',
       supabaseUrl: 'https://your-project.supabase.co',
       supabaseAnonKey: 'your_anon_public_key_here'
     };
     ```
   
   ⚠️ **Security Notes:**
   - **Backend**: Can use both `anon` and `service_role` keys
   - **Frontend**: Only use `anon` key (never `service_role`!)
   - **Backend** `.env` is in `.gitignore` (not committed)
   - **Frontend** environment files are committed (only public data)

3. **Create Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Create new query
   - Paste SQL from `migrations/` folder
   - Execute

4. **Enable Row Level Security (RLS)**
   - Go to Authentication > Policies
   - Enable RLS on all tables
   - Add policies as needed

## Folder Structure

```
supabase/
├── README.md              # This file
├── migrations/            # SQL migration files
│   └── 001_initial_schema.sql
├── policies/              # Row Level Security policies
└── functions/             # Database functions (optional)
```

## Database Schema

### Tables Overview

The database consists of 6 main tables with the following relationships:

```
users (1) ──┬──> (N) deposits
            ├──> (N) contracts
            └──> (1) branches (as manager)

branches (1) ──> (N) rooms

rooms (1) ──┬──> (N) deposits
            └──> (N) contracts

deposits (1) ──> (N) transactions
```

### Table Definitions

#### **users** - User accounts and authentication

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | VARCHAR | Unique email address |
| `password_hash` | VARCHAR | Bcrypt hashed password |
| `full_name` | VARCHAR | User's full name |
| `phone_number` | VARCHAR | Contact phone |
| `identity_number` | VARCHAR | ID card number |
| `gender` | VARCHAR | Male/Female/Other |
| `nationality` | VARCHAR | User's nationality |
| `avatar_url` | VARCHAR | Cloudinary image URL |
| `role` | ENUM | `user`, `staff`, `admin` |
| `status` | ENUM | `active`, `inactive`, `banned` |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `id`
- Unique: `email`
- Index: `role`, `status`

#### **branches** - Dormitory branch locations

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Branch name |
| `address` | TEXT | Full address |
| `phone_number` | VARCHAR | Contact phone |
| `manager_id` | UUID | FK to users (staff/admin) |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Relationships:**
- `manager_id` → `users.id`

#### **rooms** - Room information and availability

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `branch_id` | UUID | FK to branches |
| `room_number` | VARCHAR | Room identifier |
| `room_type` | VARCHAR | Single/Double/Suite |
| `capacity` | INTEGER | Max occupants |
| `price_per_month` | DECIMAL | Monthly rent |
| `description` | TEXT | Room description |
| `amenities` | JSONB | List of amenities |
| `images` | JSONB | Array of image URLs |
| `floor` | INTEGER | Floor number |
| `status` | ENUM | `available`, `occupied`, `maintenance` |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Relationships:**
- `branch_id` → `branches.id`

**Indexes:**
- Primary: `id`
- Index: `branch_id`, `status`, `room_number`

#### **deposits** - Rental deposit records

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to users |
| `room_id` | UUID | FK to rooms |
| `amount` | DECIMAL | Deposit amount |
| `payment_method` | VARCHAR | Cash/Bank/QR |
| `payment_date` | TIMESTAMP | When paid |
| `status` | ENUM | `pending`, `paid`, `refunded` |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Relationships:**
- `user_id` → `users.id`
- `room_id` → `rooms.id`

#### **contracts** - Rental agreement contracts

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to users |
| `room_id` | UUID | FK to rooms |
| `deposit_id` | UUID | FK to deposits |
| `start_date` | DATE | Contract start |
| `end_date` | DATE | Contract end |
| `monthly_rent` | DECIMAL | Agreed rent |
| `terms` | TEXT | Contract terms |
| `status` | ENUM | `active`, `expired`, `terminated` |
| `signed_at` | TIMESTAMP | Signing date |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Relationships:**
- `user_id` → `users.id`
- `room_id` → `rooms.id`
- `deposit_id` → `deposits.id`

#### **transactions** - Payment transaction history

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `deposit_id` | UUID | FK to deposits |
| `contract_id` | UUID | FK to contracts |
| `amount` | DECIMAL | Transaction amount |
| `payment_method` | VARCHAR | Payment type |
| `transaction_type` | ENUM | `deposit`, `rent`, `refund` |
| `status` | ENUM | `pending`, `completed`, `failed` |
| `reference_code` | VARCHAR | External reference |
| `notes` | TEXT | Transaction notes |
| `created_at` | TIMESTAMP | Transaction time |

**Relationships:**
- `deposit_id` → `deposits.id`
- `contract_id` → `contracts.id`

## Features Configured

- ✓ UUID primary keys
- ✓ Timestamps (created_at, updated_at)
- ✓ Foreign key relationships
- ✓ Indexes for performance
- ✓ Row Level Security ready

## Authentication

- Provider: Supabase Auth
- Method: Email/Password + JWT
- Role-based access control (user, staff, admin)

## Development Workflow

1. Create migration file in `migrations/`
2. Test SQL in Supabase Dashboard
3. Add to migration file once working
4. Document changes in this README

## Useful Commands

```bash
# Reset database (caution!)
# In Supabase Dashboard: Settings > Danger Zone > Reset database

# View logs
# In Supabase Dashboard: Database > Logs

# Monitor usage
# In Supabase Dashboard: Reports
```

## Notes

- Keep `migrations/` files in order (001, 002, etc.)
- Test SQL before applying to production
- Document any schema changes
- Always backup before major changes
