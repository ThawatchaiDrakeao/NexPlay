# DATABASE_VERIFICATION.md

# Database Verification

## Verification Checklist
- PostgreSQL compatibility: migration uses PostgreSQL syntax and `pgcrypto`.
- UUID generation: all core tables use `gen_random_uuid()`.
- Foreign keys: tenant, branch and field relationships are enforced.
- Constraints: status, slug, code, capacity, day and time-range checks are present.
- Indexes: tenant, branch, field, status and time-range indexes are present.
- Triggers: `updated_at` trigger is attached to all core tables.
- Row Level Security: RLS is enabled on all core business tables.

## Potential Issues
- `pgcrypto` must be available in the target Supabase/PostgreSQL project.
- `set_updated_at()` is shared by later migrations and must run before dependent triggers.
- RLS is enabled but policies are not defined yet, so direct client access will be blocked until policies are added.
- The migration has not been executed against a live database in this workspace.

## Production Execution Requirements
- Run migrations in order: `001_core_entities.sql`, then auth and later domain migrations.
- Validate migration execution against a Supabase staging project first.
- Create RLS policies only after authentication and tenant context are finalized.
- Backup production database before applying schema changes.
- Keep service-role database access limited to trusted backend runtime only.
