package com.golfcharity.dao;

import com.golfcharity.config.Database;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class TeamDao {
    public Long findOrCreate(String teamName, String city) throws SQLException {
        if (teamName == null || teamName.isBlank()) {
            return null;
        }

        try (Connection connection = Database.getConnection()) {
            return findOrCreate(connection, teamName, city);
        }
    }

    public Long findOrCreate(Connection connection, String teamName, String city) throws SQLException {
        if (teamName == null || teamName.isBlank()) {
            return null;
        }

        String normalizedName = teamName.trim();
        String selectSql = "SELECT id FROM teams WHERE LOWER(name) = LOWER(?)";
        try (PreparedStatement statement = connection.prepareStatement(selectSql)) {
            statement.setString(1, normalizedName);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return resultSet.getLong("id");
                }
            }
        }

        String insertSql = "INSERT INTO teams (name, city) VALUES (?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, normalizedName);
            statement.setString(2, blankToNull(city));
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getLong(1);
                }
            }
        }

        throw new SQLException("Unable to create team record");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

