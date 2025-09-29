package org.weblinkshield.data.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "host_intel")
public class HostIntel {

    @Id
    private Long urlId; // maps to url.id

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "url_id")
    private Url url;

    private String domain;
    private String tld;
    private String ip;         // single best IP as string (v4/v6)
    private Integer domainAgeDays;
    private Integer tlsAgeDays;
    private String tlsIssuer;
    private Instant fetchedAt = Instant.now();

    // getters / setters
    public Long getUrlId() { return urlId; }
    public Url getUrl() { return url; }
    public void setUrl(Url url) { this.url = url; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getTld() { return tld; }
    public void setTld(String tld) { this.tld = tld; }
    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public Integer getDomainAgeDays() { return domainAgeDays; }
    public void setDomainAgeDays(Integer domainAgeDays) { this.domainAgeDays = domainAgeDays; }
    public Integer getTlsAgeDays() { return tlsAgeDays; }
    public void setTlsAgeDays(Integer tlsAgeDays) { this.tlsAgeDays = tlsAgeDays; }
    public String getTlsIssuer() { return tlsIssuer; }
    public void setTlsIssuer(String tlsIssuer) { this.tlsIssuer = tlsIssuer; }
    public Instant getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(Instant fetchedAt) { this.fetchedAt = fetchedAt; }
}
