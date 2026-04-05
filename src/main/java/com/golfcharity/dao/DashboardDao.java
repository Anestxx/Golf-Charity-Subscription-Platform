package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.DashboardStats;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DashboardDao {
    public DashboardStats fetchStats() throws SQLException {
        String sql =
            "SELECT " +
            "  (SELECT COUNT(DISTINCT u.id) " +
            "     FROM users u " +
            "     JOIN subscriptions s ON s.user_id = u.id " +
            "    WHERE s.status IN ('ACTIVE', 'TRIAL') AND s.end_date >= CURDATE()) AS active_members, " +
            "  (SELECT COUNT(*) FROM events WHERE event_date >= NOW()) AS upcoming_events, " +
            "  (SELECT COALESCE(SUM(GREATEST(max_players - booked_players, 0)), 0) " +
            "     FROM tee_slots WHERE slot_date >= CURDATE()) AS open_tee_slots, " +
            "  (SELECT COALESCE(SUM(amount), 0.00) FROM donations) AS total_raised";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            resultSet.next();
            DashboardStats stats = new DashboardStats();
            stats.setActiveMembers(resultSet.getInt("active_members"));
            stats.setUpcomingEvents(resultSet.getInt("upcoming_events"));
            stats.setOpenTeeSlots(resultSet.getInt("open_tee_slots"));
            stats.setTotalRaised(resultSet.getBigDecimal("total_raised"));
            return stats;
        }
    }
}
