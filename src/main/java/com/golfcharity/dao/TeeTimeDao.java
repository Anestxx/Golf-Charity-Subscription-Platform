package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.TeeSlot;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TeeTimeDao {
    public List<TeeSlot> listUpcomingSlots(int limit) throws SQLException {
        String sql =
            "SELECT id, course_name, slot_date, slot_time, max_players, booked_players, price " +
            "FROM tee_slots WHERE slot_date >= CURDATE() ORDER BY slot_date ASC, slot_time ASC LIMIT ?";

        List<TeeSlot> slots = new ArrayList<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, limit);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    slots.add(mapSlot(resultSet));
                }
            }
        }
        return slots;
    }

    public Set<Long> findBookedSlotIds(long userId) throws SQLException {
        String sql = "SELECT tee_slot_id FROM bookings WHERE user_id = ?";
        Set<Long> slotIds = new HashSet<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    slotIds.add(resultSet.getLong("tee_slot_id"));
                }
            }
        }
        return slotIds;
    }

    public boolean bookSlot(long userId, long slotId) throws SQLException {
        String lockSql =
            "SELECT slot_date, max_players, booked_players FROM tee_slots WHERE id = ? FOR UPDATE";
        String existingSlotSql = "SELECT COUNT(*) FROM bookings WHERE tee_slot_id = ? AND user_id = ?";
        String sameDaySql =
            "SELECT COUNT(*) FROM bookings b " +
            "JOIN tee_slots t ON t.id = b.tee_slot_id " +
            "WHERE b.user_id = ? AND t.slot_date = ? AND b.status = 'CONFIRMED'";
        String insertSql = "INSERT INTO bookings (tee_slot_id, user_id, status) VALUES (?, ?, 'CONFIRMED')";
        String updateSql = "UPDATE tee_slots SET booked_players = booked_players + 1 WHERE id = ?";

        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                try (PreparedStatement existingStatement = connection.prepareStatement(existingSlotSql)) {
                    existingStatement.setLong(1, slotId);
                    existingStatement.setLong(2, userId);
                    try (ResultSet resultSet = existingStatement.executeQuery()) {
                        resultSet.next();
                        if (resultSet.getInt(1) > 0) {
                            connection.rollback();
                            return false;
                        }
                    }
                }

                Date slotDate;
                try (PreparedStatement lockStatement = connection.prepareStatement(lockSql)) {
                    lockStatement.setLong(1, slotId);
                    try (ResultSet resultSet = lockStatement.executeQuery()) {
                        if (!resultSet.next()) {
                            connection.rollback();
                            return false;
                        }

                        int maxPlayers = resultSet.getInt("max_players");
                        int bookedPlayers = resultSet.getInt("booked_players");
                        if (bookedPlayers >= maxPlayers) {
                            connection.rollback();
                            return false;
                        }
                        slotDate = resultSet.getDate("slot_date");
                    }
                }

                try (PreparedStatement sameDayStatement = connection.prepareStatement(sameDaySql)) {
                    sameDayStatement.setLong(1, userId);
                    sameDayStatement.setDate(2, slotDate);
                    try (ResultSet resultSet = sameDayStatement.executeQuery()) {
                        resultSet.next();
                        if (resultSet.getInt(1) > 0) {
                            connection.rollback();
                            return false;
                        }
                    }
                }

                try (PreparedStatement insertStatement = connection.prepareStatement(insertSql)) {
                    insertStatement.setLong(1, slotId);
                    insertStatement.setLong(2, userId);
                    insertStatement.executeUpdate();
                }

                try (PreparedStatement updateStatement = connection.prepareStatement(updateSql)) {
                    updateStatement.setLong(1, slotId);
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

    private TeeSlot mapSlot(ResultSet resultSet) throws SQLException {
        TeeSlot slot = new TeeSlot();
        slot.setId(resultSet.getLong("id"));
        slot.setCourseName(resultSet.getString("course_name"));
        slot.setSlotDate(resultSet.getDate("slot_date").toLocalDate());
        slot.setSlotTime(resultSet.getTime("slot_time").toLocalTime());
        slot.setMaxPlayers(resultSet.getInt("max_players"));
        slot.setBookedPlayers(resultSet.getInt("booked_players"));
        slot.setPrice(resultSet.getBigDecimal("price"));
        return slot;
    }
}

