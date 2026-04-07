package com.golfcharity.config;

import java.net.URI;
import java.net.URISyntaxException;

public final class DatabaseConfig {
    private static final String DEFAULT_URL =
        "jdbc:mysql://localhost:3306/golf_charity?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "root";

    private DatabaseConfig() {
    }

    public static String url() {
        String explicitUrl = envFirstNonBlank("GOLF_DB_URL", "MYSQL_URL", "DATABASE_URL");
        if (explicitUrl != null) {
            return normalizeJdbcUrl(explicitUrl);
        }

        String railwayHost = System.getenv("MYSQLHOST");
        if (isNotBlank(railwayHost)) {
            String port = envOrDefault("MYSQLPORT", "3306");
            String db = envOrDefault("MYSQLDATABASE", "golf_charity");
            return "jdbc:mysql://" + railwayHost + ":" + port + "/" + db +
                "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        }

        return DEFAULT_URL;
    }

    public static String user() {
        String explicitUser = envFirstNonBlank("GOLF_DB_USER", "MYSQLUSER");
        if (explicitUser != null) {
            return explicitUser;
        }

        Credentials credentials = credentialsFromUrl(envFirstNonBlank("MYSQL_URL", "DATABASE_URL"));
        if (credentials != null && isNotBlank(credentials.user())) {
            return credentials.user();
        }

        return DEFAULT_USER;
    }

    public static String password() {
        String explicitPassword = envFirstNonBlank("GOLF_DB_PASSWORD", "MYSQLPASSWORD");
        if (explicitPassword != null) {
            return explicitPassword;
        }

        Credentials credentials = credentialsFromUrl(envFirstNonBlank("MYSQL_URL", "DATABASE_URL"));
        if (credentials != null && credentials.password() != null) {
            return credentials.password();
        }

        return DEFAULT_PASSWORD;
    }

    private static String envOrDefault(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String envFirstNonBlank(String... keys) {
        for (String key : keys) {
            String value = System.getenv(key);
            if (isNotBlank(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private static String normalizeJdbcUrl(String value) {
        String trimmed = value.trim();
        if (trimmed.startsWith("jdbc:mysql://")) {
            return withMysqlDefaults(trimmed);
        }
        if (trimmed.startsWith("mysql://")) {
            return withMysqlDefaults("jdbc:" + trimmed);
        }

        Credentials credentials = credentialsFromUrl(trimmed);
        if (credentials == null) {
            return trimmed;
        }
        String host = credentials.host();
        int port = credentials.port();
        String database = credentials.database();
        if (!isNotBlank(host) || !isNotBlank(database)) {
            return trimmed;
        }
        return withMysqlDefaults("jdbc:mysql://" + host + ":" + (port > 0 ? port : 3306) + "/" + database);
    }

    private static String withMysqlDefaults(String jdbcUrl) {
        if (jdbcUrl.contains("?")) {
            return jdbcUrl;
        }
        return jdbcUrl + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    }

    private static Credentials credentialsFromUrl(String rawUrl) {
        if (!isNotBlank(rawUrl)) {
            return null;
        }
        try {
            String normalized = rawUrl.trim();
            if (normalized.startsWith("jdbc:")) {
                normalized = normalized.substring("jdbc:".length());
            }
            URI uri = new URI(normalized);
            String userInfo = uri.getUserInfo();
            String user = null;
            String password = null;
            if (isNotBlank(userInfo)) {
                String[] parts = userInfo.split(":", 2);
                user = parts[0];
                password = parts.length > 1 ? parts[1] : null;
            }

            String path = uri.getPath();
            String database = path == null ? null : path.replaceFirst("^/", "");
            return new Credentials(user, password, uri.getHost(), uri.getPort(), database);
        } catch (URISyntaxException ignored) {
            return null;
        }
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private record Credentials(String user, String password, String host, int port, String database) {
    }
}
