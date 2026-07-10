create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_lower_check check (email = lower(email)),
  constraint users_status_check check (status in ('active', 'inactive', 'suspended'))
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_name_check check (name in ('SUPER_ADMIN', 'TENANT_OWNER', 'STAFF', 'CUSTOMER'))
);

create table tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_users_status_check check (status in ('active', 'inactive')),
  constraint tenant_users_unique unique (tenant_id, user_id, role_id)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_check check (length(action) between 3 and 120)
);

insert into roles (name)
values ('SUPER_ADMIN'), ('TENANT_OWNER'), ('STAFF'), ('CUSTOMER')
on conflict (name) do nothing;

create index idx_users_email on users(email);
create index idx_users_status on users(status);
create index idx_roles_name on roles(name);
create index idx_tenant_users_tenant_id on tenant_users(tenant_id);
create index idx_tenant_users_user_id on tenant_users(user_id);
create index idx_tenant_users_role_id on tenant_users(role_id);
create index idx_tenant_users_status on tenant_users(status);
create index idx_audit_logs_tenant_id on audit_logs(tenant_id);
create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_action on audit_logs(action);
create index idx_audit_logs_created_at on audit_logs(created_at);

create trigger set_users_updated_at
before update on users
for each row execute function set_updated_at();

create trigger set_roles_updated_at
before update on roles
for each row execute function set_updated_at();

create trigger set_tenant_users_updated_at
before update on tenant_users
for each row execute function set_updated_at();

alter table users enable row level security;
alter table roles enable row level security;
alter table tenant_users enable row level security;
alter table audit_logs enable row level security;
