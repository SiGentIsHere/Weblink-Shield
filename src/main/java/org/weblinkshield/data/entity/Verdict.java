package org.weblinkshield.data.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "verdict")
public class Verdict {
    public enum Status { safe, suspicious, malicious, unknown }
    public enum ClassLabel { benign, phishing, malware, scam, unknown }

    @Id
    private Long urlId; // primary key = FK to url.id

    @OneToOne(fetch = FetchType.LAZY) @MapsId
    @JoinColumn(name = "url_id")
    private Url url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status verdict = Status.unknown;

    @Enumerated(EnumType.STRING)
    @Column(name = "class", nullable = false)
    private ClassLabel clazz = ClassLabel.unknown;

    private Double score;                 // total points
    @Column(columnDefinition = "json")
    private String reasonsJson;           // array of rule hits
    @Column(nullable = false)
    private Instant ts = Instant.now();   // updated each save

    // getters/setters
    public Long getUrlId() { return urlId; }
    public Url getUrl() { return url; }
    public void setUrl(Url url) { this.url = url; }
    public Status getVerdict() { return verdict; }
    public void setVerdict(Status verdict) { this.verdict = verdict; }
    public ClassLabel getClazz() { return clazz; }
    public void setClazz(ClassLabel clazz) { this.clazz = clazz; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public String getReasonsJson() { return reasonsJson; }
    public void setReasonsJson(String reasonsJson) { this.reasonsJson = reasonsJson; }
    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
}
