package org.weblinkshield.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
public class AsyncConfig {
    @Bean
    public ExecutorService scanExecutor() {
        return Executors.newFixedThreadPool(4); // tune as needed
    }
}
