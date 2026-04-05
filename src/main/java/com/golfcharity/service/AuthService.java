package com.golfcharity.service;

import com.golfcharity.dao.SubscriptionDao;
import com.golfcharity.dao.TeamDao;
import com.golfcharity.dao.UserDao;
import com.golfcharity.model.User;
import com.golfcharity.util.PasswordUtil;

import java.sql.SQLException;
import java.util.Locale;
import java.util.Optional;

public class AuthService {
    private final UserDao userDao = new UserDao();
    private final TeamDao teamDao = new TeamDao();
    private final SubscriptionDao subscriptionDao = new SubscriptionDao();

    public User authenticate(String email, String password) throws SQLException {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        Optional<User> candidate = userDao.findByEmail(email.trim().toLowerCase(Locale.ENGLISH));
        if (candidate.isEmpty() || !PasswordUtil.matches(password, candidate.get().getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return candidate.get();
    }

    public User register(String fullName, String email, String password, String teamName, String city) throws SQLException {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ENGLISH);
        if (userDao.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }

        Long teamId = teamDao.findOrCreate(teamName, city);

        User user = new User();
        user.setFullName(fullName.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(PasswordUtil.hashPassword(password));
        user.setRole("MEMBER");
        user.setTeamId(teamId);
        user.setCity(city == null || city.isBlank() ? null : city.trim());
        user.setDirectoryVisible(true);

        long userId = userDao.createUser(user);
        subscriptionDao.createStarterSubscription(userId);
        return userDao.findById(userId)
            .orElseThrow(() -> new IllegalStateException("Unable to load new user"));
    }
}

