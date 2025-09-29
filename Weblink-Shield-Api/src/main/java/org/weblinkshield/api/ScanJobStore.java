package org.weblinkshield.api;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ScanJobStore {

    public static class Job {
        public enum Status { QUEUED, CORE_RUNNING, STATIC_RUNNING, SANDBOX_RUNNING, DONE, ERROR }
        public final String id;
        public final String url;
        public volatile Status status = Status.QUEUED;
        public volatile String payloadJson = "{}"; // latest snapshot (verdict/reasons/etc.)
        public final Instant created = Instant.now();
        public volatile SseEmitter emitter; // optional
        public Job(String id, String url) { this.id = id; this.url = url; }
    }

    private final Map<String, Job> jobs = new ConcurrentHashMap<>();

    public Job create(String url) {
        String id = UUID.randomUUID().toString();
        Job j = new Job(id, url);
        jobs.put(id, j);
        return j;
    }

    public Job get(String id) { return jobs.get(id); }
}
