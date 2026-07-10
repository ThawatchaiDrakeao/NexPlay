create index if not exists idx_bookings_field_date_status
on public.bookings (
  field_id,
  booking_date,
  status
);

create index if not exists idx_blocked_times_field_time
on public.blocked_times (
  field_id,
  start_time,
  end_time
);

create index if not exists idx_payments_booking_id
on public.payments (
  booking_id
);
