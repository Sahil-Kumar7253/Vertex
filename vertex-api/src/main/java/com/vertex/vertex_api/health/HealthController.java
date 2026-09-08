package com.vertex.vertex_api.health;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    @Value("${cors.allowed-origin:NOT_SET}")
    private String frontendUrl;

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check endpoint hit!");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Vertex API is running");
        response.put("activeProfile", activeProfile);
        response.put("frontendUrl", frontendUrl);
        response.put("timestamp", System.currentTimeMillis());

        log.info("Health check response: {}", response);
        return ResponseEntity.ok(response);
    }
}

