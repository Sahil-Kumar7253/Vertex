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
}
