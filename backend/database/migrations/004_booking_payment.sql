create table bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  field_id uuid not null,
  customer_id uuid not null references users(id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending_payment',
  total_amount numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_field_tenant_fk foreign key (tenant_id, branch_id, field_id)
    references fields(tenant_id, branch_id, id) on delete restrict,
  constraint bookings_status_check check (
    status in ('pending_payment', 'awaiting_approval', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired')
  ),
  constraint bookings_time_range_check check (start_time < end_time),
  constraint bookings_amount_check check (total_amount >= 0),
  constraint bookings_tenant_id_id_unique unique (tenant_id, id)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  tenant_id uuid not null,
  amount numeric(10, 2) not null,
  status text not null default 'pending',
  payment_method text not null default 'promptpay',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_booking_tenant_fk foreign key (tenant_id, booking_id)
    references bookings(tenant_id, id) on delete cascade,
  constraint payments_status_check check (status in ('pending', 'submitted', 'approved', 'rejected')),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_method_check check (payment_method in ('promptpay', 'cash', 'bank_transfer'))
);

create table payment_slips (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  image_url text not null,
  uploaded_at timestamptz not null default now(),
  constraint payment_slips_image_url_check check (length(trim(image_url)) > 0)
);

create index idx_bookings_tenant_id on bookings(tenant_id);
create index idx_bookings_branch_id on bookings(branch_id);
create index idx_bookings_field_id on bookings(field_id);
create index idx_bookings_customer_id on bookings(customer_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_field_date on bookings(field_id, booking_date);
create index idx_bookings_active_conflict on bookings(tenant_id, field_id, booking_date, start_time, end_time)
where status in ('pending_payment', 'awaiting_approval', 'confirmed');

create index idx_payments_booking_id on payments(booking_id);
create index idx_payments_tenant_id on payments(tenant_id);
create index idx_payments_status on payments(status);
create index idx_payment_slips_payment_id on payment_slips(payment_id);
create index idx_payment_slips_uploaded_at on payment_slips(uploaded_at);

create trigger set_bookings_updated_at
before update on bookings
for each row execute function set_updated_at();

create trigger set_payments_updated_at
before update on payments
for each row execute function set_updated_at();

alter table bookings enable row level security;
alter table payments enable row level security;
alter table payment_slips enable row level security;
