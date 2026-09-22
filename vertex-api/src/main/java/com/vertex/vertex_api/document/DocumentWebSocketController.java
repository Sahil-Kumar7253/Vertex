package com.vertex.vertex_api.document;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class DocumentWebSocketController {
    public record DocumentUpdateDto(
            String content,
            String title,
            UUID senderId
    ){}

    public record PresencePayload(
            UUID userId,
            String email,
            String action // Can be "JOIN", "HERE", or "LEAVE"
    ) {}

    // Clients publish to: /app/documents/{documentId}/edit
    @MessageMapping("/documents/{documentId}/edit")
    // Broadcasts out to: /topic/documents/{documentId}
    @SendTo("/topic/documents/{documentId}")
    public DocumentUpdateDto broadcastUpdate(
            @DestinationVariable UUID documentId,
            @Payload DocumentUpdateDto updatePayload
    ) {
        // The broker instantly routes this payload to all subscribers
        return updatePayload;
    }

    @MessageMapping("/documents/{documentId}/presence")
    @SendTo("/topic/documents/{documentId}/presence")
    public PresencePayload broadcastPresence(
            @DestinationVariable UUID documentId,
            @Payload PresencePayload payload
    ) {
        return payload;
    }
}
