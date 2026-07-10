# DATABASE_IMPLEMENTATION.md

# Database Implementation

## Migration Files
- `backend/database/migrations/001_core_entities.sql`

## Tables Created

### tenants
Root table for each business using NexPlay.

Key columns:
- `id` UUID primary key
- `name`
- `slug`
- `status`
- `timezone`
- `created_at`
- `updated_at`

Constraints:
- Unique tenant slug
- Status limited to `active`, `inactive`, `suspended`
- Slug format limited to lowercase URL-safe values

### branches
Represents a business location under one tenant.

Key columns:
- `id` UUID primary key
- `tenant_id` references `tenants(id)`
- `name`
- `code`
- `address`
- `phone`
- `status`
- `created_at`
- `updated_at`

Constraints:
- Each branch belongs to one tenant
- Branch code is unique per tenant
- Status limited to `active`, `inactive`

### fields
Represents a football field under one branch.

Key columns:
- `id` UUID primary key
- `tenant_id`
- `branch_id`
- `name`
- `code`
- `field_type`
- `capacity`
- `status`
- `created_at`
- `updated_at`

Constraints:
- Field must belong to a branch inside the same tenant
- Field code is unique per branch
- Capacity must be positive when provided
- Status limited to `active`, `inactive`, `maintenance`

### opening_hours
Defines weekly operating hours per branch.

Key columns:
- `id` UUID primary key
- `tenant_id`
- `branch_id`
- `day_of_week`
- `opens_at`
- `closes_at`
- `is_closed`
- `created_at`
- `updated_at`

Constraints:
- One opening-hours row per branch per day
- `day_of_week` must be 0 to 6
- Open days require valid `opens_at < closes_at`
- Closed days require null open and close times

### blocked_times
Defines unavailable time ranges for a branch or a specific field.

Key columns:
- `id` UUID primary key
- `tenant_id`
- `branch_id`
- `field_id`
- `starts_at`
- `ends_at`
- `reason`
- `status`
- `created_at`
- `updated_at`

Constraints:
- Blocked time belongs to a branch inside the same tenant
- Field-level blocked time must reference a field inside the same tenant and branch
- `starts_at` must be before `ends_at`
- Status limited to `active`, `cancelled`

## Relationships
```text
tenants
  └── branches
        ├── fields
        ├── opening_hours
        └── blocked_times
              └── fields optional
```

Relationship rules:
- `branches.tenant_id` references `tenants.id`
- `fields(tenant_id, branch_id)` references `branches(tenant_id, id)`
- `opening_hours(tenant_id, branch_id)` references `branches(tenant_id, id)`
- `blocked_times(tenant_id, branch_id)` references `branches(tenant_id, id)`
- `blocked_times(tenant_id, branch_id, field_id)` references `fields(tenant_id, branch_id, id)`

## Index Strategy
Indexes were added for:
- Tenant filtering: `tenant_id`
- Branch filtering: `branch_id`
- Field filtering: `field_id`
- Status filtering: `status`
- Opening-hours day lookup: `day_of_week`
- Blocked-time range lookup: `starts_at`, `ends_at`

This supports the first availability queries without creating booking or payment tables yet.

## Security Considerations
- All business tables include tenant ownership either directly or through enforced tenant-scoped foreign keys.
- Composite foreign keys prevent a field from being attached to a branch from another tenant.
- Row Level Security is enabled on all created tables.
- Authentication-specific RLS policies are intentionally not added yet because authentication is out of scope for this sprint.
- Backend code must continue passing tenant context to every repository query in later implementation.

## Out of Scope
- Authentication tables
- Booking tables
- Payment tables
- Customer tables
- Pricing tables
- Audit log tables
