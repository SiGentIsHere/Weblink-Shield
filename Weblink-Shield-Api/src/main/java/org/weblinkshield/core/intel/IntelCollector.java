package org.weblinkshield.core.intel;

import org.springframework.stereotype.Service;
import org.weblinkshield.data.entity.HostIntel;

import javax.net.ssl.HttpsURLConnection;
import java.net.*;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class IntelCollector {

    /**
     * Collect basic intel for a hostname:
     *  - resolve an IP (first A/AAAA)
     *  - fetch TLS cert and compute cert age in days (if HTTPS reachable)
     *
     * Returns a HostIntel instance (fields may be null).
     */
    public HostIntel collect(String host) {
        HostIntel hi = new HostIntel();
        try {
            hi.setDomain(host);
            String[] parts = host.split("\\.");
            hi.setTld(parts.length > 0 ? parts[parts.length - 1] : null);

            // DNS: pick first IP
            InetAddress[] addrs = InetAddress.getAllByName(host);
            if (addrs != null && addrs.length > 0) {
                hi.setIp(addrs[0].getHostAddress());
            }
        } catch (Exception ignored) {}

        // TLS: attempt a quick HTTPS connection to get server cert
        try {
            URL u = new URL("https://" + host + "/");
            HttpsURLConnection conn = (HttpsURLConnection) u.openConnection();
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            conn.setInstanceFollowRedirects(false);
            conn.connect();

            Certificate[] certs = conn.getServerCertificates();
            if (certs != null && certs.length > 0 && certs[0] instanceof X509Certificate xc) {
                X509Certificate x509 = (X509Certificate) certs[0];
                Date notBefore = x509.getNotBefore();
                long days = Duration.between(notBefore.toInstant(), Instant.now()).toDays();
                hi.setTlsAgeDays((int) Math.max(0, days));
                hi.setTlsIssuer(x509.getIssuerX500Principal().getName());
            }
            conn.disconnect();
        } catch (Exception ignored) {
            // leave TLS fields null if not reachable or no cert
        }

        // Domain age (WHOIS) — simplified: leave null for now OR you can call a WHOIS service later
        hi.setDomainAgeDays(null);

        hi.setFetchedAt(Instant.now());
        return hi;
    }
}
