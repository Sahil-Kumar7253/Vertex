package com.vertex.vertex_api.document;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentResponseDto(
        UUID id,
        String title,
        String content,
        UUID workspaceId,
        UUID creatorId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) { }
