package org.weblinkshield.data.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.weblinkshield.data.entity.Verdict;

public interface VerdictRepo extends JpaRepository<Verdict, Long> {}
