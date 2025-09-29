package org.weblinkshield.core.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.weblinkshield.core.intel.IntelCollector;
import org.weblinkshield.core.normalize.UrlNormalizer;
import org.weblinkshield.core.rules.RulesEngine;
import org.weblinkshield.data.entity.HostIntel;
import org.weblinkshield.data.entity.Url;
import org.weblinkshield.data.entity.Verdict;
import org.weblinkshield.data.repo.HostIntelRepo;
import org.weblinkshield.data.repo.UrlRepo;
import org.weblinkshield.data.repo.VerdictRepo;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnalysisService {

    private final UrlRepo urlRepo;
    private final VerdictRepo verdictRepo;
    private final HostIntelRepo hostIntelRepo;
    private final IntelCollector intelCollector;

    private final RulesEngine rules = new RulesEngine();
    private final ObjectMapper om = new ObjectMapper();

    // Constructor injection for all dependencies
    public AnalysisService(UrlRepo urlRepo,
                           VerdictRepo verdictRepo,
                           HostIntelRepo hostIntelRepo,
                           IntelCollector intelCollector) {
        this.urlRepo = urlRepo;
        this.verdictRepo = verdictRepo;
        this.hostIntelRepo = hostIntelRepo;
        this.intelCollector = intelCollector;
    }

    @Transactional
    public Map<String, Object> analyze(String rawUrl) throws Exception {
        // 1) Canonicalize URL (throws IllegalArgumentException if invalid)
        String canon = UrlNormalizer.canon(rawUrl);

        // 2) Upsert URL row
        Url url = urlRepo.findByUrlCanon(canon).orElseGet(() -> {
            Url u = new Url();
            u.setUrlCanon(canon);
            return urlRepo.save(u);
        });

        // 3) Collect / load host intel (simple strategy: create if missing)
        String host = URI.create(canon).getHost();
        HostIntel hi = hostIntelRepo.findById(url.getId()).orElseGet(() -> {
            HostIntel h = intelCollector.collect(host);
            h.setUrl(url); // bind FK
            return hostIntelRepo.save(h);
        });

        // 4) Run rules (explainable hits)
        List<RulesEngine.Hit> hits = rules.newHits();
        int score = rules.score(canon, hi, hits);   // <— uses HostIntel-aware rules

        // 5) Upsert verdict
        Verdict v = verdictRepo.findById(url.getId()).orElse(new Verdict());
        v.setUrl(url);
        v.setScore((double) score);
        v.setReasonsJson(om.writeValueAsString(hits));

        if (score >= 40) {
            v.setVerdict(Verdict.Status.malicious);
            v.setClazz(Verdict.ClassLabel.phishing);
        } else if (score >= 20) {
            v.setVerdict(Verdict.Status.suspicious);
            v.setClazz(Verdict.ClassLabel.unknown);
        } else {
            v.setVerdict(Verdict.Status.safe);
            v.setClazz(Verdict.ClassLabel.benign);
        }

        verdictRepo.save(v);

        // 6) Response payload
        return Map.of(
                "url", canon,
                "verdict", v.getVerdict().name(),
                "class", v.getClazz().name(),
                "score", v.getScore(),
                "reasons", om.readTree(v.getReasonsJson())
        );
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Optional<Map<String, Object>> getVerdict(String rawUrl) throws Exception {
        String canon = UrlNormalizer.canon(rawUrl);
        return urlRepo.findByUrlCanon(canon).flatMap(u ->
                verdictRepo.findById(u.getId()).map(v -> {
                    try {
                        return Map.of(
                                "url", v.getUrl().getUrlCanon(),
                                "verdict", v.getVerdict().name(),
                                "class", v.getClazz().name(),
                                "score", v.getScore(),
                                "reasons", om.readTree(v.getReasonsJson())
                        );
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
        );
    }
}
