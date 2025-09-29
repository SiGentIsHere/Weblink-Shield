package org.weblinkshield.core.rules;

import org.weblinkshield.data.entity.HostIntel;

import java.util.ArrayList;
import java.util.List;

/**
 * Minimal, explainable rule-based scorer.
 * Returns an integer score; higher = riskier.
 * Caller decides thresholds for safe/suspicious/malicious.
 */
public class RulesEngine {

    /** Single rule hit detail (for explain UI) */
    public static class Hit {
        public final String name;
        public final int weight;
        public final String reason;
        public Hit(String name, int weight, String reason) {
            this.name = name; this.weight = weight; this.reason = reason;
        }
    }

    /** Helper to create a fresh, mutable hits list. */
    public List<Hit> newHits() { return new ArrayList<>(); }

    /**
     * Score URL using string heuristics + host intel.
     * @param canon canonical URL (scheme://host/path?sortedQuery)
     * @param hi may be null (when intel unavailable)
     * @param hits output list of rule hits
     * @return total score
     */
    public int score(String canon, HostIntel hi, List<Hit> hits) {
        int s = 0;

        // ----------------------------
        // URL string heuristics
        // ----------------------------
        if (canon == null || canon.isBlank()) {
            hits.add(new Hit("invalid_url", 50, "URL missing or blank"));
            return 50;
        }

        // Length
        if (canon.length() > 120) { s += add(hits, "long_url", 15, "URL length > 120"); }
        if (canon.length() > 200) { s += add(hits, "very_long_url", 10, "URL length > 200"); }

        // Digits
        long digitCount = canon.chars().filter(Character::isDigit).count();
        if (digitCount > 20)      { s += add(hits, "many_digits", 10, "Digit count > 20"); }
        if (digitCount > 40)      { s += add(hits, "very_many_digits", 10, "Digit count > 40"); }

        // Special characters / patterns commonly seen in phishing
        if (canon.contains("@"))  { s += add(hits, "at_symbol", 20, "'@' symbol present"); }
        if (canon.toLowerCase().contains("login")) { s += add(hits, "login_keyword", 5, "Contains 'login' keyword"); }

        // Path depth
        long slashes = canon.chars().filter(c -> c == '/').count();
        if (slashes > 8)          { s += add(hits, "many_paths", 10, "Many path segments"); }

        // ----------------------------
        // Host intel (may be null)
        // ----------------------------
        if (hi != null) {
            // Risky/free TLDs (example set; tune as you wish)
            String tld = safeLower(hi.getTld());
            if (tld != null && isRiskyTld(tld)) {
                s += add(hits, "risky_tld", 20, "High-risk/free TLD: " + tld);
            }

            // TLS presence & age
            Integer tlsAge = hi.getTlsAgeDays();
            if (tlsAge == null) {
                s += add(hits, "no_tls", 25, "No TLS certificate observed");
            } else {
                if (tlsAge < 30)      { s += add(hits, "young_tls", 10, "TLS cert age < 30 days"); }
                if (tlsAge < 7)       { s += add(hits, "very_young_tls", 10, "TLS cert age < 7 days"); }
            }

            // Domain age (when you implement WHOIS later)
            Integer domAge = hi.getDomainAgeDays();
            if (domAge != null) {
                if (domAge < 30)      { s += add(hits, "young_domain", 15, "Domain age < 30 days"); }
                if (domAge < 7)       { s += add(hits, "very_young_domain", 10, "Domain age < 7 days"); }
            }

            // Missing IP resolution
            if (hi.getIp() == null || hi.getIp().isBlank()) {
                s += add(hits, "no_dns", 10, "No A/AAAA record resolved");
            }
        } else {
            // No intel (network blocked or collector disabled)
            s += add(hits, "no_host_intel", 5, "Host intel unavailable");
        }

        return s;
    }

    // ----------------------------
    // Helpers
    // ----------------------------

    private static int add(List<Hit> hits, String name, int weight, String reason) {
        hits.add(new Hit(name, weight, reason));
        return weight;
    }

    private static String safeLower(String s) {
        return (s == null) ? null : s.toLowerCase();
    }

    private static boolean isRiskyTld(String tld) {
        // Curated starter list; expand/tune as needed
        return switch (tld) {
            case "tk", "ml", "ga", "cf", "gq",   // Freenom legacy
                 "top", "xyz", "work", "click", "country",
                 "zip", "review", "loan", "kim", "men", "party" -> true;
            default -> false;
        };
    }
}
