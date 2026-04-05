package com.golfcharity.dao;

import com.golfcharity.config.Database;
import com.golfcharity.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserDao {
    public Optional<User> findByEmail(String email) throws SQLException {
        String sql =
            "SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.team_id, t.name AS team_name, " +
            "u.handicap, u.city, u.bio, u.directory_visible " +
            "FROM users u LEFT JOIN teams t ON t.id = u.team_id WHERE u.email = ?";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapUser(resultSet)) : Optional.empty();
            }
        }
    }

    public Optional<User> findById(long userId) throws SQLException {
        String sql =
            "SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.team_id, t.name AS team_name, " +
            "u.handicap, u.city, u.bio, u.directory_visible " +
            "FROM users u LEFT JOIN teams t ON t.id = u.team_id WHERE u.id = ?";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? Optional.of(mapUser(resultSet)) : Optional.empty();
            }
        }
    }

    public long createUser(User user) throws SQLException {
        String sql =
            "INSERT INTO users (full_name, email, password_hash, role, team_id, handicap, city, bio, directory_visible) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, user.getFullName());
            statement.setString(2, user.getEmail());
            statement.setString(3, user.getPasswordHash());
            statement.setString(4, user.getRole());
            if (user.getTeamId() == null) {
                statement.setNull(5, java.sql.Types.BIGINT);
            } else {
                statement.setLong(5, user.getTeamId());
            }
            if (user.getHandicap() == null) {
                statement.setNull(6, java.sql.Types.INTEGER);
            } else {
                statement.setInt(6, user.getHandicap());
            }
            statement.setString(7, blankToNull(user.getCity()));
            statement.setString(8, blankToNull(user.getBio()));
            statement.setBoolean(9, user.isDirectoryVisible());
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getLong(1);
                }
            }
        }

        throw new SQLException("Unable to create user");
    }

    public void updateProfile(long userId, Long teamId, String city, Integer handicap, String bio, boolean directoryVisible)
        throws SQLException {
        String sql =
            "UPDATE users SET team_id = ?, city = ?, handicap = ?, bio = ?, directory_visible = ? WHERE id = ?";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            if (teamId == null) {
                statement.setNull(1, java.sql.Types.BIGINT);
            } else {
                statement.setLong(1, teamId);
            }
            statement.setString(2, blankToNull(city));
            if (handicap == null) {
                statement.setNull(3, java.sql.Types.INTEGER);
            } else {
                statement.setInt(3, handicap);
            }
            statement.setString(4, blankToNull(bio));
            statement.setBoolean(5, directoryVisible);
            statement.setLong(6, userId);
            statement.executeUpdate();
        }
    }

    public List<User> searchDirectory(String query, long viewerUserId) throws SQLException {
        String term = query == null ? "" : query.trim();
        String sql =
            "SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.team_id, t.name AS team_name, " +
            "u.handicap, u.city, u.bio, u.directory_visible " +
            "FROM users u LEFT JOIN teams t ON t.id = u.team_id " +
            "WHERE (u.directory_visible = TRUE OR u.id = ?) " +
            "AND (? = '' OR u.full_name LIKE ? OR COALESCE(t.name, '') LIKE ? OR COALESCE(u.city, '') LIKE ?) " +
            "ORDER BY u.full_name ASC";

        List<User> users = new ArrayList<>();
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, viewerUserId);
            statement.setString(2, term);
            statement.setString(3, "%" + term + "%");
            statement.setString(4, "%" + term + "%");
            statement.setString(5, "%" + term + "%");

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    users.add(mapUser(resultSet));
                }
            }
        }
        return users;
    }

    private User mapUser(ResultSet resultSet) throws SQLException {
        User user = new User();
        user.setId(resultSet.getLong("id"));
        user.setFullName(resultSet.getString("full_name"));
        user.setEmail(resultSet.getString("email"));
        user.setPasswordHash(resultSet.getString("password_hash"));
        user.setRole(resultSet.getString("role"));

        long teamId = resultSet.getLong("team_id");
        user.setTeamId(resultSet.wasNull() ? null : teamId);
        user.setTeamName(resultSet.getString("team_name"));

        int handicap = resultSet.getInt("handicap");
        user.setHandicap(resultSet.wasNull() ? null : handicap);

        user.setCity(resultSet.getString("city"));
        user.setBio(resultSet.getString("bio"));
        user.setDirectoryVisible(resultSet.getBoolean("directory_visible"));
        return user;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

