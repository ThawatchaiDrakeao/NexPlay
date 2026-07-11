alter table users add column if not exists line_user_id text;

create unique index if not exists idx_users_line_user_id
on users(line_user_id)
where line_user_id is not null;
