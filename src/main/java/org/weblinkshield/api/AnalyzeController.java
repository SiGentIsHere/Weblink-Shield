package org.weblinkshield.api;

import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.weblinkshield.core.service.AnalysisService;

import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
public class AnalyzeController {

    private final AnalysisService service;
    public AnalyzeController(AnalysisService service) { this.service = service; }

    public record AnalyzeRequest(@NotBlank String url) {}

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody AnalyzeRequest req) throws Exception {
        return service.analyze(req.url());
    }

    @GetMapping("/verdict")
    public ResponseEntity<?> verdict(@RequestParam String url) throws Exception {
        return service.getVerdict(url)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message","Not analyzed yet")));
    }
}
