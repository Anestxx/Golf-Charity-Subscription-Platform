package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.Event;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class EventDao {
    public List<Event> listUpcomingEvents(int limit) throws SQLException {
        String sql =
            "SELECT id, title, description, location, event_date, capacity, seat_fee, seats_taken " +
            "FROM events WHERE event_date >= NOW() ORDER BY event_date ASC LIMIT ?";

        List<Event> events = new ArrayList<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, limit);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    events.add(mapEvent(resultSet));
                }
            }
        }
        return events;
    }

    public Set<Long> findRegisteredEventIds(long userId) throws SQLException {
        String sql = "SELECT event_id FROM registrations WHERE user_id = ?";
        Set<Long> eventIds = new HashSet<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    eventIds.add(resultSet.getLong("event_id"));
                }
            }
        }
        return eventIds;
    }

    public boolean registerForEvent(long userId, long eventId) throws SQLException {
        String existingSql = "SELECT COUNT(*) FROM registrations WHERE event_id = ? AND user_id = ?";
        String lockSql = "SELECT capacity, seats_taken FROM events WHERE id = ? FOR UPDATE";
        String insertSql = "INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, 'CONFIRMED')";
        String updateSql = "UPDATE events SET seats_taken = seats_taken + 1 WHERE id = ?";

        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                try (PreparedStatement existingStatement = connection.prepareStatement(existingSql)) {
                    existingStatement.setLong(1, eventId);
                    existingStatement.setLong(2, userId);
                    try (ResultSet resultSet = existingStatement.executeQuery()) {
                        resultSet.next();
                        if (resultSet.getInt(1) > 0) {
                            connection.rollback();
                            return false;
                        }
                    }
                }

                try (PreparedStatement lockStatement = connection.prepareStatement(lockSql)) {
                    lockStatement.setLong(1, eventId);
                    try (ResultSet resultSet = lockStatement.executeQuery()) {
                        if (!resultSet.next()) {
                            connection.rollback();
                            return false;
                        }

                        int capacity = resultSet.getInt("capacity");
                        int seatsTaken = resultSet.getInt("seats_taken");
                        if (seatsTaken >= capacity) {
                            connection.rollback();
                            return false;
                        }
                    }
                }

                try (PreparedStatement insertStatement = connection.prepareStatement(insertSql)) {
                    insertStatement.setLong(1, eventId);
                    insertStatement.setLong(2, userId);
                    insertStatement.executeUpdate();
                }

                try (PreparedStatement updateStatement = connection.prepareStatement(updateSql)) {
                    updateStatement.setLong(1, eventId);
                    updateStatement.executeUpdate();
                }

                connection.commit();
                return true;
            } catch (SQLException ex) {
                connection.rollback();
                throw ex;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    private Event mapEvent(ResultSet resultSet) throws SQLException {
        Event event = new Event();
        event.setId(resultSet.getLong("id"));
        event.setTitle(resultSet.getString("title"));
        event.setDescription(resultSet.getString("description"));
        event.setLocation(resultSet.getString("location"));
        Timestamp eventDate = resultSet.getTimestamp("event_date");
        event.setEventDate(eventDate == null ? null : eventDate.toLocalDateTime());
        event.setCapacity(resultSet.getInt("capacity"));
        event.setSeatFee(resultSet.getBigDecimal("seat_fee"));
        event.setSeatsTaken(resultSet.getInt("seats_taken"));
        return event;
    }
}

