package org.weblinkshield.data.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "url")
public class Url {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", unique = true, nullable = false)
    private String urlCanon;

    @Column(nullable = false, updatable = false)
    private Instant firstSeen = Instant.now();

    // getters/setters
    public Long getId() { return id; }
    public String getUrlCanon() { return urlCanon; }
    public void setUrlCanon(String urlCanon) { this.urlCanon = urlCanon; }
    public Instant getFirstSeen() { return firstSeen; }
}
