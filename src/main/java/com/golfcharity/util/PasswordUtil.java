package com.golfcharity.util;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public final class PasswordUtil {
    private static final String PREFIX = "pbkdf2";
    private static final int ITERATIONS = 120_000;
    private static final int SALT_BYTES = 16;
    private static final int HASH_BYTES = 32;

    private PasswordUtil() {
    }

    public static String hashPassword(String password) {
        byte[] salt = new byte[SALT_BYTES];
        new SecureRandom().nextBytes(salt);
        byte[] hash = pbkdf2(password.toCharArray(), salt, ITERATIONS, HASH_BYTES);
        return String.format(
            "%s$%d$%s$%s",
            PREFIX,
            ITERATIONS,
            Base64.getEncoder().encodeToString(salt),
            Base64.getEncoder().encodeToString(hash)
        );
    }

    public static boolean matches(String password, String storedHash) {
        if (password == null || storedHash == null || storedHash.isBlank()) {
            return false;
        }

        String[] parts = storedHash.split("\\$");
        if (parts.length != 4 || !PREFIX.equalsIgnoreCase(parts[0])) {
            return false;
        }

        int iterations = Integer.parseInt(parts[1]);
        byte[] salt = Base64.getDecoder().decode(parts[2].getBytes(StandardCharsets.UTF_8));
        byte[] expected = Base64.getDecoder().decode(parts[3].getBytes(StandardCharsets.UTF_8));
        byte[] actual = pbkdf2(password.toCharArray(), salt, iterations, expected.length);

        if (actual.length != expected.length) {
            return false;
        }

        int mismatch = 0;
        for (int i = 0; i < expected.length; i++) {
            mismatch |= expected[i] ^ actual[i];
        }
        return mismatch == 0;
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations, int bytes) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, bytes * 8);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Unable to hash password", ex);
        }
    }
}

