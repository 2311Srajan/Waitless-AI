package com.waitless.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/v1/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, AtomicInteger> queueTracker = new ConcurrentHashMap<>();

    public QueueController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinQueue(
            @RequestBody Map<String, Object> request) {

        String locationId = String.valueOf(
                request.getOrDefault("locationId", "default"));

        int position = queueTracker
                .computeIfAbsent(locationId, key -> new AtomicInteger(0))
                .incrementAndGet();

        int estimatedWaitMinutes = position * 4;

        Map<String, Object> queueStatus = Map.of(
                "status", "Joined successfully",
                "locationId", locationId,
                "position", position,
                "estimatedWaitMinutes", estimatedWaitMinutes);

        messagingTemplate.convertAndSend(
                "/topic/queue-updates", queueStatus);

        return ResponseEntity.ok(queueStatus);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}