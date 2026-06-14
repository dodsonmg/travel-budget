create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  destination text not null,
  name text,
  start_date date,
  end_date date,
  status text default 'planning',
  created_at timestamptz default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  category text not null,
  description text not null,
  budgeted numeric default 0,
  paid numeric default 0,
  pending numeric default 0,
  fully_paid boolean default false,
  notes text,
  created_at timestamptz default now()
);

alter table trips enable row level security;
alter table expenses enable row level security;

create policy "users manage own trips" on trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own expenses" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
