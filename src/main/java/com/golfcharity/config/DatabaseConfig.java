package com.golfcharity.config;

public final class DatabaseConfig {
    private static final String DEFAULT_URL =
        "jdbc:mysql://localhost:3306/golf_charity?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "root";

    private DatabaseConfig() {
    }

    public static String url() {
        return envOrDefault("GOLF_DB_URL", DEFAULT_URL);
    }

    public static String user() {
        return envOrDefault("GOLF_DB_USER", DEFAULT_USER);
    }

    public static String password() {
        return envOrDefault("GOLF_DB_PASSWORD", DEFAULT_PASSWORD);
    }

    private static String envOrDefault(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }
}

