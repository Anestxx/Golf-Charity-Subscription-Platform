package com.golfcharity.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class Database {
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException ex) {
            throw new ExceptionInInitializerError("MySQL JDBC driver not found: " + ex.getMessage());
        }
    }

    private Database() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            DatabaseConfig.url(),
            DatabaseConfig.user(),
            DatabaseConfig.password()
        );
    }
}

