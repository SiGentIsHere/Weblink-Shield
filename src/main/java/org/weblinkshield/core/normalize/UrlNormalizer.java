package org.weblinkshield.core.normalize;

import java.net.IDN;
import java.net.URI;
import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;

public final class UrlNormalizer {
    private UrlNormalizer() {}

    public static String canon(String raw) {
        try {
            URI u = new URI(raw.trim());
            String scheme = Optional.ofNullable(u.getScheme()).orElse("http").toLowerCase();
            String host = IDN.toASCII(Optional.ofNullable(u.getHost()).orElse("")).toLowerCase();
            String path = Optional.ofNullable(u.getPath()).filter(p->!p.isEmpty()).orElse("/");
            String query = Optional.ofNullable(u.getQuery()).orElse(null);

            String base = scheme + "://" + host + path;
            if (query == null || query.isEmpty()) return base;

            // sort query params for stable canonicalization
            String sorted = Arrays.stream(query.split("&"))
                    .sorted()
                    .collect(Collectors.joining("&"));
            return base + "?" + sorted;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid URL: " + raw);
        }
    }
}
