create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'SUBSCRIBER' check (role in ('SUBSCRIBER', 'ADMIN')),
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  plan text not null check (plan in ('MONTHLY', 'YEARLY')),
  status text not null check (status in ('ACTIVE', 'LAPSED', 'CANCELLED')),
  price integer not null,
  prize_contribution integer not null,
  renewal_date timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  location text not null,
  featured boolean not null default false,
  description text not null,
  image_url text not null,
  events_csv text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.charity_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  charity_id uuid not null references public.charities(id) on delete cascade,
  percentage integer not null,
  independent_donation integer not null default 0
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  value integer not null,
  played_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  mode text not null check (mode in ('RANDOM', 'ALGORITHM')),
  status text not null check (status in ('DRAFT', 'PUBLISHED')),
  numbers_csv text not null,
  jackpot_carry integer not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  tier text not null check (tier in ('THREE_MATCH', 'FOUR_MATCH', 'FIVE_MATCH')),
  amount integer not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'REJECTED'))
);

create table if not exists public.winner_proofs (
  id uuid primary key default gen_random_uuid(),
  winner_id uuid not null unique references public.winners(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  note text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create index if not exists idx_scores_user_played_at on public.scores(user_id, played_at desc);
create index if not exists idx_draws_month_status on public.draws(month, status);
create index if not exists idx_winners_draw_user on public.winners(draw_id, user_id);

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.charities enable row level security;
alter table public.charity_selections enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.winners enable row level security;
alter table public.winner_proofs enable row level security;

drop policy if exists "public can read charities" on public.charities;
create policy "public can read charities" on public.charities for select using (true);

drop policy if exists "public can read published draws" on public.draws;
create policy "public can read published draws" on public.draws for select using (status = 'PUBLISHED');

drop policy if exists "service role full access users" on public.users;
create policy "service role full access users" on public.users for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access sessions" on public.sessions;
create policy "service role full access sessions" on public.sessions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access subscriptions" on public.subscriptions;
create policy "service role full access subscriptions" on public.subscriptions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access charities" on public.charities;
create policy "service role full access charities" on public.charities for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access charity selections" on public.charity_selections;
create policy "service role full access charity selections" on public.charity_selections for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access scores" on public.scores;
create policy "service role full access scores" on public.scores for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access draws" on public.draws;
create policy "service role full access draws" on public.draws for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access winners" on public.winners;
create policy "service role full access winners" on public.winners for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service role full access winner proofs" on public.winner_proofs;
create policy "service role full access winner proofs" on public.winner_proofs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
