package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.LeaderboardEntry;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DonationDao {
    public void createDonation(long userId, BigDecimal amount, String dedication, String referenceCode) throws SQLException {
        String donationSql = "INSERT INTO donations (user_id, amount, dedication) VALUES (?, ?, ?)";
        String paymentSql =
            "INSERT INTO payments (user_id, payment_type, reference_code, amount, status) VALUES (?, 'DONATION', ?, ?, 'PAID')";

        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                try (PreparedStatement donationStatement = connection.prepareStatement(donationSql)) {
                    donationStatement.setLong(1, userId);
                    donationStatement.setBigDecimal(2, amount);
                    donationStatement.setString(3, dedication == null || dedication.isBlank() ? null : dedication.trim());
                    donationStatement.executeUpdate();
                }

                try (PreparedStatement paymentStatement = connection.prepareStatement(paymentSql)) {
                    paymentStatement.setLong(1, userId);
                    paymentStatement.setString(2, referenceCode);
                    paymentStatement.setBigDecimal(3, amount);
                    paymentStatement.executeUpdate();
                }

                connection.commit();
            } catch (SQLException ex) {
                connection.rollback();
                throw ex;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    public List<LeaderboardEntry> topDonors(int limit) throws SQLException {
        String sql =
            "SELECT u.full_name AS label, COALESCE(t.name, 'Independent') AS sub_label, " +
            "SUM(d.amount) AS total_amount, COUNT(*) AS contribution_count " +
            "FROM donations d " +
            "JOIN users u ON u.id = d.user_id " +
            "LEFT JOIN teams t ON t.id = u.team_id " +
            "GROUP BY u.id, u.full_name, t.name " +
            "ORDER BY total_amount DESC, contribution_count DESC LIMIT ?";

        return loadLeaderboard(sql, limit);
    }

    public List<LeaderboardEntry> topTeams(int limit) throws SQLException {
        String sql =
            "SELECT name AS label, COALESCE(city, 'Community Club') AS sub_label, total_raised AS total_amount, " +
            "(SELECT COUNT(*) FROM users WHERE users.team_id = teams.id) AS contribution_count " +
            "FROM teams ORDER BY total_raised DESC, name ASC LIMIT ?";

        return loadLeaderboard(sql, limit);
    }

    public BigDecimal totalRaised() throws SQLException {
        String sql = "SELECT COALESCE(SUM(amount), 0.00) AS total_amount FROM donations";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            resultSet.next();
            return resultSet.getBigDecimal("total_amount");
        }
    }

    private List<LeaderboardEntry> loadLeaderboard(String sql, int limit) throws SQLException {
        List<LeaderboardEntry> entries = new ArrayList<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, limit);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    LeaderboardEntry entry = new LeaderboardEntry();
                    entry.setLabel(resultSet.getString("label"));
                    entry.setSubLabel(resultSet.getString("sub_label"));
                    entry.setTotalAmount(resultSet.getBigDecimal("total_amount"));
                    entry.setContributionCount(resultSet.getInt("contribution_count"));
                    entries.add(entry);
                }
            }
        }
        return entries;
    }
}

