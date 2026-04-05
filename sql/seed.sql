USE golf_charity;

INSERT INTO teams (name, city)
VALUES
    ('Fairway Forward', 'Kolkata'),
    ('Birdie Benefactors', 'Bengaluru'),
    ('Par for Purpose', 'Delhi');

INSERT INTO users (full_name, email, password_hash, role, team_id, handicap, city, bio, directory_visible)
VALUES
    ('Maya Sterling', 'maya@example.com', 'pbkdf2$120000$lkSxtX4Q/9G6ms1m6XsVog==$n1Jwgu6rSpc6LHs457CQzY4ZPn969O2qDfWIYjr4SJ8=', 'MEMBER', 1, 14, 'Kolkata', 'Weekend golfer raising funds for community youth clinics.', TRUE),
    ('Admin Captain', 'admin@golfcharity.local', 'pbkdf2$120000$KVT9vn5dCZ1oztDir2HavQ==$Tkxgap8IXhiHo1Y2D60Lf3MlZKqR74kohg5iK8VtlaY=', 'ADMIN', 2, 8, 'Bengaluru', 'Platform administrator and tournament coordinator.', TRUE),
    ('Arjun Patel', 'arjun@example.com', 'pbkdf2$120000$lkSxtX4Q/9G6ms1m6XsVog==$n1Jwgu6rSpc6LHs457CQzY4ZPn969O2qDfWIYjr4SJ8=', 'MEMBER', 2, 11, 'Pune', 'Looking to pair philanthropy with competitive play.', TRUE),
    ('Nina Bose', 'nina@example.com', 'pbkdf2$120000$lkSxtX4Q/9G6ms1m6XsVog==$n1Jwgu6rSpc6LHs457CQzY4ZPn969O2qDfWIYjr4SJ8=', 'MEMBER', 3, 18, 'Delhi', 'Corporate sponsor and charity scramble regular.', FALSE);

INSERT INTO subscriptions (user_id, plan_name, status, start_date, end_date, amount, auto_renew)
VALUES
    (1, 'Annual Member', 'ACTIVE', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 249.00, TRUE),
    (2, 'Club Admin', 'ACTIVE', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 0.00, TRUE),
    (3, 'Annual Member', 'ACTIVE', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 249.00, FALSE);

INSERT INTO events (title, description, location, event_date, capacity, seat_fee, seats_taken)
VALUES
    ('Sunrise Charity Open', 'A premium morning scramble benefitting junior golf scholarships.', 'Royal Calcutta Golf Club', DATE_ADD(NOW(), INTERVAL 8 DAY), 48, 95.00, 12),
    ('Twilight Networking Round', 'Nine holes plus a donor mixer for partner organisations.', 'Prestige Golfshire', DATE_ADD(NOW(), INTERVAL 15 DAY), 24, 65.00, 8),
    ('Founders Invitational', 'Private fundraising event for annual subscribers and sponsors.', 'DLF Golf & Country Club', DATE_ADD(NOW(), INTERVAL 22 DAY), 32, 150.00, 17);

INSERT INTO registrations (event_id, user_id, status)
VALUES
    (1, 1, 'CONFIRMED'),
    (2, 2, 'CONFIRMED'),
    (3, 3, 'CONFIRMED');

UPDATE events
SET seats_taken = (
    SELECT COUNT(*)
    FROM registrations
    WHERE registrations.event_id = events.id
);

INSERT INTO tee_slots (course_name, slot_date, slot_time, max_players, booked_players, price)
VALUES
    ('Royal Calcutta Golf Club', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '06:45:00', 4, 1, 40.00),
    ('Royal Calcutta Golf Club', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '07:30:00', 4, 2, 40.00),
    ('Prestige Golfshire', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '08:15:00', 4, 1, 55.00),
    ('Prestige Golfshire', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '09:00:00', 4, 0, 55.00);

INSERT INTO bookings (tee_slot_id, user_id, status)
VALUES
    (1, 1, 'CONFIRMED'),
    (2, 2, 'CONFIRMED'),
    (2, 3, 'CONFIRMED'),
    (3, 2, 'CONFIRMED');

UPDATE tee_slots
SET booked_players = (
    SELECT COUNT(*)
    FROM bookings
    WHERE bookings.tee_slot_id = tee_slots.id
);

INSERT INTO donations (user_id, amount, dedication)
VALUES
    (1, 250.00, 'For youth golf access'),
    (2, 400.00, 'Supporting adaptive golf coaching'),
    (3, 180.00, 'In honour of local caddies');

INSERT INTO payments (user_id, payment_type, reference_code, amount, status)
VALUES
    (1, 'MEMBERSHIP', 'PAY-1001', 249.00, 'PAID'),
    (1, 'DONATION', 'PAY-1002', 250.00, 'PAID'),
    (2, 'SPONSORSHIP', 'PAY-1003', 400.00, 'PAID'),
    (3, 'EVENT_FEE', 'PAY-1004', 65.00, 'PAID');
