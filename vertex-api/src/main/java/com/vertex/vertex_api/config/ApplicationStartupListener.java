package com.vertex.vertex_api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class ApplicationStartupListener {

    private static final Logger log = LoggerFactory.getLogger(ApplicationStartupListener.class);

    private final Environment environment;

    public ApplicationStartupListener(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("========== APPLICATION STARTUP DEBUG INFO ==========");
        log.info("Active Profiles: {}", Arrays.toString(environment.getActiveProfiles()));
        log.info("Default Profiles: {}", Arrays.toString(environment.getDefaultProfiles()));

        String frontendUrl = environment.getProperty("cors.allowed-origin");
        log.info("CORS Frontend URL: {}", frontendUrl != null ? frontendUrl : "NOT SET");

        String jwtSecret = environment.getProperty("jwt.secret");
        log.info("JWT Secret configured: {}", jwtSecret != null && !jwtSecret.isEmpty());

        String datasourceUrl = environment.getProperty("spring.datasource.url");
        log.info("Database URL configured: {}", datasourceUrl != null && !datasourceUrl.isEmpty());

        log.info("Application is ready to accept requests!");
        log.info("====================================================");
    }
}

