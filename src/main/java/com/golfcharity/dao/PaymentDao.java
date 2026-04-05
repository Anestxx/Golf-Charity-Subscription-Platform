package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.Payment;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class PaymentDao {
    public void createPayment(long userId, String paymentType, BigDecimal amount, String referenceCode) throws SQLException {
        try (Connection connection = Database.getConnection()) {
            createPayment(connection, userId, paymentType, amount, referenceCode);
        }
    }

    public void createPayment(Connection connection, long userId, String paymentType, BigDecimal amount, String referenceCode)
        throws SQLException {
        String sql =
            "INSERT INTO payments (user_id, payment_type, reference_code, amount, status) VALUES (?, ?, ?, ?, 'PAID')";

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            statement.setString(2, paymentType);
            statement.setString(3, referenceCode);
            statement.setBigDecimal(4, amount);
            statement.executeUpdate();
        }
    }

    public List<Payment> listByUser(long userId) throws SQLException {
        String sql =
            "SELECT id, payment_type, reference_code, amount, status, created_at " +
            "FROM payments WHERE user_id = ? ORDER BY created_at DESC";

        List<Payment> payments = new ArrayList<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    payments.add(mapPayment(resultSet));
                }
            }
        }
        return payments;
    }

    private Payment mapPayment(ResultSet resultSet) throws SQLException {
        Payment payment = new Payment();
        payment.setId(resultSet.getLong("id"));
        payment.setPaymentType(resultSet.getString("payment_type"));
        payment.setReferenceCode(resultSet.getString("reference_code"));
        payment.setAmount(resultSet.getBigDecimal("amount"));
        payment.setStatus(resultSet.getString("status"));
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        payment.setCreatedAt(createdAt == null ? null : createdAt.toLocalDateTime());
        return payment;
    }
}
