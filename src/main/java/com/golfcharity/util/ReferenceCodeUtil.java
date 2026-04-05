package com.golfcharity.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

public final class ReferenceCodeUtil {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss", Locale.ENGLISH);

    private ReferenceCodeUtil() {
    }

    public static String next(String prefix) {
        String compactPrefix = prefix == null || prefix.isBlank() ? "PAY" : prefix.trim().toUpperCase(Locale.ENGLISH);
        String randomSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ENGLISH);
        return compactPrefix + "-" + LocalDateTime.now().format(FORMATTER) + "-" + randomSuffix;
    }
}

