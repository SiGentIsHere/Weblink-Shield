package org.weblinkshield.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.weblinkshield.core.service.AnalysisService;

import java.util.Map;
import java.util.concurrent.ExecutorService;

@RestController
@RequestMapping("/api/v1")
@Validated
public class ScanController {

    private final ScanJobStore store;
    private final AnalysisService analysis;
    private final ExecutorService executor;
    private final ObjectMapper om = new ObjectMapper();

    public ScanController(ScanJobStore store, AnalysisService analysis, ExecutorService executor) {
        this.store = store; this.analysis = analysis; this.executor = executor;
    }

    public record ScanRequest(@NotBlank String url) {}

    @PostMapping("/scan")
    public Map<String,String> submit(@Valid @RequestBody ScanRequest req) {
        var job = store.create(req.url());
        // Start async work
        executor.submit(() -> runPipeline(job.id));
        return Map.of("jobId", job.id);
    }

    @GetMapping("/scan/{jobId}")
    public ResponseEntity<?> snapshot(@PathVariable String jobId) {
        var job = store.get(jobId);
        if (job == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of(
                "jobId", job.id,
                "status", job.status,
                "url", job.url,
                "data", safeRead(job.payloadJson)
        ));
    }

    @GetMapping(value="/scan/{jobId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> stream(@PathVariable String jobId) {
        var job = store.get(jobId);
        if (job == null) return ResponseEntity.notFound().build();
        var emitter = new SseEmitter(0L); // no timeout
        job.emitter = emitter;
        // send initial snapshot
        try {
            emitter.send(SseEmitter.event().name("snapshot").data(Map.of(
                    "status", job.status, "url", job.url, "data", safeRead(job.payloadJson)
            )));
        } catch (Exception ignored) {}
        emitter.onCompletion(() -> job.emitter = null);
        emitter.onTimeout(() -> job.emitter = null);
        return ResponseEntity.ok(emitter);
    }

    // ---- internal helpers ----

    private Object safeRead(String json) {
        try { return om.readTree(json); } catch (Exception e) { return Map.of(); }
    }

    // Simulated 3-stage pipeline calling your existing AnalysisService
    private void runPipeline(String jobId) {
        var job = store.get(jobId);
        if (job == null) return;

        try {
            // Stage 1: core (your current fast rules)
            job.status = ScanJobStore.Job.Status.CORE_RUNNING;
            push(job);

            var core = analysis.analyze(job.url); // returns map with verdict/score/reasons/url
            job.payloadJson = om.writeValueAsString(core);
            push(job);

            // Stage 2: static (placeholder now; will implement in Step 2)
            job.status = ScanJobStore.Job.Status.STATIC_RUNNING;
            push(job);
            // ... run static analyzers here later ...
            // job.payloadJson = om.writeValueAsString(updatedSnapshot); push(job);

            // Stage 3: sandbox (placeholder for Step 3)
            job.status = ScanJobStore.Job.Status.SANDBOX_RUNNING;
            push(job);
            // ... enqueue sandbox and maybe wait or finish immediately ...

            job.status = ScanJobStore.Job.Status.DONE;
            push(job);
        } catch (Exception e) {
            job.status = ScanJobStore.Job.Status.ERROR;
            try { job.payloadJson = om.writeValueAsString(Map.of("error", e.getMessage())); } catch (Exception ignored) {}
            push(job);
        } finally {
            // keep emitter open for client to reconnect; optional: complete it
            if (job.emitter != null) {
                try { job.emitter.complete(); } catch (Exception ignored) {}
                job.emitter = null;
            }
        }
    }

    private void push(ScanJobStore.Job job) {
        if (job.emitter == null) return;
        try {
            job.emitter.send(
                    SseEmitter.event()
                            .name("snapshot")
                            .data(Map.of("status", job.status, "url", job.url, "data", safeRead(job.payloadJson)))
            );
        } catch (Exception ignored) {
            // client disconnected; drop emitter
            try { job.emitter.complete(); } catch (Exception ignore) {}
            job.emitter = null;
        }
    }
}
