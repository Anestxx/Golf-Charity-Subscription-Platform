insert into public.charities (id, name, slug, category, location, featured, description, image_url, events_csv, created_at)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'First Green Futures',
    'first-green-futures',
    'Youth Access',
    'London',
    true,
    'Funds youth golf access, coaching scholarships, and equipment for underrepresented junior golfers.',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
    'Spring Golf Day|Junior Golf Clinics',
    '2026-03-26T00:00:00.000Z'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Fairways For Recovery',
    'fairways-for-recovery',
    'Mental Health',
    'Manchester',
    false,
    'Supports golf-linked mental health recovery programs, mentoring, and return-to-play initiatives.',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    'Open Hearts Golf Day|Golf Coaching Circle',
    '2026-03-26T00:00:00.000Z'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Green Mile Relief',
    'green-mile-relief',
    'Crisis Support',
    'Birmingham',
    false,
    'Delivers emergency grants for families facing hardship through golf-day fundraising and member giving.',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    'Summer Charity Golf Classic|Relief Golf Auction',
    '2026-03-26T00:00:00.000Z'
  )
on conflict (id) do nothing;

insert into public.users (id, name, email, password_hash, role, created_at)
values
  (
    '44444444-4444-4444-4444-444444444444',
    'Maya Thompson',
    'maya@example.com',
    '$2b$10$uF3hcAEDikJpUchEs4YXj.I68fj353W9DTupsmYpDjALBWeXOhsJa',
    'SUBSCRIBER',
    '2026-03-26T00:00:00.000Z'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Arjun Patel',
    'arjun@example.com',
    '$2b$10$uF3hcAEDikJpUchEs4YXj.I68fj353W9DTupsmYpDjALBWeXOhsJa',
    'SUBSCRIBER',
    '2026-03-26T00:00:00.000Z'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Ava Collins',
    'admin@example.com',
    '$2b$10$31C1lQM22E8FRAfufQrfG.rgnacG6BYei/VlnvTlKbf6Wns.EX/QW',
    'ADMIN',
    '2026-03-26T00:00:00.000Z'
  )
on conflict (id) do nothing;

insert into public.subscriptions (id, user_id, plan, status, price, prize_contribution, renewal_date, created_at)
values
  ('77777777-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444444', 'YEARLY', 'ACTIVE', 299, 144, '2026-12-01T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555555', 'MONTHLY', 'ACTIVE', 29, 12, '2026-04-10T00:00:00.000Z', '2026-03-26T00:00:00.000Z')
on conflict (id) do nothing;

insert into public.charity_selections (id, user_id, charity_id, percentage, independent_donation)
values
  ('88888888-8888-8888-8888-888888888881', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 18, 0),
  ('88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 12, 0)
on conflict (id) do nothing;

insert into public.scores (id, user_id, value, played_at, created_at)
values
  ('99999999-9999-9999-9999-999999999991', '44444444-4444-4444-4444-444444444444', 21, '2026-03-18T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999992', '44444444-4444-4444-4444-444444444444', 24, '2026-03-11T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999993', '44444444-4444-4444-4444-444444444444', 20, '2026-03-04T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999994', '44444444-4444-4444-4444-444444444444', 19, '2026-02-25T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999995', '44444444-4444-4444-4444-444444444444', 22, '2026-02-18T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999996', '55555555-5555-5555-5555-555555555555', 16, '2026-03-20T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999997', '55555555-5555-5555-5555-555555555555', 18, '2026-03-12T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999998', '55555555-5555-5555-5555-555555555555', 18, '2026-03-05T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 17, '2026-02-27T00:00:00.000Z', '2026-03-26T00:00:00.000Z'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 15, '2026-02-19T00:00:00.000Z', '2026-03-26T00:00:00.000Z')
on conflict (id) do nothing;

insert into public.draws (id, month, mode, status, numbers_csv, jackpot_carry, created_at, published_at)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '2026-02', 'RANDOM', 'PUBLISHED', '19,21,24,30,34', 760, '2026-03-26T00:00:00.000Z', '2026-02-28T12:00:00.000Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '2026-03', 'ALGORITHM', 'DRAFT', '16,18,20,22,24', 760, '2026-03-26T00:00:00.000Z', null)
on conflict (id) do nothing;

insert into public.winners (id, draw_id, user_id, tier, amount, status)
values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '44444444-4444-4444-4444-444444444444', 'FOUR_MATCH', 320, 'PAID'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '44444444-4444-4444-4444-444444444444', 'THREE_MATCH', 110, 'PENDING')
on conflict (id) do nothing;

insert into public.winner_proofs (id, winner_id, user_id, note, status, created_at)
values
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    '44444444-4444-4444-4444-444444444444',
    'Screenshot reference uploaded for review.',
    'PENDING',
    '2026-03-26T00:00:00.000Z'
  )
on conflict (id) do nothing;
