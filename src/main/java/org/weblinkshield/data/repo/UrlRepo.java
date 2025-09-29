package org.weblinkshield.data.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.weblinkshield.data.entity.Url;

import java.util.Optional;

public interface UrlRepo extends JpaRepository<Url, Long> {
    Optional<Url> findByUrlCanon(String urlCanon);
}
