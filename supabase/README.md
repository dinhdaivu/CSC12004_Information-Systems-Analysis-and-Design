# Supabase Setup

Database configuration and migration files for HomeStay Dorm.

``
   
**Security Notes:**
- **Backend**: Can use both `anon` and `service_role` keys
- **Frontend**: Only use `anon` key (never `service_role`!)
- **Backend** `.env` is in `.gitignore` (not committed)
- **Frontend** environment files are committed (only public data)~

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

> **TODO**: Document the database schema design
> 
> This section should include:
> - Entity Relationship Diagram (ERD)
> - Table definitions with columns and data types
> - Foreign key relationships
> - Indexes and constraints
> - Business rules and validation logic
>
> See `migrations/001_initial_schema.sql` for the current implementation.

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
