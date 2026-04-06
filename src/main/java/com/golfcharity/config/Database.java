package com.golfcharity.config;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class Database {
    private static Driver mysqlDriver;

    static {
        try {
            mysqlDriver = new com.mysql.cj.jdbc.Driver();
            DriverManager.registerDriver(mysqlDriver);
        } catch (SQLException ex) {
            throw new ExceptionInInitializerError("Unable to register MySQL JDBC driver: " + ex.getMessage());
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

    public static void deregisterDriver() {
        if (mysqlDriver != null) {
            try {
                DriverManager.deregisterDriver(mysqlDriver);
            } catch (SQLException ignored) {
                // Best effort cleanup for servlet container shutdown.
            }
        }
    }
}


