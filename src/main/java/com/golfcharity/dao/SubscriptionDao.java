package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.Subscription;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Optional;

public class SubscriptionDao {
    public Optional<Subscription> findLatestForUser(long userId) throws SQLException {
        String sql =
            "SELECT id, user_id, plan_name, status, start_date, end_date, amount, auto_renew " +
            "FROM subscriptions WHERE user_id = ? ORDER BY end_date DESC LIMIT 1";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapSubscription(resultSet)) : Optional.empty();
            }
        }
    }

    public void createStarterSubscription(long userId) throws SQLException {
        String sql =
            "INSERT INTO subscriptions (user_id, plan_name, status, start_date, end_date, amount, auto_renew) " +
            "VALUES (?, 'Starter Pass', 'TRIAL', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0.00, FALSE)";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            statement.executeUpdate();
        }
    }

    public void renewAnnualSubscription(long userId, BigDecimal amount) throws SQLException {
        try (Connection connection = Database.getConnection()) {
            renewAnnualSubscription(connection, userId, amount);
        }
    }

    public void renewAnnualSubscription(Connection connection, long userId, BigDecimal amount) throws SQLException {
        String sql = "{CALL sp_renew_subscription(?, ?, ?, ?, ?)}";
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusYears(1);

        try (CallableStatement statement = connection.prepareCall(sql)) {
            statement.setLong(1, userId);
            statement.setString(2, "Annual Member");
            statement.setDate(3, Date.valueOf(start));
            statement.setDate(4, Date.valueOf(end));
            statement.setBigDecimal(5, amount);
            statement.execute();
        }
    }

    private Subscription mapSubscription(ResultSet resultSet) throws SQLException {
        Subscription subscription = new Subscription();
        subscription.setId(resultSet.getLong("id"));
        subscription.setUserId(resultSet.getLong("user_id"));
        subscription.setPlanName(resultSet.getString("plan_name"));
        subscription.setStatus(resultSet.getString("status"));
        subscription.setStartDate(resultSet.getDate("start_date").toLocalDate());
        subscription.setEndDate(resultSet.getDate("end_date").toLocalDate());
        subscription.setAmount(resultSet.getBigDecimal("amount"));
        subscription.setAutoRenew(resultSet.getBoolean("auto_renew"));
        return subscription;
    }
}
