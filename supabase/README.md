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
   - Copy Project URL and API Key (anon)
   - Add to `.env` in root:
     ```
     SUPABASE_URL=your_project_url
     SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

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

## Database Tables

- **users** - User accounts and authentication
- **branches** - Dormitory branch locations
- **rooms** - Room information and details
- **deposits** - Rental deposit records
- **contracts** - Rental agreement contracts
- **transactions** - Payment transactions

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
