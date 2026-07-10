create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  timezone text not null default 'Asia/Bangkok',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenants_status_check check (status in ('active', 'inactive', 'suspended')),
  constraint tenants_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  code text not null,
  address text,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_status_check check (status in ('active', 'inactive')),
  constraint branches_code_format_check check (code ~ '^[A-Z0-9_-]+$'),
  constraint branches_tenant_code_unique unique (tenant_id, code),
  constraint branches_tenant_id_id_unique unique (tenant_id, id)
);

create table fields (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  name text not null,
  code text not null,
  field_type text,
  capacity integer,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fields_branch_tenant_fk foreign key (tenant_id, branch_id)
    references branches(tenant_id, id) on delete cascade,
  constraint fields_status_check check (status in ('active', 'inactive', 'maintenance')),
  constraint fields_capacity_check check (capacity is null or capacity > 0),
  constraint fields_code_format_check check (code ~ '^[A-Z0-9_-]+$'),
  constraint fields_branch_code_unique unique (tenant_id, branch_id, code),
  constraint fields_tenant_branch_id_unique unique (tenant_id, branch_id, id)
);

create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  day_of_week smallint not null,
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opening_hours_branch_tenant_fk foreign key (tenant_id, branch_id)
    references branches(tenant_id, id) on delete cascade,
  constraint opening_hours_day_check check (day_of_week between 0 and 6),
  constraint opening_hours_time_check check (
    (is_closed = true and opens_at is null and closes_at is null)
    or
    (is_closed = false and opens_at is not null and closes_at is not null and opens_at < closes_at)
  ),
  constraint opening_hours_branch_day_unique unique (tenant_id, branch_id, day_of_week)
);

create table blocked_times (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  field_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blocked_times_branch_tenant_fk foreign key (tenant_id, branch_id)
    references branches(tenant_id, id) on delete cascade,
  constraint blocked_times_field_tenant_fk foreign key (tenant_id, branch_id, field_id)
    references fields(tenant_id, branch_id, id) on delete cascade,
  constraint blocked_times_status_check check (status in ('active', 'cancelled')),
  constraint blocked_times_range_check check (starts_at < ends_at)
);

create index idx_tenants_status on tenants(status);
create index idx_branches_tenant_id on branches(tenant_id);
create index idx_branches_status on branches(status);
create index idx_fields_tenant_id on fields(tenant_id);
create index idx_fields_branch_id on fields(branch_id);
create index idx_fields_status on fields(status);
create index idx_opening_hours_tenant_id on opening_hours(tenant_id);
create index idx_opening_hours_branch_id on opening_hours(branch_id);
create index idx_opening_hours_day on opening_hours(day_of_week);
create index idx_blocked_times_tenant_id on blocked_times(tenant_id);
create index idx_blocked_times_branch_id on blocked_times(branch_id);
create index idx_blocked_times_field_id on blocked_times(field_id);
create index idx_blocked_times_status on blocked_times(status);
create index idx_blocked_times_range on blocked_times(starts_at, ends_at);

create trigger set_tenants_updated_at
before update on tenants
for each row execute function set_updated_at();

create trigger set_branches_updated_at
before update on branches
for each row execute function set_updated_at();

create trigger set_fields_updated_at
before update on fields
for each row execute function set_updated_at();

create trigger set_opening_hours_updated_at
before update on opening_hours
for each row execute function set_updated_at();

create trigger set_blocked_times_updated_at
before update on blocked_times
for each row execute function set_updated_at();

alter table tenants enable row level security;
alter table branches enable row level security;
alter table fields enable row level security;
alter table opening_hours enable row level security;
alter table blocked_times enable row level security;
