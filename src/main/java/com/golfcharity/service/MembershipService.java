package com.golfcharity.service;

import com.golfcharity.config.Database;
import com.golfcharity.dao.PaymentDao;
import com.golfcharity.dao.SubscriptionDao;
import com.golfcharity.util.ReferenceCodeUtil;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;

public class MembershipService {
    private final SubscriptionDao subscriptionDao = new SubscriptionDao();
    private final PaymentDao paymentDao = new PaymentDao();

    public void renewMembership(long userId, BigDecimal amount) throws SQLException {
        try (Connection connection = Database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                subscriptionDao.renewAnnualSubscription(connection, userId, amount);
                paymentDao.createPayment(connection, userId, "MEMBERSHIP", amount, ReferenceCodeUtil.next("MEM"));
                connection.commit();
            } catch (SQLException ex) {
                connection.rollback();
                throw ex;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }
}

