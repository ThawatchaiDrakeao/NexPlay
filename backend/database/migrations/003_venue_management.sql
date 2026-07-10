alter table fields
add column if not exists sport_type text not null default 'football';

alter table fields
add constraint fields_sport_type_check check (length(trim(sport_type)) between 2 and 50);

update fields
set sport_type = coalesce(nullif(field_type, ''), sport_type);

alter table opening_hours
rename column opens_at to open_time;

alter table opening_hours
rename column closes_at to close_time;

alter table opening_hours
add column field_id uuid;

alter table opening_hours
drop constraint opening_hours_time_check;

alter table opening_hours
drop constraint opening_hours_branch_day_unique;

alter table opening_hours
add constraint opening_hours_field_tenant_fk foreign key (tenant_id, branch_id, field_id)
  references fields(tenant_id, branch_id, id) on delete cascade;

alter table opening_hours
add constraint opening_hours_time_check check (
  (is_closed = true and open_time is null and close_time is null)
  or
  (is_closed = false and open_time is not null and close_time is not null and open_time < close_time)
);

create unique index idx_opening_hours_branch_day_unique
on opening_hours(tenant_id, branch_id, day_of_week)
where field_id is null;

create unique index idx_opening_hours_field_day_unique
on opening_hours(tenant_id, branch_id, field_id, day_of_week)
where field_id is not null;

create index idx_opening_hours_field_id on opening_hours(field_id);

alter table blocked_times
rename column starts_at to start_time;

alter table blocked_times
rename column ends_at to end_time;

create index idx_fields_sport_type on fields(sport_type);
create index idx_blocked_times_start_end on blocked_times(start_time, end_time);
