CREATE DATABASE IF NOT EXISTS golf_charity;
USE golf_charity;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tee_slots;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS teams;

CREATE TABLE teams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    city VARCHAR(100),
    total_raised DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    team_id BIGINT,
    handicap INT,
    city VARCHAR(100),
    bio VARCHAR(255),
    directory_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    plan_name VARCHAR(60) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(140) NOT NULL,
    description TEXT,
    location VARCHAR(150) NOT NULL,
    event_date DATETIME NOT NULL,
    capacity INT NOT NULL,
    seat_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    seats_taken INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_registration UNIQUE (event_id, user_id),
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE donations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    dedication VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donations_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tee_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(120) NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    max_players INT NOT NULL DEFAULT 4,
    booked_players INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT uq_tee_slot UNIQUE (course_name, slot_date, slot_time)
);

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tee_slot_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_booking UNIQUE (tee_slot_id, user_id),
    CONSTRAINT fk_bookings_slot FOREIGN KEY (tee_slot_id) REFERENCES tee_slots(id),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    payment_type VARCHAR(40) NOT NULL,
    reference_code VARCHAR(64) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_directory ON users(directory_visible, full_name);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_tee_slots_date ON tee_slots(slot_date, slot_time);
CREATE INDEX idx_payments_user ON payments(user_id, created_at);

DELIMITER //
CREATE TRIGGER trg_donation_after_insert
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
    DECLARE v_team_id BIGINT;
    SELECT team_id INTO v_team_id
    FROM users
    WHERE id = NEW.user_id;

    IF v_team_id IS NOT NULL THEN
        UPDATE teams
        SET total_raised = total_raised + NEW.amount
        WHERE id = v_team_id;
    END IF;
END//

CREATE PROCEDURE sp_renew_subscription(
    IN p_user_id BIGINT,
    IN p_plan_name VARCHAR(60),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_amount DECIMAL(10, 2)
)
BEGIN
    INSERT INTO subscriptions (user_id, plan_name, status, start_date, end_date, amount, auto_renew)
    VALUES (p_user_id, p_plan_name, 'ACTIVE', p_start_date, p_end_date, p_amount, TRUE);
END//
DELIMITER ;

